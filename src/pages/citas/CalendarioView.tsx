import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  addMonths, subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Plus, Clock,
  Pencil, Trash2, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { BtnRecordatorio } from '@/components/BtnRecordatorio'
import { useCitasMes, useDeleteCita } from '@/hooks/useCitas'
import { CitaCalendarioForm } from './CitaCalendarioForm'
import { cn, formatTime } from '@/lib/utils'
import type { Cita, EstadoCita } from '@/types'

/* ─── colores por estado ─── */
const estadoColor: Record<EstadoCita, { dot: string; badge: 'blue' | 'green' | 'red' | 'orange'; label: string }> = {
  programada:  { dot: 'bg-blue-500',   badge: 'blue',   label: 'Programada'  },
  completada:  { dot: 'bg-green-500',  badge: 'green',  label: 'Completada'  },
  cancelada:   { dot: 'bg-red-500',    badge: 'red',    label: 'Cancelada'   },
  no_asistio:  { dot: 'bg-orange-500', badge: 'orange', label: 'No asistió'  },
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface Props {
  onEditCita: (cita: Cita) => void
}

export function CalendarioView({ onEditCita }: Props) {
  const { toast } = useToast()
  const [mes, setMes] = useState(() => new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Cita | null>(null)

  const { data: citasMes = [], isLoading } = useCitasMes(
    mes.getFullYear(),
    mes.getMonth()
  )
  const deleteMutation = useDeleteCita()

  /* ─── construir grilla del mes ─── */
  const diasGrilla = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 0 })
    const fin    = endOfWeek(endOfMonth(mes),     { weekStartsOn: 0 })
    return eachDayOfInterval({ start: inicio, end: fin })
  }, [mes])

  /* ─── mapa fecha → citas ─── */
  const citasPorDia = useMemo(() => {
    const map: Record<string, Cita[]> = {}
    citasMes.forEach((c) => {
      const key = format(new Date(c.fecha_hora), 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      map[key].push(c)
    })
    return map
  }, [citasMes])

  const citasDia = diaSeleccionado
    ? citasPorDia[format(diaSeleccionado, 'yyyy-MM-dd')] ?? []
    : []

  const seleccionarDia = (dia: Date) => {
    setDiaSeleccionado(dia)
    setSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast({ title: 'Cita eliminada correctamente' })
    } catch {
      toast({ variant: 'destructive', title: 'Error al eliminar cita' })
    }
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Navegación mes ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-slate-800 capitalize">
          {format(mes, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMes(subMonths(mes, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMes(new Date())}
            className="text-xs px-3"
          >
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => setMes(addMonths(mes, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Grilla ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col">

        {/* Cabecera días semana */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        {isLoading ? (
          <div className="grid grid-cols-7 flex-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="border-b border-r border-slate-100 p-2 min-h-[110px]">
                <Skeleton className="h-5 w-5 rounded-full mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 flex-1">
            {diasGrilla.map((dia, idx) => {
              const key     = format(dia, 'yyyy-MM-dd')
              const citas   = citasPorDia[key] ?? []
              const esMes   = isSameMonth(dia, mes)
              const esHoy   = isToday(dia)
              const esSel   = diaSeleccionado ? isSameDay(dia, diaSeleccionado) : false

              return (
                <button
                  key={idx}
                  onClick={() => seleccionarDia(dia)}
                  className={cn(
                    'text-left border-b border-r border-slate-100 p-2 min-h-[110px]',
                    'transition-colors hover:bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400',
                    !esMes && 'bg-slate-50/60',
                    esSel && 'bg-blue-50 ring-2 ring-inset ring-blue-400',
                  )}
                >
                  {/* Número del día */}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1',
                      esHoy  && 'bg-blue-600 text-white',
                      !esHoy && esMes  && 'text-slate-800',
                      !esHoy && !esMes && 'text-slate-400',
                    )}
                  >
                    {format(dia, 'd')}
                  </span>

                  {/* Citas del día */}
                  <div className="space-y-0.5 mt-0.5">
                    {citas.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          'flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate',
                          c.estado === 'programada' && 'bg-blue-100 text-blue-800',
                          c.estado === 'completada' && 'bg-green-100 text-green-800',
                          c.estado === 'cancelada'  && 'bg-red-100 text-red-700',
                          c.estado === 'no_asistio' && 'bg-orange-100 text-orange-800',
                        )}
                      >
                        <span className="font-medium shrink-0">
                          {formatTime(c.fecha_hora)}
                        </span>
                        <span className="truncate">
                          {c.paciente.nombre} {c.paciente.apellido}
                        </span>
                      </div>
                    ))}
                    {citas.length > 3 && (
                      <p className="text-xs text-slate-500 pl-1">+{citas.length - 3} más</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Leyenda ── */}
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        {Object.entries(estadoColor).map(([estado, { dot, label }]) => (
          <span key={estado} className="flex items-center gap-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', dot)} />
            {label}
          </span>
        ))}
      </div>

      {/* ── Sheet día seleccionado ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto flex flex-col gap-0 p-0">

          {/* Header del día */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <SheetTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              {diaSeleccionado && (
                <span className="capitalize">
                  {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Lista de citas del día */}
            {citasDia.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Citas agendadas ({citasDia.length})
                </p>
                <div className="space-y-2">
                  {citasDia
                    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
                    .map((cita) => {
                      const est = estadoColor[cita.estado]
                      return (
                        <div
                          key={cita.id}
                          className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 group"
                        >
                          <div className={cn('w-1 self-stretch rounded-full shrink-0', est.dot)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-sm font-semibold text-slate-800">
                                {formatTime(cita.fecha_hora)}
                              </span>
                              <Badge variant={est.badge} className="text-xs py-0">
                                {est.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 font-medium truncate">
                              {cita.paciente.nombre} {cita.paciente.apellido}
                            </p>
                            {cita.servicio && (
                              <p className="text-xs text-slate-500 truncate">{cita.servicio.nombre}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400">{cita.duracion_min} min</span>
                              <BtnRecordatorio
                                citaId={cita.id}
                                enviado={cita.recordatorio_enviado}
                                paciente={`${cita.paciente.nombre} ${cita.paciente.apellido}`}
                                variant="icon"
                              />
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => { onEditCita(cita); setSheetOpen(false) }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteTarget(cita)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Formulario nueva cita */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Nueva cita para este día
                </p>
              </div>
              {diaSeleccionado && (
                <CitaCalendarioForm
                  fechaBase={diaSeleccionado}
                  onSuccess={() => setSheetOpen(false)}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Confirm delete ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cita</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar la cita de{' '}
              <strong>{deleteTarget?.paciente.nombre} {deleteTarget?.paciente.apellido}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
