import React, { useEffect, useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, -60])
  const opacity = useTransform(scrollY, [0, 400], [1, 0.85])

  // Subtle mouse parallax for overlay text
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--dx', `${relX * 8}px`)
      el.style.setProperty('--dy', `${relY * 6}px`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section ref={containerRef} className="relative h-[90vh] w-full overflow-hidden bg-[#0b0a12]">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/kqB-rdL4TCJ7pyGb/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      {/* Gradient veil to lean into indigo/lilac tone while keeping Spline visible */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(31,24,65,0.35),rgba(10,8,20,0.85))] mix-blend-multiply" />

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6">
        <div
          className="text-left"
          style={{
            transform: 'translate3d(var(--dx, 0), var(--dy, 0), 0)',
            transition: 'transform 120ms ease-out',
          }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-indigo-200 to-violet-300 drop-shadow-[0_0_12px_rgba(187,134,252,0.25)]">
            Write with the Muse of Machines.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-indigo-100/90">
            Type a thought, and let DreamInk turn it into art.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-white/5 px-4 py-2 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300 shadow-[0_0_16px_4px_rgba(252,211,77,0.5)]" />
            <span className="text-sm text-indigo-100/80">Calming • Magical • Intelligent</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
