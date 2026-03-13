import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pacientes', icon: Users, label: 'Pacientes' },
  { to: '/citas', icon: Calendar, label: 'Citas' },
  { to: '/servicios', icon: Stethoscope, label: 'Servicios' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 w-60 bg-slate-900 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">DentalApp</p>
          <p className="text-slate-400 text-xs">Sistema de Gestión</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">v1.0.0</p>
      </div>
    </aside>
  )
}
