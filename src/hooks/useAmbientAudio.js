import { useCallback, useRef } from 'react'

const RAGA = [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25] // bhairav-ish

function rand(a, b) {
  return a + Math.random() * (b - a)
}

export default function useAmbientAudio() {
  const ctxRef = useRef(null)
  const masterRef = useRef(null)
  const noiseBufferRef = useRef(null)
  const bellTimerRef = useRef(null)
  const mutedRef = useRef(false)

  const playBell = useCallback((freq, when, vol) => {
    const audioCtx = ctxRef.current
    const master = masterRef.current

    const osc = audioCtx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const osc2 = audioCtx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.value = freq * 2.01

    const g = audioCtx.createGain()
    g.gain.setValueAtTime(0, when)
    g.gain.linearRampToValueAtTime(vol, when + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0008, when + 2.4)

    const g2 = audioCtx.createGain()
    g2.gain.value = 0.3

    osc2.connect(g2)
    g2.connect(g)
    osc.connect(g)
    g.connect(master)

    osc.start(when)
    osc.stop(when + 2.6)
    osc2.start(when)
    osc2.stop(when + 2.6)
  }, [])

  const scheduleBells = useCallback(() => {
    const audioCtx = ctxRef.current
    if (!audioCtx) return
    const now = audioCtx.currentTime
    if (Math.random() < 0.75) {
      const freq = RAGA[(Math.random() * RAGA.length) | 0]
      playBell(freq, now + 0.05, rand(0.05, 0.1))
      if (Math.random() < 0.4) playBell(freq * 1.5, now + 0.4, rand(0.03, 0.06))
    }
    bellTimerRef.current = setTimeout(scheduleBells, rand(1400, 3200))
  }, [playBell])

  const start = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
      return
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    const audioCtx = new AudioContextCtor()
    ctxRef.current = audioCtx

    const master = audioCtx.createGain()
    master.gain.value = 0.8
    master.connect(audioCtx.destination)
    masterRef.current = master

    // soft pad drone
    const droneGain = audioCtx.createGain()
    droneGain.gain.value = 0.05
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    droneGain.connect(filter)
    filter.connect(master)
    ;[130.81, 196.0, 261.63].forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      osc.type = i === 1 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      const g = audioCtx.createGain()
      g.gain.value = i === 0 ? 0.6 : 0.35
      osc.connect(g)
      g.connect(droneGain)
      osc.start()

      const lfo = audioCtx.createOscillator()
      lfo.frequency.value = 0.05 + i * 0.02
      const lfoGain = audioCtx.createGain()
      lfoGain.gain.value = 300
      lfo.connect(lfoGain)
      lfoGain.connect(filter.frequency)
      lfo.start()
    })

    // noise buffer for soft crackle bursts on each firework explosion
    const bufferSize = audioCtx.sampleRate * 0.3
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 2
    }
    noiseBufferRef.current = noiseBuffer

    scheduleBells()
  }, [scheduleBells])

  const setMuted = useCallback((next) => {
    mutedRef.current = next
    const audioCtx = ctxRef.current
    const master = masterRef.current
    if (audioCtx && master) {
      master.gain.cancelScheduledValues(audioCtx.currentTime)
      master.gain.linearRampToValueAtTime(next ? 0 : 0.8, audioCtx.currentTime + 0.4)
    }
  }, [])

  const crackle = useCallback((panPos) => {
    const audioCtx = ctxRef.current
    const master = masterRef.current
    const noiseBuffer = noiseBufferRef.current
    if (!audioCtx || !noiseBuffer || mutedRef.current) return

    const src = audioCtx.createBufferSource()
    src.buffer = noiseBuffer
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = rand(1800, 3600)
    const g = audioCtx.createGain()
    g.gain.value = rand(0.02, 0.05)

    src.connect(filter)
    filter.connect(g)

    if (audioCtx.createStereoPanner) {
      const panner = audioCtx.createStereoPanner()
      panner.pan.value = Math.max(-1, Math.min(1, (panPos - 0.5) * 2))
      g.connect(panner)
      panner.connect(master)
    } else {
      g.connect(master)
    }
    src.start()
  }, [])

  return { start, setMuted, crackle }
}
