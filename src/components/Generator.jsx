import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Share2, Volume2, VolumeX, Sparkles, Download, RefreshCw } from 'lucide-react'

const moods = ["Romantic", "Melancholic", "Hopeful", "Dreamlike", "Haunting"]
const formats = ["Poem", "Short Story", "Haiku", "Microfiction"]

export default function Generator() {
  const [prompt, setPrompt] = useState("")
  const [mood, setMood] = useState("Dreamlike")
  const [format, setFormat] = useState("Poem")
  const [result, setResult] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const audioCtxRef = useRef(null)
  const ambientNodesRef = useRef({})

  useEffect(() => {
    return () => stopAmbient()
  }, [])

  async function handleGenerate(e) {
    e?.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setResult("")
    setImageUrl("")
    try {
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const res = await fetch(`${base}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mood, format }),
      })
      const data = await res.json()
      if (data && data.content) setResult(data.content)
      if (data && data.image_url) setImageUrl(data.image_url)
    } catch (err) {
      setResult("The muse is quiet right now. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  async function regenerateImage() {
    if (!prompt.trim()) return
    try {
      setImgLoading(true)
      const base = import.meta.env.VITE_BACKEND_URL || ''
      const res = await fetch(`${base}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mood }),
      })
      const data = await res.json()
      if (data && data.image_url) setImageUrl(`${data.image_url}&t=${Date.now()}`)
    } catch {}
    finally {
      setImgLoading(false)
    }
  }

  // Web Speech + soft ambient pad
  function speak(text) {
    if (!('speechSynthesis' in window)) return
    stopAmbient()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 0.95
    utter.pitch = 1.05
    utter.volume = 0.9
    const voice = speechSynthesis.getVoices().find(v => /en|US|UK/i.test(v.lang))
    if (voice) utter.voice = voice
    utter.onend = () => {
      setSpeaking(false)
      stopAmbient()
    }
    setSpeaking(true)
    startAmbient()
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  function stopSpeak() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
    stopAmbient()
  }

  function startAmbient() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc1.type = 'sine'; osc2.type = 'sine'
      osc1.frequency.value = 220
      osc2.frequency.value = 277.18

      filter.type = 'lowpass'
      filter.frequency.value = 1200

      gain.gain.value = 0.03
      lfo.frequency.value = 0.09
      lfoGain.gain.value = 8

      lfo.connect(lfoGain)
      lfoGain.connect(osc2.detune)
      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(); osc2.start(); lfo.start()

      ambientNodesRef.current = { osc1, osc2, lfo, gain, filter }
    } catch {}
  }

  function stopAmbient() {
    try {
      const nodes = ambientNodesRef.current
      Object.values(nodes).forEach((n) => {
        if (n && typeof n.stop === 'function') {
          try { n.stop() } catch {}
        }
        if (n && typeof n.disconnect === 'function') {
          try { n.disconnect() } catch {}
        }
      })
      ambientNodesRef.current = {}
    } catch {}
  }

  const lines = useMemo(() => result.split('\n').filter(Boolean), [result])

  async function downloadImage() {
    try {
      const resp = await fetch(imageUrl, { mode: 'no-cors' })
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dreamink-image.jpg'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(imageUrl, '_blank')
    }
  }

  function downloadText() {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dreamink.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="relative mx-auto -mt-24 max-w-5xl px-6">
      <form onSubmit={handleGenerate} className="relative rounded-2xl border border-indigo-400/20 bg-[#0d0b16]/70 p-4 backdrop-blur-md shadow-[0_0_40px_rgba(120,90,200,0.25)]">
        <div className="flex flex-col gap-3 md:flex-row">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A memory, a color, the shape of a feeling..."
            className="flex-1 min-h-[110px] resize-y rounded-xl border border-indigo-300/20 bg-white/5 p-4 text-indigo-100 placeholder:text-indigo-200/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 font-sans"
          />
          <div className="flex w-full md:w-72 flex-col gap-3">
            <select value={mood} onChange={(e) => setMood(e.target.value)} className="rounded-xl border border-indigo-300/20 bg-white/5 p-3 text-indigo-100">
              {moods.map((m) => (
                <option key={m} value={m} className="bg-[#0d0b16]">{m}</option>
              ))}
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-xl border border-indigo-300/20 bg-white/5 p-3 text-indigo-100">
              {formats.map((f) => (
                <option key={f} value={f} className="bg-[#0d0b16]">{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-indigo-200/60">DreamInk gently shapes your idea with mood and form.</p>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 font-medium text-white shadow-[0_8px_30px_rgba(99,102,241,0.45)] transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="absolute inset-0 rounded-full ring-2 ring-amber-300/0 group-hover:ring-amber-300/40 transition" />
            <Sparkles className={`h-4 w-4 ${loading ? 'animate-spin' : 'animate-pulse group-hover:animate-none'}`} />
            {loading ? 'Weaving...' : 'Generate'}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-6 rounded-2xl border border-indigo-300/20 bg-gradient-to-b from-white/5 to-white/[0.03] p-5 backdrop-blur-md shadow-[0_0_40px_rgba(187,134,252,0.25)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-amber-200/80">Result</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="rounded-full bg-white/5 p-2 text-indigo-100 hover:bg-white/10"
                  aria-label="Copy Text"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={downloadText} className="rounded-full bg-white/5 p-2 text-indigo-100 hover:bg-white/10" aria-label="Download Text">
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (navigator.share) {
                      try { await navigator.share({ text: result, title: 'DreamInk' }) } catch {}
                    } else {
                      await navigator.clipboard.writeText(result)
                      alert('Copied to clipboard')
                    }
                  }}
                  className="rounded-full bg-white/5 p-2 text-indigo-100 hover:bg-white/10"
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                {!speaking ? (
                  <button onClick={() => speak(result)} className="rounded-full bg-white/5 p-2 text-indigo-100 hover:bg-white/10" aria-label="Read Aloud">
                    <Volume2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={stopSpeak} className="rounded-full bg-white/5 p-2 text-indigo-100 hover:bg-white/10" aria-label="Stop">
                    <VolumeX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="font-serif text-lg leading-8 text-indigo-50">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: i * 0.18 }}
                  className="[text-shadow:0_0_12px_rgba(167,139,250,0.35)] hover:[text-shadow:0_0_16px_rgba(250,250,255,0.45)] transition-shadow"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {imageUrl && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-widest text-amber-200/80">Artwork</div>
                  <div className="flex items-center gap-2">
                    <button onClick={regenerateImage} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm text-indigo-100 hover:bg-white/10 disabled:opacity-50" disabled={imgLoading}>
                      <RefreshCw className={`h-4 w-4 ${imgLoading ? 'animate-spin' : ''}`} /> Regenerate
                    </button>
                    <button onClick={downloadImage} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm text-indigo-100 hover:bg-white/10">
                      <Download className="h-4 w-4" /> Download
                    </button>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="overflow-hidden rounded-2xl border border-indigo-300/20 bg-black/30"
                >
                  <motion.img
                    key={imageUrl}
                    src={imageUrl}
                    alt="DreamInk artwork"
                    className="h-auto w-full object-cover"
                    initial={{ scale: 1.04 }}
                    animate={{ scale: [1.04, 1.0, 1.04] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
