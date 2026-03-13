import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { useCreateCita, useUpdateCita } from '@/hooks/useCitas'
import { usePacientes } from '@/hooks/usePacientes'
import { useServicios } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'
import type { Cita, EstadoCita } from '@/types'

const schema = z.object({
  paciente_id: z.string().min(1, 'Selecciona un paciente'),
  servicio_id: z.string().optional(),
  fecha_hora: z.string().min(1, 'Fecha y hora requeridas'),
  duracion_min: z.coerce.number().int().min(5, 'Mínimo 5 minutos'),
  estado: z.enum(['programada', 'completada', 'cancelada', 'no_asistio'] as const),
  notas: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  cita?: Cita
  onSuccess: () => void
}

function toLocalDatetimeValue(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CitaForm({ cita, onSuccess }: Props) {
  const { toast } = useToast()
  const createMutation = useCreateCita()
  const updateMutation = useUpdateCita()

  const [pacienteSearch, setPacienteSearch] = useState('')
  const [pacienteOpen, setPacienteOpen] = useState(false)

  const { data: pacientesData } = usePacientes({ limit: 20, search: pacienteSearch || undefined })
  const { data: serviciosData } = useServicios()

  const pacientes = pacientesData?.data ?? []
  const servicios = serviciosData?.data ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paciente_id: cita?.paciente_id ?? '',
      servicio_id: cita?.servicio_id ?? '',
      fecha_hora: cita ? toLocalDatetimeValue(cita.fecha_hora) : '',
      duracion_min: cita?.duracion_min ?? 30,
      estado: (cita?.estado as EstadoCita) ?? 'programada',
      notas: cita?.notas ?? '',
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending
  const selectedPacienteId = watch('paciente_id')
  const selectedServicioId = watch('servicio_id')
  const estadoValue = watch('estado')

  // Auto-completar duración al cambiar servicio
  useEffect(() => {
    if (selectedServicioId) {
      const s = servicios.find((sv) => sv.id === selectedServicioId)
      if (s) setValue('duracion_min', s.duracion_min)
    }
  }, [selectedServicioId, servicios, setValue])

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)
    ?? (cita ? { id: cita.paciente_id, nombre: cita.paciente.nombre, apellido: cita.paciente.apellido } : null)

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      servicio_id: data.servicio_id || undefined,
      notas: data.notas || undefined,
      fecha_hora: new Date(data.fecha_hora).toISOString(),
    }
    try {
      if (cita) {
        await updateMutation.mutateAsync({ id: cita.id, data: payload })
        toast({ title: 'Cita actualizada correctamente' })
      } else {
        await createMutation.mutateAsync(payload)
        toast({ title: 'Cita creada correctamente' })
      }
      onSuccess()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al guardar'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Paciente combobox */}
      <div className="space-y-1.5">
        <Label>Paciente *</Label>
        <Popover open={pacienteOpen} onOpenChange={setPacienteOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              {selectedPaciente
                ? `${selectedPaciente.nombre} ${selectedPaciente.apellido}`
                : 'Buscar paciente...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar paciente..."
                value={pacienteSearch}
                onValueChange={setPacienteSearch}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="flex items-center gap-2 text-slate-400 py-2">
                    <Search className="w-4 h-4" />
                    No se encontraron pacientes
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {pacientes.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={(val) => {
                        setValue('paciente_id', val)
                        setPacienteOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedPacienteId === p.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {p.nombre} {p.apellido}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.paciente_id && <p className="text-xs text-red-500">{errors.paciente_id.message}</p>}
      </div>

      {/* Servicio */}
      <div className="space-y-1.5">
        <Label>Servicio (opcional)</Label>
        <Select
          value={selectedServicioId ?? ''}
          onValueChange={(v) => setValue('servicio_id', v === 'ninguno' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ninguno">Sin servicio</SelectItem>
            {servicios.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nombre} — {s.duracion_min} min
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fecha/hora */}
      <div className="space-y-1.5">
        <Label>Fecha y hora *</Label>
        <Input type="datetime-local" {...register('fecha_hora')} />
        {errors.fecha_hora && <p className="text-xs text-red-500">{errors.fecha_hora.message}</p>}
      </div>

      {/* Duración */}
      <div className="space-y-1.5">
        <Label>Duración (min)</Label>
        <Input type="number" min="5" {...register('duracion_min')} />
        {errors.duracion_min && <p className="text-xs text-red-500">{errors.duracion_min.message}</p>}
      </div>

      {/* Estado */}
      <div className="space-y-1.5">
        <Label>Estado</Label>
        <Select
          value={estadoValue}
          onValueChange={(v) => setValue('estado', v as EstadoCita)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="no_asistio">No asistió</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label>Notas</Label>
        <Textarea placeholder="Observaciones..." rows={3} {...register('notas')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {cita ? 'Actualizar cita' : 'Crear cita'}
      </Button>
    </form>
  )
}
