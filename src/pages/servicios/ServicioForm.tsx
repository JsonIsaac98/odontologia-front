import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useCreateServicio, useUpdateServicio } from '@/hooks/useServicios'
import type { Servicio } from '@/types'

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  precio: z.coerce.number().positive('Debe ser mayor a 0'),
  duracion_min: z.coerce.number().int().min(1, 'Mínimo 1 minuto'),
  activo: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  servicio?: Servicio
  onSuccess: () => void
}

export function ServicioForm({ servicio, onSuccess }: Props) {
  const { toast } = useToast()
  const createMutation = useCreateServicio()
  const updateMutation = useUpdateServicio()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: servicio?.nombre ?? '',
      descripcion: servicio?.descripcion ?? '',
      precio: servicio?.precio ?? 0,
      duracion_min: servicio?.duracion_min ?? 30,
      activo: servicio?.activo ?? true,
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending
  const activo = watch('activo')

  const onSubmit = async (data: FormData) => {
    try {
      if (servicio) {
        await updateMutation.mutateAsync({ id: servicio.id, data })
        toast({ title: 'Servicio actualizado correctamente' })
      } else {
        await createMutation.mutateAsync(data)
        toast({ title: 'Servicio creado correctamente' })
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
      <div className="space-y-1.5">
        <Label>Nombre *</Label>
        <Input placeholder="Ej: Limpieza dental" {...register('nombre')} />
        {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Textarea placeholder="Descripción del servicio..." rows={2} {...register('descripcion')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Precio (GTQ) *</Label>
          <Input type="number" step="0.01" min="0" placeholder="150.00" {...register('precio')} />
          {errors.precio && <p className="text-xs text-red-500">{errors.precio.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Duración (min) *</Label>
          <Input type="number" min="1" placeholder="30" {...register('duracion_min')} />
          {errors.duracion_min && <p className="text-xs text-red-500">{errors.duracion_min.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={activo} onCheckedChange={(v) => setValue('activo', v)} />
        <Label>Servicio activo</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {servicio ? 'Actualizar servicio' : 'Crear servicio'}
      </Button>
    </form>
  )
}
