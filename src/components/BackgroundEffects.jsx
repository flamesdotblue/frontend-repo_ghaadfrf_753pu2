import React, { useEffect, useRef } from 'react'

// Soft, drifting particles like fireflies / ink motes
export default function BackgroundEffects() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf

    const DPR = Math.min(2, window.devicePixelRatio || 1)
    function resize() {
      canvas.width = Math.floor(canvas.clientWidth * DPR)
      canvas.height = Math.floor(canvas.clientHeight * DPR)
    }
    resize()
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    const count = 80
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.7 + Math.random() * 2.2,
      a: 0.25 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      hue: 250 + Math.random() * 50,
    }))

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -50) p.x = canvas.width + 50
        if (p.x > canvas.width + 50) p.x = -50
        if (p.y < -50) p.y = canvas.height + 50
        if (p.y > canvas.height + 50) p.y = -50

        // gentle twinkle
        p.a += (Math.random() - 0.5) * 0.02
        p.a = Math.max(0.12, Math.min(0.65, p.a))

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6)
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${p.a})`)
        grad.addColorStop(1, `hsla(${p.hue + 40}, 80%, 50%, 0) `)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Soft indigo-lilac vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(99,102,241,0.15),rgba(139,92,246,0.05)_40%,transparent_70%)]" />
    </div>
  )
}
