import Link from 'next/link'
import { type LucideIcon, ArrowLeft, Construction } from 'lucide-react'
import { MainLayout } from './MainLayout'
import { TopBar } from './TopBar'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  description: string
  icon: LucideIcon
  module: string
  features: string[]
}

export function PlaceholderPage({
  title, subtitle, description, icon: Icon, module, features,
}: PlaceholderPageProps) {
  return (
    <MainLayout>
      <TopBar greeting={title} subtitle={subtitle} />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Icon size={36} className="text-brand" />
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            <Construction size={11} />
            Módulo {module} — En desarrollo
          </span>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-slate-800 mb-3">{title}</h1>
          <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">{description}</p>

          {/* Features list */}
          <div className="card p-5 mb-8 text-left">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Funcionalidades planificadas
            </p>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/40 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-brand text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
          >
            <ArrowLeft size={15} />
            Volver al Dashboard
          </Link>
        </div>
      </main>
    </MainLayout>
  )
}
