'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { CREDENTIALS } from '@/context/AppContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAppContext()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = login(username.trim(), password)
    if (ok) {
      router.replace('/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos.')
      setLoading(false)
    }
  }

  const users = Object.entries(CREDENTIALS).map(([uname, { userId }]) => ({ uname, userId }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#12152A] to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-black text-[20px]">N</span>
          </div>
          <h1 className="text-[22px] font-black text-white">Nazarena PPM</h1>
          <p className="text-[13px] text-slate-400 mt-1">Digital Agency · Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-[17px] font-bold text-slate-800 mb-5">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  required
                  autoFocus
                  placeholder="ej: nazarena"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  required
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-[12px] text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white text-[14px] font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Hint for demo */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Accesos de demo</p>
            <div className="grid grid-cols-2 gap-1.5">
              {users.map(({ uname }) => (
                <button
                  key={uname}
                  type="button"
                  onClick={() => { setUsername(uname); setPassword(CREDENTIALS[uname].password); setError('') }}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-brand/5 hover:text-brand transition-colors text-[11px] font-medium text-slate-600"
                >
                  {uname}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
