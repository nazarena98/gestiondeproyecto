import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center font-sans">
      <div className="text-center max-w-md px-6">
        <p className="text-[80px] font-black text-slate-100 leading-none mb-2">404</p>
        <h1 className="text-[22px] font-bold text-slate-700 mb-3">Página no encontrada</h1>
        <p className="text-[14px] text-slate-400 mb-8">
          Esta sección todavía no existe o la URL es incorrecta.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-brand text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
        >
          <LayoutDashboard size={15} />
          Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
