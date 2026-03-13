import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useCreatePaciente, useUpdatePaciente } from '@/hooks/usePacientes'
import type { Paciente } from '@/types'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  telefono: z.string().min(8, 'Mínimo 8 dígitos'),
  whatsapp: z.string().min(8, 'Mínimo 8 dígitos'),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  notas: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  paciente?: Paciente
  onSuccess: () => void
}

export function PacienteForm({ paciente, onSuccess }: Props) {
  const { toast } = useToast()
  const createMutation = useCreatePaciente()
  const updateMutation = useUpdatePaciente()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: paciente?.nombre ?? '',
      apellido: paciente?.apellido ?? '',
      telefono: paciente?.telefono ?? '',
      whatsapp: paciente?.whatsapp ?? '',
      fecha_nacimiento: paciente?.fecha_nacimiento ?? '',
      genero: paciente?.genero ?? '',
      notas: paciente?.notas ?? '',
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      fecha_nacimiento: data.fecha_nacimiento || undefined,
      genero: data.genero || undefined,
      notas: data.notas || undefined,
    }
    try {
      if (paciente) {
        await updateMutation.mutateAsync({ id: paciente.id, data: payload })
        toast({ title: 'Paciente actualizado correctamente' })
      } else {
        await createMutation.mutateAsync(payload)
        toast({ title: 'Paciente creado correctamente' })
      }
      onSuccess()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Error al guardar'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    }
  }

  const generoValue = watch('genero')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nombre *</Label>
          <Input placeholder="Juan" {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Apellido *</Label>
          <Input placeholder="Pérez" {...register('apellido')} />
          {errors.apellido && <p className="text-xs text-red-500">{errors.apellido.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Teléfono *</Label>
        <Input placeholder="55551234" {...register('telefono')} />
        {errors.telefono && <p className="text-xs text-red-500">{errors.telefono.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>WhatsApp *</Label>
        <Input placeholder="50255551234" {...register('whatsapp')} />
        {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Fecha de nacimiento</Label>
        <Input type="date" {...register('fecha_nacimiento')} />
      </div>

      <div className="space-y-1.5">
        <Label>Género</Label>
        <Select
          value={generoValue ?? ''}
          onValueChange={(val) => setValue('genero', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Masculino">Masculino</SelectItem>
            <SelectItem value="Femenino">Femenino</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Notas</Label>
        <Textarea placeholder="Notas adicionales..." rows={3} {...register('notas')} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {paciente ? 'Actualizar' : 'Crear paciente'}
        </Button>
      </div>
    </form>
  )
}
