import { FolderOpen } from 'lucide-react'
import { PlaceholderPage } from '@/components/layout/PlaceholderPage'

export default function ProyectosPage() {
  return (
    <PlaceholderPage
      title="Proyectos"
      subtitle="Módulo 2b — Portafolio completo de proyectos"
      description="Vista detallada de todos los proyectos activos, con filtros por cliente, estado, responsable y fecha. Accedé al Gantt detallado de cada proyecto."
      icon={FolderOpen}
      module="2b"
      features={[
        'Listado y kanban de proyectos por estado',
        'Filtros por cliente, responsable y período',
        'Creación y edición de proyectos con fechas y miembros',
        'Vista de % de avance en tiempo real',
        'Gantt detallado por proyecto (Micro Gantt)',
        'Asignación de módulos de servicio y tareas',
      ]}
    />
  )
}
