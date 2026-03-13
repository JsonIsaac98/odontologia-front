import { useState } from 'react'
import {
  Plus, Pencil, Trash2, Calendar, CheckCheck, XCircle,
  ChevronDown, LayoutList, CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useCitas, useDeleteCita, useUpdateCita } from '@/hooks/useCitas'
import { CitaForm } from './CitaForm'
import { CalendarioView } from './CalendarioView'
import { formatDateTime } from '@/lib/utils'
import type { Cita, EstadoCita } from '@/types'

const estadoBadge: Record<EstadoCita, { label: string; variant: 'blue' | 'green' | 'red' | 'orange' }> = {
  programada: { label: 'Programada', variant: 'blue' },
  completada:  { label: 'Completada',  variant: 'green'  },
  cancelada:   { label: 'Cancelada',   variant: 'red'    },
  no_asistio:  { label: 'No asistió',  variant: 'orange' },
}

const ESTADOS: { value: EstadoCita; label: string }[] = [
  { value: 'programada',  label: 'Programada'  },
  { value: 'completada',  label: 'Completada'  },
  { value: 'cancelada',   label: 'Cancelada'   },
  { value: 'no_asistio',  label: 'No asistió'  },
]

type Vista = 'calendario' | 'lista'

export function CitasPage() {
  const { toast } = useToast()
  const [vista, setVista] = useState<Vista>('calendario')

  // ── Lista state ──
  const [page, setPage] = useState(1)
  const [fechaFilter, setFechaFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<EstadoCita | 'todos'>('todos')

  // ── Shared state ──
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Cita | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cita | null>(null)

  const { data, isLoading } = useCitas({
    page, limit: 10,
    fecha: fechaFilter || undefined,
    estado: estadoFilter !== 'todos' ? estadoFilter : undefined,
  })

  const deleteMutation = useDeleteCita()
  const updateMutation = useUpdateCita()

  const openNew  = () => { setEditTarget(null); setSheetOpen(true) }
  const openEdit = (c: Cita) => { setEditTarget(c); setSheetOpen(true) }

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

  const handleChangeEstado = async (id: string, estado: EstadoCita) => {
    try {
      await updateMutation.mutateAsync({ id, data: { estado } })
      toast({ title: 'Estado actualizado' })
    } catch {
      toast({ variant: 'destructive', title: 'Error al actualizar estado' })
    }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-5 h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Citas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.total ?? 0} citas registradas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle vista */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <Button
              size="sm"
              variant={vista === 'calendario' ? 'default' : 'ghost'}
              className={vista === 'calendario' ? 'shadow-sm' : 'text-slate-600'}
              onClick={() => setVista('calendario')}
            >
              <CalendarDays className="w-4 h-4" />
              Calendario
            </Button>
            <Button
              size="sm"
              variant={vista === 'lista' ? 'default' : 'ghost'}
              className={vista === 'lista' ? 'shadow-sm' : 'text-slate-600'}
              onClick={() => setVista('lista')}
            >
              <LayoutList className="w-4 h-4" />
              Lista
            </Button>
          </div>

          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            Nueva cita
          </Button>
        </div>
      </div>

      {/* ── Vista Calendario ── */}
      {vista === 'calendario' && (
        <CalendarioView onEditCita={openEdit} />
      )}

      {/* ── Vista Lista ── */}
      {vista === 'lista' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="date"
              className="w-44"
              value={fechaFilter}
              onChange={(e) => { setFechaFilter(e.target.value); setPage(1) }}
            />
            <Select
              value={estadoFilter}
              onValueChange={(v) => { setEstadoFilter(v as EstadoCita | 'todos'); setPage(1) }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {ESTADOS.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(fechaFilter || estadoFilter !== 'todos') && (
              <Button
                variant="ghost" size="sm"
                onClick={() => { setFechaFilter(''); setEstadoFilter('todos'); setPage(1) }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Paciente</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Servicio</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Duración</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600">Rec.</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : data?.data.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Calendar className="w-10 h-10 opacity-40" />
                          <p className="text-sm">No se encontraron citas</p>
                        </div>
                      </td>
                    </tr>
                  )
                  : data?.data.map((cita) => {
                      const badge = estadoBadge[cita.estado]
                      return (
                        <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-700">{formatDateTime(cita.fecha_hora)}</td>
                          <td className="px-4 py-3 text-slate-800">{cita.paciente.nombre} {cita.paciente.apellido}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {cita.servicio?.nombre ?? <span className="italic text-slate-400">Sin servicio</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{cita.duracion_min} min</td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 focus:outline-none">
                                  <Badge variant={badge.variant}>{badge.label}</Badge>
                                  <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {ESTADOS.map((e) => (
                                  <DropdownMenuItem
                                    key={e.value}
                                    onClick={() => handleChangeEstado(cita.id, e.value)}
                                    className={cita.estado === e.value ? 'font-medium' : ''}
                                  >
                                    {e.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {cita.recordatorio_enviado
                              ? <CheckCheck className="w-4 h-4 text-green-500 inline" />
                              : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(cita)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteTarget(cita)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-600">
              <p>Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sheet edición completa ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editTarget ? 'Editar cita' : 'Nueva cita'}</SheetTitle>
          </SheetHeader>
          <CitaForm cita={editTarget ?? undefined} onSuccess={() => setSheetOpen(false)} />
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
