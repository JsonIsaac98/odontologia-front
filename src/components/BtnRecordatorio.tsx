import { useState } from 'react'
import { Loader2, MessageCircle, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useEnviarRecordatorio } from '@/hooks/useCitas'
import { cn } from '@/lib/utils'

interface Props {
  citaId: string
  /** Si ya fue enviado previamente */
  enviado: boolean
  /** Nombre del paciente para el toast */
  paciente: string
  /** Variant visual: "icon" (solo ícono, para tablas) | "full" (con texto, para panel) */
  variant?: 'icon' | 'full'
}

export function BtnRecordatorio({ citaId, enviado, paciente, variant = 'icon' }: Props) {
  const { toast } = useToast()
  const mutation = useEnviarRecordatorio()
  // Track local "enviado" optimista para feedback inmediato
  const [localEnviado, setLocalEnviado] = useState(enviado)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await mutation.mutateAsync(citaId)
      if (res.exito) {
        setLocalEnviado(true)
        toast({
          title: '✅ Recordatorio enviado',
          description: res.mensaje,
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'No se pudo enviar',
          description: res.mensaje,
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar con el servidor',
      })
    }
  }

  const isLoading = mutation.isPending

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 transition-colors',
          localEnviado
            ? 'text-green-500 hover:text-green-600 hover:bg-green-50'
            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
        )}
        onClick={handleClick}
        disabled={isLoading}
        title={localEnviado ? `Reenviar recordatorio a ${paciente}` : `Enviar recordatorio a ${paciente}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : localEnviado ? (
          <CheckCheck className="w-4 h-4" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
      </Button>
    )
  }

  // variant === 'full'
  return (
    <Button
      size="sm"
      variant={localEnviado ? 'outline' : 'default'}
      className={cn(
        'gap-2 transition-all',
        !localEnviado && 'bg-green-600 hover:bg-green-700 text-white border-transparent'
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : localEnviado ? (
        <CheckCheck className="w-4 h-4 text-green-600" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      {isLoading
        ? 'Enviando...'
        : localEnviado
        ? 'Reenviar recordatorio'
        : 'Enviar recordatorio'}
    </Button>
  )
}
