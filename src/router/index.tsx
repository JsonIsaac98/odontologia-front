import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PacientesPage } from '@/pages/pacientes/PacientesPage'
import { CitasPage } from '@/pages/citas/CitasPage'
import { ServiciosPage } from '@/pages/servicios/ServiciosPage'
import { ConfiguracionPage } from '@/pages/configuracion/ConfiguracionPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/pacientes', element: <PacientesPage /> },
          { path: '/citas', element: <CitasPage /> },
          { path: '/servicios', element: <ServiciosPage /> },
          { path: '/configuracion', element: <ConfiguracionPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
