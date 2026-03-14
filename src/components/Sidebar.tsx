import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Stethoscope, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWhatsAppStatus } from '@/hooks/useWhatsApp'

const mainItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pacientes', icon: Users,            label: 'Pacientes' },
  { to: '/citas',     icon: Calendar,         label: 'Citas'     },
  { to: '/servicios', icon: Stethoscope,      label: 'Servicios' },
]

export function Sidebar() {
  const { data: waStatus } = useWhatsAppStatus()
  const waConnected = waStatus?.connected ?? false

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
        {mainItems.map(({ to, icon: Icon, label }) => (
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

      {/* Configuración al fondo */}
      <div className="px-3 pb-3 border-t border-slate-700 pt-3">
        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          <div className="relative">
            <Settings className="w-4 h-4 shrink-0" />
            {/* Punto indicador de estado WhatsApp */}
            <span
              className={cn(
                'absolute -top-1 -right-1 w-2 h-2 rounded-full ring-1 ring-slate-900',
                waConnected ? 'bg-green-400' : 'bg-slate-500'
              )}
            />
          </div>
          Configuración
        </NavLink>
        <p className="text-slate-600 text-xs text-center mt-3">v1.0.0</p>
      </div>
    </aside>
  )
}
