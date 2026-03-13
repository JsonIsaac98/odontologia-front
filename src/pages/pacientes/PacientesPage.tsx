import { useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { usePacientes, useDeletePaciente } from '@/hooks/usePacientes'
import { PacienteForm } from './PacienteForm'
import { formatDate } from '@/lib/utils'
import type { Paciente } from '@/types'

export function PacientesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Paciente | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Paciente | null>(null)

  const debounceSearch = useCallback((val: string) => {
    setSearch(val)
    const t = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  const { data, isLoading } = usePacientes({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  })

  const deleteMutation = useDeletePaciente()

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast({ title: 'Paciente eliminado correctamente' })
    } catch {
      toast({ variant: 'destructive', title: 'Error al eliminar paciente' })
    }
    setDeleteTarget(null)
  }

  const openNew = () => { setEditTarget(null); setSheetOpen(true) }
  const openEdit = (p: Paciente) => { setEditTarget(p); setSheetOpen(true) }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {data?.total ?? 0} pacientes registrados
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          Nuevo paciente
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => debounceSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre completo</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Teléfono</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">WhatsApp</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Registro</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users className="w-10 h-10 opacity-40" />
                      <p className="text-sm">No se encontraron pacientes</p>
                    </div>
                  </td>
                </tr>
              )
              : data?.data.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {p.nombre} {p.apellido}
                      {p.genero && (
                        <Badge variant="outline" className="ml-2 text-xs">{p.genero}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.telefono}</td>
                    <td className="px-4 py-3 text-slate-600">{p.whatsapp}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteTarget(p)}
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

      {/* Sheet formulario */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editTarget ? 'Editar paciente' : 'Nuevo paciente'}</SheetTitle>
          </SheetHeader>
          <PacienteForm
            paciente={editTarget ?? undefined}
            onSuccess={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar paciente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar a <strong>{deleteTarget?.nombre} {deleteTarget?.apellido}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
