'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Home } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface AuthScreenProps {
  onLogin: (user: any) => void
  onSkip: () => void
}

export function AuthScreen({ onLogin, onSkip }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email va parolni kiriting')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) throw authError
      if (data.user) {
        onLogin(data.user)
      }
    } catch (err: any) {
      setError(err.message || 'Kirish xatoligi')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Email va parolni kiriting')
      return
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })
      if (authError) throw authError
      if (data.user) {
        // Update profile with full name
        if (fullName) {
          await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', data.user.id)
        }
        setSuccess('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
        setTimeout(() => onLogin(data.user!), 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Ro\'yxatdan o\'tish xatoligi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent-blue/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-gold/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black tracking-tighter mb-2"
          >
            UY JOY
          </motion.h1>
          <p className="text-[10px] text-accent-blue uppercase tracking-[0.4em] font-black">
            Qashqadaryo • Ko'chmas Mulk
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 glass rounded-2xl p-1.5">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'login'
                ? 'bg-white text-black shadow-xl'
                : 'text-neutral-500 hover:text-neutral-300'
              }`}
          >
            Kirish
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess('') }}
            className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${mode === 'register'
                ? 'bg-white text-black shadow-xl'
                : 'text-neutral-500 hover:text-neutral-300'
              }`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                <input
                  type="text"
                  placeholder="To'liq ism"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-neutral-900/80 border border-white/5 rounded-2xl py-4.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue/40 transition-colors placeholder:text-neutral-600"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-900/80 border border-white/5 rounded-2xl py-4.5 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-blue/40 transition-colors placeholder:text-neutral-600"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Parol"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
                className="w-full bg-neutral-900/80 border border-white/5 rounded-2xl py-4.5 pl-12 pr-12 text-sm focus:outline-none focus:border-accent-blue/40 transition-colors placeholder:text-neutral-600"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-xs mt-4 text-center font-bold"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-400 text-xs mt-4 text-center font-bold"
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
          className="w-full mt-8 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-2xl"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="w-full mt-4 py-4 rounded-2xl glass border-white/5 text-neutral-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:text-neutral-300 hover:border-accent-blue/20 transition-all"
        >
          <Home size={14} />
          Kirmasdan davom etish
        </button>

        {/* Footer hint */}
        <p className="text-center text-[9px] text-neutral-700 mt-8 uppercase tracking-widest">
          {mode === 'login'
            ? 'Hisobingiz yo\'qmi? Yuqoridan ro\'yxatdan o\'ting'
            : 'Allaqachon hisobingiz bormi? Yuqoridan kiring'}
        </p>
      </motion.div>
    </div>
  )
}
