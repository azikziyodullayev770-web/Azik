'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'

interface SplashScreenProps {
  onComplete: (lang: string) => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState<'loading' | 'language'>('loading')
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => setStep('language'), 2500)
      return () => clearTimeout(timer)
    }
  }, [step])

  const languages = [
    { code: 'en', name: 'English', label: 'US' },
    { code: 'ru', name: 'Русский', label: 'RU' },
    { code: 'uz', name: "O'zbek", label: 'UZ' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/10 to-transparent opacity-50 pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Logo Glow Animation */}
            <div className="relative h-20 w-20">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-2xl bg-accent-blue blur-xl opacity-30"
              />
              <div className="relative flex h-full w-full items-center justify-center rounded-2xl glass border-accent-blue/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-[0.2em] text-white">UY JOY</h1>
              <p className="mt-1 text-[10px] font-bold text-accent-blue tracking-[0.3em] uppercase">
                Sotish va sotib olish
              </p>
            </div>

            {/* Progress Bar */}
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="h-full w-1/2 bg-accent-blue glow-blue shadow-[0_0_10px_#00E5FF]"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="language"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xs text-center"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex justify-center mb-6"
            >
              <Globe className="text-accent-blue" size={48} strokeWidth={1.5} />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Tilni tanlang</h2>
            <p className="text-sm text-neutral-400 mb-8">O'zingizga qulay tilni tanlang</p>

            <div className="flex flex-col gap-3">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedLang(lang.code)
                    onComplete(lang.code)
                  }}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 ${
                    selectedLang === lang.code 
                      ? 'bg-accent-blue text-black font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                      : 'glass border-white/5 text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="w-8 text-sm font-mono font-bold opacity-50">{lang.label}</span>
                  <span className="text-lg font-medium">{lang.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
