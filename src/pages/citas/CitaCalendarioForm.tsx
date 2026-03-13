import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { useCreateCita } from '@/hooks/useCitas'
import { usePacientes } from '@/hooks/usePacientes'
import { useServicios } from '@/hooks/useServicios'
import { cn } from '@/lib/utils'

const schema = z.object({
  paciente_id: z.string().min(1, 'Selecciona un paciente'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  servicio_id: z.string().optional(),
  duracion_min: z.coerce.number().int().min(5, 'Mínimo 5 min'),
  notas: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  fechaBase: Date
  onSuccess: () => void
}

export function CitaCalendarioForm({ fechaBase, onSuccess }: Props) {
  const { toast } = useToast()
  const createMutation = useCreateCita()

  const [pacienteSearch, setPacienteSearch] = useState('')
  const [pacienteOpen, setPacienteOpen] = useState(false)

  const { data: pacientesData } = usePacientes({ limit: 20, search: pacienteSearch || undefined })
  const { data: serviciosData } = useServicios()

  const pacientes = pacientesData?.data ?? []
  const servicios = (serviciosData?.data ?? []).filter((s) => s.activo)

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paciente_id: '',
      hora: '09:00',
      servicio_id: '',
      duracion_min: 30,
      notas: '',
    },
  })

  const selectedPacienteId = watch('paciente_id')
  const selectedServicioId = watch('servicio_id')

  const selectedPaciente = pacientes.find((p) => p.id === selectedPacienteId)

  // Auto-completar duración al cambiar servicio
  useEffect(() => {
    if (selectedServicioId) {
      const s = servicios.find((sv) => sv.id === selectedServicioId)
      if (s) setValue('duracion_min', s.duracion_min)
    }
  }, [selectedServicioId, servicios, setValue])

  const onSubmit = async (data: FormData) => {
    // Combinar fecha base + hora elegida
    const [hh, mm] = data.hora.split(':').map(Number)
    const fechaHora = new Date(fechaBase)
    fechaHora.setHours(hh, mm, 0, 0)

    const payload = {
      paciente_id: data.paciente_id,
      servicio_id: data.servicio_id || undefined,
      fecha_hora: fechaHora.toISOString(),
      duracion_min: data.duracion_min,
      estado: 'programada' as const,
      notas: data.notas || undefined,
    }

    try {
      await createMutation.mutateAsync(payload)
      toast({
        title: 'Cita creada',
        description: `${format(fechaHora, 'dd/MM/yyyy')} a las ${data.hora}`,
      })
      reset()
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
          <PopoverContent className="w-[320px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Buscar paciente..."
                value={pacienteSearch}
                onValueChange={setPacienteSearch}
              />
              <CommandList>
                <CommandEmpty className="py-4 text-center text-sm text-slate-400">
                  No se encontraron pacientes
                </CommandEmpty>
                <CommandGroup>
                  {pacientes.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.id}
                      onSelect={(val) => {
                        setValue('paciente_id', val)
                        setPacienteOpen(false)
                        setPacienteSearch('')
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedPacienteId === p.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{p.nombre} {p.apellido}</p>
                        <p className="text-xs text-slate-400">{p.telefono}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.paciente_id && (
          <p className="text-xs text-red-500">{errors.paciente_id.message}</p>
        )}
      </div>

      {/* Hora */}
      <div className="space-y-1.5">
        <Label>Hora *</Label>
        <Input type="time" {...register('hora')} />
        {errors.hora && <p className="text-xs text-red-500">{errors.hora.message}</p>}
      </div>

      {/* Servicio */}
      <div className="space-y-1.5">
        <Label>Servicio <span className="text-slate-400 font-normal">(opcional)</span></Label>
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

      {/* Duración */}
      <div className="space-y-1.5">
        <Label>Duración (min)</Label>
        <Input type="number" min="5" step="5" {...register('duracion_min')} />
        {errors.duracion_min && (
          <p className="text-xs text-red-500">{errors.duracion_min.message}</p>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-1.5">
        <Label>Notas <span className="text-slate-400 font-normal">(opcional)</span></Label>
        <Textarea placeholder="Observaciones..." rows={2} {...register('notas')} />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Agendar cita
      </Button>
    </form>
  )
}
