import { useState, useEffect, useRef } from 'react'
import {
  Wifi, WifiOff, QrCode, RefreshCw, Trash2, CheckCircle2,
  AlertCircle, Loader2, MessageCircle, Settings,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useWhatsAppStatus, useWhatsAppQr, useDisconnectWhatsApp } from '@/hooks/useWhatsApp'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

export function ConfiguracionPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [mostrarQr, setMostrarQr] = useState(false)
  const prevQrUrl = useRef<string | null>(null)

  // Poll más rápido en esta página (cada 5s) para detectar conexión al instante
  const { data: status, isLoading: loadingStatus, refetch: refetchStatus } =
    useWhatsAppStatus(5000)

  const connected  = status?.connected  ?? false
  const qrPending  = status?.qrPending  ?? false

  // Solo habilitar fetch de QR cuando:
  // - no está conectado
  // - el usuario quiere ver el QR
  // - hay QR pendiente (backend lo tiene listo)
  const qrEnabled = mostrarQr && !connected && qrPending

  const { data: qrUrl, isLoading: loadingQr, refetch: refetchQr, isError: qrError } =
    useWhatsAppQr(qrEnabled)

  const disconnectMutation = useDisconnectWhatsApp()

  // Revocar blob URLs anteriores para no acumular memoria
  useEffect(() => {
    if (qrUrl && prevQrUrl.current && prevQrUrl.current !== qrUrl) {
      URL.revokeObjectURL(prevQrUrl.current)
    }
    if (qrUrl) prevQrUrl.current = qrUrl
  }, [qrUrl])

  // Si el estado cambia a conectado, cerrar el panel de QR
  useEffect(() => {
    if (connected) {
      setMostrarQr(false)
      // Invalidar QR para que libere la URL si existía
      qc.removeQueries({ queryKey: ['whatsapp', 'qr'] })
    }
  }, [connected, qc])

  const handleDisconnect = async () => {
    try {
      const res = await disconnectMutation.mutateAsync()
      toast({ title: 'Sesión desconectada', description: res.message })
      setMostrarQr(false)
      // Esperar 3s antes de habilitar el QR (el backend necesita reiniciar)
      setTimeout(() => {
        refetchStatus()
        setMostrarQr(true)
      }, 3500)
    } catch {
      toast({ variant: 'destructive', title: 'Error al desconectar' })
    }
    setConfirmDisconnect(false)
  }

  const handleMostrarQr = () => {
    setMostrarQr(true)
    refetchQr()
  }

  const handleRefreshQr = () => {
    qc.removeQueries({ queryKey: ['whatsapp', 'qr'] })
    refetchQr()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-500 text-sm">Gestión de integraciones y sistema</p>
        </div>
      </div>

      {/* ── Card WhatsApp ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">WhatsApp</CardTitle>
              <CardDescription>
                Conecta tu número de WhatsApp para enviar recordatorios de citas automáticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">

          {/* ── Estado de conexión ── */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              {loadingStatus ? (
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              ) : connected ? (
                <div className="relative">
                  <Wifi className="w-6 h-6 text-green-600" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                </div>
              ) : (
                <WifiOff className="w-6 h-6 text-slate-400" />
              )}
              <div>
                <p className={cn(
                  'font-semibold text-sm',
                  connected ? 'text-green-800' : 'text-slate-600'
                )}>
                  {loadingStatus
                    ? 'Verificando estado...'
                    : connected
                    ? 'WhatsApp conectado'
                    : 'WhatsApp desconectado'}
                </p>
                {status?.message && !loadingStatus && (
                  <p className="text-xs text-slate-500 mt-0.5">{status.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connected
                ? <Badge variant="green" className="text-xs">Activo</Badge>
                : <Badge variant="outline" className="text-xs text-slate-500">Inactivo</Badge>
              }
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
                onClick={() => refetchStatus()}
                title="Refrescar estado"
              >
                <RefreshCw className={cn('w-4 h-4', loadingStatus && 'animate-spin')} />
              </Button>
            </div>
          </div>

          {/* ── Si ya está conectado ── */}
          {connected && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Número conectado correctamente</p>
                  <p className="text-xs text-green-700 mt-1">
                    Los recordatorios de citas se enviarán automáticamente a través de este número.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Sección QR (no conectado) ── */}
          {!connected && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">WhatsApp no conectado</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Escanea el código QR con tu teléfono para vincular el número. Abre WhatsApp →
                      Dispositivos vinculados → Vincular un dispositivo.
                    </p>
                  </div>
                </div>
              </div>

              {!mostrarQr && (
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={handleMostrarQr}
                  disabled={!qrPending}
                >
                  <QrCode className="w-4 h-4" />
                  {qrPending ? 'Mostrar código QR' : 'Esperando QR del servidor...'}
                </Button>
              )}

              {mostrarQr && (
                <div className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-dashed border-slate-300 bg-white">

                  {/* QR image */}
                  {loadingQr && (
                    <div className="flex flex-col items-center gap-3 py-8 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm">Generando código QR...</p>
                    </div>
                  )}

                  {qrError && !loadingQr && (
                    <div className="flex flex-col items-center gap-2 py-6 text-slate-400">
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                      <p className="text-sm text-center">
                        QR no disponible todavía.<br />
                        El servidor está inicializando WhatsApp.
                      </p>
                      <Button variant="outline" size="sm" onClick={handleRefreshQr}>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {qrUrl && !loadingQr && !qrError && (
                    <>
                      <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
                        <img
                          src={qrUrl}
                          alt="Código QR de WhatsApp"
                          className="w-56 h-56 object-contain"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-slate-700">
                          Escanea este código desde WhatsApp
                        </p>
                        <p className="text-xs text-slate-400">
                          El QR se actualiza automáticamente cada 30 segundos
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefreshQr}>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Actualizar QR
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500"
                          onClick={() => setMostrarQr(false)}
                        >
                          Cerrar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* ── Zona peligrosa ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Zona peligrosa
            </p>
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
              <div>
                <p className="text-sm font-medium text-red-800">Desconectar WhatsApp</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Elimina la sesión actual. Tendrás que escanear un QR nuevo para reconectar.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-700 shrink-0 ml-4"
                onClick={() => setConfirmDisconnect(true)}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
                Desconectar
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ── Info adicional ── */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">¿Cómo funciona?</p>
              <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
                <li>El sistema envía recordatorios automáticos 24h antes de cada cita</li>
                <li>Se usa el número de WhatsApp registrado en cada paciente</li>
                <li>El QR se genera desde el servidor — no necesitas tener el teléfono cerca todo el tiempo</li>
                <li>Una vez conectado, la sesión se mantiene aunque reinicies el servidor</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Confirm disconnect ── */}
      <AlertDialog open={confirmDisconnect} onOpenChange={setConfirmDisconnect}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desconectar WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la sesión guardada. No se podrán enviar recordatorios hasta que
              vuelvas a escanear un código QR con un número de WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDisconnect}
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
