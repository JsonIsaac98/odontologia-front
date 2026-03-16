import { useEffect, useState } from 'react'
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
import { cn } from '@/lib/utils'
import type { Paciente } from '@/types'

const PREFIJO = '502'

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

/** Quita el prefijo 502 si lo tiene, para mostrar sólo el resto en el input */
const sinPrefijo = (valor: string) =>
  valor.startsWith(PREFIJO) ? valor.slice(PREFIJO.length) : valor

interface Props {
  paciente?: Paciente
  onSuccess: () => void
}

export function PacienteForm({ paciente, onSuccess }: Props) {
  const { toast } = useToast()
  const createMutation = useCreatePaciente()
  const updateMutation = useUpdatePaciente()

  // Checkbox "el mismo del teléfono"
  const [mismoTel, setMismoTel] = useState(false)

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
      // El campo interno guarda el número completo (con 502)
      whatsapp: paciente?.whatsapp ?? PREFIJO,
      fecha_nacimiento: paciente?.fecha_nacimiento ?? '',
      genero: paciente?.genero ?? '',
      notas: paciente?.notas ?? '',
    },
  })

  const isLoading = createMutation.isPending || updateMutation.isPending
  const telefonoWatch = watch('telefono')
  const whatsappWatch = watch('whatsapp')

  // Cuando el checkbox está activo, sincroniza whatsapp con teléfono
  useEffect(() => {
    if (mismoTel) {
      setValue('whatsapp', PREFIJO + telefonoWatch, { shouldValidate: true })
    }
  }, [mismoTel, telefonoWatch, setValue])

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

  // El sufijo del whatsapp (sin el 502 delante)
  const whatsappSufijo = sinPrefijo(whatsappWatch ?? '')

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
        <Input
          placeholder="55551234"
          {...register('telefono')}
        />
        {errors.telefono && <p className="text-xs text-red-500">{errors.telefono.message}</p>}
      </div>

      {/* WhatsApp con prefijo fijo 502 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>WhatsApp *</Label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded accent-blue-600"
              checked={mismoTel}
              onChange={(e) => setMismoTel(e.target.checked)}
            />
            <span className="text-xs text-slate-500">El mismo del teléfono</span>
          </label>
        </div>
        <div className="flex">
          {/* Prefijo fijo */}
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-100 text-slate-500 text-sm font-medium">
            +{PREFIJO}
          </span>
          <Input
            className="rounded-l-none"
            placeholder="55551234"
            disabled={mismoTel}
            value={whatsappSufijo}
            onChange={(e) => {
              // Solo dígitos
              const soloDigitos = e.target.value.replace(/\D/g, '')
              setValue('whatsapp', PREFIJO + soloDigitos, { shouldValidate: true })
            }}
          />
        </div>
        {errors.whatsapp && (
          <p className={cn('text-xs text-red-500')}>{errors.whatsapp.message}</p>
        )}
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
