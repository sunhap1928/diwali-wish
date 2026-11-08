import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const PALETTE = ['#F2B544', '#E8743B', '#F7D27A', '#C9487C', '#5CA8F2', '#FBF1DE']

function rand(a, b) {
  return a + Math.random() * (b - a)
}
function pick(arr) {
  return arr[(Math.random() * arr.length) | 0]
}

class Spark {
  constructor(x, y, vx, vy, color, life, size) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.life = life
    this.maxLife = life
    this.color = color
    this.size = size
    this.gravity = 0.045
    this.drag = 0.985
  }
  step(dt) {
    this.vx *= this.drag
    this.vy = this.vy * this.drag + this.gravity
    this.x += this.vx
    this.y += this.vy
    this.life -= dt
  }
}

const FireworksCanvas = forwardRef(function FireworksCanvas({ reducedMotion, onExplode }, ref) {
  const canvasRef = useRef(null)
  const rocketsRef = useRef([])
  const sparksRef = useRef([])
  const starsRef = useRef([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const rocketTimerRef = useRef(null)
  const onExplodeRef = useRef(onExplode)

  useEffect(() => {
    onExplodeRef.current = onExplode
  }, [onExplode])

  function spawnRocket() {
    const { w, h } = sizeRef.current
    rocketsRef.current.push({
      x: rand(w * 0.15, w * 0.85),
      y: h + 10,
      targetY: rand(h * 0.18, h * 0.48),
      vy: rand(-7.4, -5.6),
      vx: rand(-0.4, 0.4),
      color: pick(PALETTE),
    })
  }

  function scheduleRocket() {
    const delay = reducedMotion ? rand(3800, 6000) : rand(900, 2100)
    rocketTimerRef.current = setTimeout(() => {
      spawnRocket()
      scheduleRocket()
    }, delay)
  }

  useImperativeHandle(ref, () => ({
    start() {
      for (let i = 0; i < 3; i++) {
        setTimeout(spawnRocket, i * 350)
      }
      scheduleRocket()
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const starCount = reducedMotion ? 70 : 140
    starsRef.current = Array.from({ length: starCount }, () => ({
      x: Math.random(),
      y: Math.random() * 0.75,
      r: rand(0.5, 1.6),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.2),
    }))

    function explode(x, y, color) {
      const count = reducedMotion ? 26 : 56
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.12, 0.12)
        const speed = rand(1.4, 4.6)
        sparksRef.current.push(
          new Spark(
            x,
            y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.random() < 0.25 ? pick(PALETTE) : color,
            rand(0.8, 1.5),
            rand(1.4, 2.6),
          ),
        )
      }
      if (onExplodeRef.current) onExplodeRef.current(x / sizeRef.current.w)
    }

    let lastTime = null
    let rafId = null

    function frame(ts) {
      const { w, h } = sizeRef.current
      if (lastTime === null) lastTime = ts
      const dt = Math.min((ts - lastTime) / 1000, 0.05)
      lastTime = ts

      ctx.fillStyle = 'rgba(10,6,16,0.28)'
      ctx.fillRect(0, 0, w, h)

      for (const st of starsRef.current) {
        const tw = 0.5 + 0.5 * Math.sin(ts * 0.001 * st.speed + st.phase)
        ctx.globalAlpha = 0.25 + tw * 0.65
        ctx.fillStyle = '#FBF1DE'
        ctx.beginPath()
        ctx.arc(st.x * w, st.y * h, st.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const rockets = rocketsRef.current
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.x += r.vx
        r.y += r.vy
        r.vy += 0.02
        sparksRef.current.push(new Spark(r.x, r.y, rand(-0.4, 0.4), rand(0.5, 1.2), r.color, 0.6, 1.6))
        if (r.vy >= -0.6 || r.y <= r.targetY) {
          explode(r.x, r.y, r.color)
          rockets.splice(i, 1)
        }
      }

      ctx.globalCompositeOperation = 'lighter'
      const sparks = sparksRef.current
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i]
        sp.step(dt)
        if (sp.life <= 0) {
          sparks.splice(i, 1)
          continue
        }
        const a = Math.max(sp.life / sp.maxLife, 0)
        ctx.globalAlpha = a
        ctx.fillStyle = sp.color
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1

      if (sparks.length > 900) sparks.splice(0, sparks.length - 900)

      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
      clearTimeout(rocketTimerRef.current)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="sky-canvas" />
})

export default FireworksCanvas
