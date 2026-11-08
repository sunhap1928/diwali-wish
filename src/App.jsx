import { useCallback, useRef, useState } from 'react'
import FireworksCanvas from './components/FireworksCanvas'
import StartStage from './components/StartStage'
import Greeting from './components/Greeting'
import SoundToggle from './components/SoundToggle'
import useAmbientAudio from './hooks/useAmbientAudio'
import './App.css'

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function App() {
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const fireworksRef = useRef(null)
  const audio = useAmbientAudio()

  const handleExplode = useCallback(
    (panPos) => {
      audio.crackle(panPos)
    },
    [audio],
  )

  function handleStart() {
    if (started) return
    setStarted(true)
    audio.start()
    fireworksRef.current?.start()
  }

  function handleToggleMute() {
    setMuted((prev) => {
      const next = !prev
      audio.setMuted(next)
      return next
    })
  }

  return (
    <>
      <FireworksCanvas ref={fireworksRef} reducedMotion={reducedMotion} onExplode={handleExplode} />

      <StartStage visible={!started} onStart={handleStart} />

      <main className={started ? 'visible' : ''}>
        <Greeting />
      </main>

      <SoundToggle visible={started} muted={muted} onToggle={handleToggleMute} />
    </>
  )
}
