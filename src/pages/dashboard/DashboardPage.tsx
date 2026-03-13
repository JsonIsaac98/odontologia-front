import { RefreshCw, Calendar, Users, CheckCircle, Clock, CheckCheck, XCircle, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCitasHoy } from '@/hooks/useCitas'
import { usePacientes } from '@/hooks/usePacientes'
import { useWhatsAppStatus } from '@/hooks/useWhatsApp'
import { useQueryClient } from '@tanstack/react-query'
import { formatTime } from '@/lib/utils'
import type { EstadoCita } from '@/types'

const estadoBadge: Record<EstadoCita, { label: string; variant: 'blue' | 'green' | 'red' | 'orange' }> = {
  programada: { label: 'Programada', variant: 'blue' },
  completada: { label: 'Completada', variant: 'green' },
  cancelada: { label: 'Cancelada', variant: 'red' },
  no_asistio: { label: 'No asistió', variant: 'orange' },
}

export function DashboardPage() {
  const { data: citasHoy, isLoading: loadingCitas } = useCitasHoy()
  const { data: pacientes, isLoading: loadingPacientes } = usePacientes({ limit: 1 })
  const { data: waStatus, isLoading: loadingWa, refetch: refetchWa } = useWhatsAppStatus()
  const qc = useQueryClient()

  const citasHoyArr = citasHoy ?? []
  const citasCompletadas = citasHoyArr.filter((c) => c.estado === 'completada').length
  const citasPendientes = citasHoyArr.filter((c) => c.estado === 'programada').length
  const totalPacientes = pacientes?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Citas hoy"
          value={loadingCitas ? null : citasHoyArr.length}
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          title="Pacientes totales"
          value={loadingPacientes ? null : totalPacientes}
          icon={<Users className="w-5 h-5 text-violet-600" />}
          color="bg-violet-50"
        />
        <StatCard
          title="Completadas hoy"
          value={loadingCitas ? null : citasCompletadas}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          title="Pendientes hoy"
          value={loadingCitas ? null : citasPendientes}
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla citas del día */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Citas del día</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCitas ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : citasHoyArr.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-slate-400">
                  <Calendar className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No hay citas programadas para hoy</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-slate-500 text-xs">
                        <th className="pb-2 text-left font-medium">Hora</th>
                        <th className="pb-2 text-left font-medium">Paciente</th>
                        <th className="pb-2 text-left font-medium">Servicio</th>
                        <th className="pb-2 text-left font-medium">Estado</th>
                        <th className="pb-2 text-center font-medium">Recordatorio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {citasHoyArr.map((cita) => {
                        const badge = estadoBadge[cita.estado]
                        return (
                          <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 font-medium text-slate-700">
                              {formatTime(cita.fecha_hora)}
                            </td>
                            <td className="py-2.5 text-slate-800">
                              {cita.paciente.nombre} {cita.paciente.apellido}
                            </td>
                            <td className="py-2.5 text-slate-500">
                              {cita.servicio?.nombre ?? <span className="italic text-slate-400">Sin servicio</span>}
                            </td>
                            <td className="py-2.5">
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                            </td>
                            <td className="py-2.5 text-center">
                              {cita.recordatorio_enviado ? (
                                <CheckCheck className="w-4 h-4 text-green-500 inline" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-300 inline" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp status */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estado WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWa ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-4 rounded-lg ${waStatus?.connected ? 'bg-green-50' : 'bg-red-50'}`}>
                    {waStatus?.connected ? (
                      <Wifi className="w-6 h-6 text-green-600 shrink-0" />
                    ) : (
                      <WifiOff className="w-6 h-6 text-red-500 shrink-0" />
                    )}
                    <div>
                      <p className={`font-medium text-sm ${waStatus?.connected ? 'text-green-800' : 'text-red-800'}`}>
                        {waStatus?.connected ? 'Conectado' : 'Desconectado'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{waStatus?.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      qc.invalidateQueries({ queryKey: ['whatsapp', 'status'] })
                      refetchWa()
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refrescar estado
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number | null
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
            {value === null ? (
              <Skeleton className="h-8 w-12 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            )}
          </div>
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
