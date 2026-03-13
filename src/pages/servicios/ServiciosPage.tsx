import { useState } from 'react'
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useServicios, useDeleteServicio, useUpdateServicio } from '@/hooks/useServicios'
import { ServicioForm } from './ServicioForm'
import { formatCurrency } from '@/lib/utils'
import type { Servicio } from '@/types'

export function ServiciosPage() {
  const { toast } = useToast()
  const { data, isLoading } = useServicios()
  const deleteMutation = useDeleteServicio()
  const updateMutation = useUpdateServicio()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Servicio | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Servicio | null>(null)

  const openNew = () => { setEditTarget(null); setDialogOpen(true) }
  const openEdit = (s: Servicio) => { setEditTarget(s); setDialogOpen(true) }

  const handleToggleActivo = async (s: Servicio) => {
    try {
      await updateMutation.mutateAsync({ id: s.id, data: { activo: !s.activo } })
      toast({ title: `Servicio ${!s.activo ? 'activado' : 'desactivado'}` })
    } catch {
      toast({ variant: 'destructive', title: 'Error al actualizar servicio' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast({ title: 'Servicio eliminado correctamente' })
    } catch {
      toast({ variant: 'destructive', title: 'Error al eliminar servicio' })
    }
    setDeleteTarget(null)
  }

  const servicios = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
          <p className="text-slate-500 text-sm mt-0.5">{servicios.length} servicios registrados</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Descripción</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Precio</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Duración</th>
              <th className="px-4 py-3 text-center font-medium text-slate-600">Activo</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : servicios.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Stethoscope className="w-10 h-10 opacity-40" />
                      <p className="text-sm">No hay servicios registrados</p>
                    </div>
                  </td>
                </tr>
              )
              : servicios.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.nombre}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {s.descripcion ?? <span className="italic text-slate-400">Sin descripción</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatCurrency(s.precio)}</td>
                    <td className="px-4 py-3 text-slate-600">{s.duracion_min} min</td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={s.activo}
                        onCheckedChange={() => handleToggleActivo(s)}
                        disabled={updateMutation.isPending}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>
          <ServicioForm
            servicio={editTarget ?? undefined}
            onSuccess={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar servicio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el servicio <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
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
