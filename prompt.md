Quiero crear el frontend de un sistema de gestión de citas para un odontólogo. Usaremos React + TypeScript con Vite, React Router v6, shadcn/ui y TailwindCSS.

## Stack
- React 18 + TypeScript
- Vite
- React Router v6
- shadcn/ui (usa los componentes de shadcn para TODO el UI)
- TailwindCSS (ya incluido con shadcn)
- TanStack Query (react-query) para fetching y caché
- Axios para las llamadas al API
- React Hook Form + Zod para formularios y validación
- date-fns para formateo de fechas
- lucide-react para iconos (ya incluido en shadcn)

## Diseño general
- Tema: claro con acentos en azul/slate, estilo clínico y profesional
- Sidebar fijo a la izquierda con navegación principal
- Topbar con nombre del usuario logueado y botón de logout
- Tipografía limpia, espaciado generoso, tablas con hover states
- Paleta sugerida: fondo slate-50, sidebar slate-900, acentos blue-600
- Modo oscuro NO requerido por ahora
- Responsive: funcional en tablet y desktop (no mobile-first)

## Estructura de carpetas
src/
├── api/          # instancia axios + funciones por módulo
├── components/   # componentes compartidos (Layout, Sidebar, Topbar, etc.)
├── hooks/        # custom hooks con react-query
├── pages/        # una carpeta por módulo
├── types/        # interfaces TypeScript de todas las entidades
├── lib/          # utils, zod schemas, helpers
└── router/       # definición de rutas con React Router v6

## Tipos TypeScript (coincidir con el backend)

interface Paciente {
  id: string
  nombre: string
  apellido: string
  telefono: string
  whatsapp: string
  fecha_nacimiento?: string
  genero?: string
  notas?: string
  created_at: string
}

interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  duracion_min: number
  activo: boolean
}

interface Cita {
  id: string
  paciente: Paciente
  servicio?: Servicio
  fecha_hora: string
  duracion_min: number
  estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
  notas?: string
  recordatorio_enviado: boolean
  created_at: string
}

interface PaginatedResponse {
  data: T[]
  total: number
  page: number
  limit: number
}

## Variables de entorno
VITE_API_URL=http://localhost:3000

## Módulos y páginas a crear

### 1. Auth
- /login — página centrada con card, logo/ícono dental, formulario email + password
- Guardar JWT en localStorage, axios interceptor que añade Authorization: Bearer
- Si el token expira o el API devuelve 401, redirigir a /login automáticamente
- ProtectedRoute wrapper que protege todas las rutas internas

### 2. Dashboard (/dashboard)
- Cards de resumen: citas hoy, pacientes totales, citas completadas hoy, citas pendientes hoy
- Tabla de citas del día con columnas: hora, paciente, servicio, estado (badge con color), recordatorio enviado (ícono check/x)
- Badge colores: programada=blue, completada=green, cancelada=red, no_asistio=orange
- Widget de estado WhatsApp: indicador verde/rojo según GET /whatsapp/status, con botón para refrescar

### 3. Pacientes (/pacientes)
- Tabla paginada con columnas: nombre completo, teléfono, whatsapp, fecha registro, acciones
- Buscador por nombre o teléfono (debounce 400ms)
- Botón "Nuevo paciente" abre un Sheet (shadcn) con formulario
- Acciones por fila: editar (abre Sheet), ver detalle, eliminar (confirm Dialog)
- Formulario campos: nombre*, apellido*, telefono*, whatsapp*, fecha_nacimiento, genero (Select), notas (Textarea)
- Validación con Zod: nombre y apellido mínimo 2 chars, teléfono mínimo 8 dígitos

### 4. Citas (/citas)
- Vista por defecto: tabla paginada con filtro por fecha (DatePicker) y filtro por estado (Select)
- Columnas: fecha/hora, paciente, servicio, duración, estado (badge), recordatorio (ícono), acciones
- Botón "Nueva cita" abre Sheet con formulario
- Formulario campos: paciente (Combobox con búsqueda), servicio (Select, opcional), fecha_hora (DatePicker + TimePicker), duracion_min, estado, notas
- Al seleccionar servicio, autocompletar duracion_min con la duración del servicio
- Acciones por fila: editar estado (dropdown rápido), editar completo, eliminar

### 5. Servicios (/servicios)
- Tabla simple (pocos registros, sin paginación)
- Columnas: nombre, descripción, precio (formatear como moneda), duración, activo (Switch inline)
- Botón "Nuevo servicio" abre Dialog con formulario
- Formulario: nombre*, descripcion, precio* (número positivo), duracion_min* (número positivo), activo
- El Switch de activo en la tabla debe hacer PATCH inmediato al API

### 6. Layout general
- Sidebar items con íconos lucide: LayoutDashboard, Users, Calendar, Stethoscope, Settings
- Indicador de ruta activa en el sidebar
- Topbar muestra: nombre del usuario logueado y botón logout con confirmación
- Loading states con Skeleton de shadcn en todas las tablas
- Toast notifications (shadcn Toaster) para éxito/error en todas las mutaciones

## Manejo de errores y UX
- Si el API falla, mostrar Toast con mensaje del error (extraer mensaje de error.response.data.message)
- Formularios deben deshabilitar el botón submit mientras se procesa (loading spinner en el botón)
- Tablas vacías deben mostrar un estado empty con ícono y texto descriptivo
- Confirmar antes de eliminar cualquier registro con AlertDialog de shadcn

## API layer (src/api/)
Crear un archivo por módulo: auth.api.ts, pacientes.api.ts, citas.api.ts, servicios.api.ts, whatsapp.api.ts
Cada archivo exporta funciones tipadas que usan la instancia axios central (src/api/axios.ts)

Por favor genera toda la estructura del proyecto lista para correr con `npm run dev`. Instala y configura shadcn/ui con el comando init. Todos los componentes de shadcn deben generarse con `npx shadcn-ui@latest add [componente]` y estar listos para usar.