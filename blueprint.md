
# **Blueprint del Proyecto: MedLog**

## 1. Nombre de la Aplicación
MedLog

## 2. Visión General del Proyecto
MedLog es una aplicación web diseñada para ayudar a profesionales médicos a gestionar eficientemente los historiales de sus pacientes, programar citas, generar recetas y facturas, y administrar la información clínica de manera segura y organizada. La aplicación está orientada a un médico administrador principal y personal asistencial (secretarios/as) con roles y permisos diferenciados.

## 3. Roles de Usuario Principales

*   **Médico (Administrador):**
    *   Acceso completo a todas las funcionalidades.
    *   Inicio de sesión mediante cuenta de Google.
    *   Gestión de su perfil profesional y datos fiscales.
    *   Creación y administración de cuentas de personal asistencial (secretarios/as) y sus permisos.
    *   Gestión integral de pacientes: creación, visualización, modificación de datos personales, antecedentes médicos, historial de consultas, recetas y adjuntos.
    *   Generación de informes y resúmenes con IA.
    *   Gestión de agenda: programación de citas y bloqueos, modificación de estados.
    *   Gestión de facturación.
*   **Secretario/a (Personal Asistencial):**
    *   Inicio de sesión con usuario y contraseña generados por el médico.
    *   Funcionalidades limitadas según los permisos otorgados por el médico, que pueden incluir:
        *   Creación de pacientes (datos personales y de facturación).
        *   Modificación de datos personales y de facturación de pacientes.
        *   Gestión de adjuntos de pacientes.
        *   Gestión de agenda: programación de citas, bloqueos de horario, cambio de estado de citas.
        *   Acceso a la sección de facturación.

## 4. Funcionalidades Clave

### 4.1. Autenticación y Roles
*   **Inicio de Sesión Diferenciado:**
    *   Médico: Autenticación con Google (usando Firebase Authentication).
    *   Secretario/a: Autenticación con usuario y contraseña (gestionado vía Firebase Authentication, usuarios creados por el médico).
*   **Gestión de Roles y Permisos:**
    *   El médico administra las cuentas de secretarios/as y asigna permisos granulares para las secciones de Pacientes, Agenda y Facturación.

### 4.2. Gestión de Pacientes
*   **Creación de Pacientes:**
    *   Médico: Ingreso completo de datos personales, de contacto, facturación, antecedentes médicos y medicación habitual.
    *   Secretaria: Ingreso de datos personales, de contacto y, opcionalmente, de facturación.
*   **Listado y Búsqueda de Pacientes:**
    *   Tabla con todos los pacientes.
    *   Buscador por nombre, apellidos o documento de identidad.
    *   Paginación para listas largas.
*   **Visualización y Modificación de Historial del Paciente:**
    *   Pestañas para:
        *   **Datos:** Información personal, de contacto y facturación (editable según rol/permisos).
        *   **Antecedentes:** Historial médico personal, alergias, medicación habitual (visible y editable solo por el médico).
        *   **Historial:** Lista cronológica de consultas médicas (visible solo por el médico). La última consulta se muestra completa, las anteriores resumidas. Opción para descargar cada consulta en formato PDF (simulado).
        *   **Adjuntos:** Gestión de archivos vinculados al paciente (visible para médico; para secretaria según permisos). Los metadatos de los archivos se almacenarán en Firestore (planeado).
*   **Archivos Adjuntos:**
    *   Subida de archivos (PDFs, imágenes, etc.) y vinculación a pacientes específicos.
    *   Los metadatos de los archivos se almacenan (simulado en Firestore). La descarga de archivos es simulada.

### 4.3. Consultas Médicas (Médico)
*   **Registro de Nueva Consulta:**
    *   Selección de paciente mediante buscador.
    *   Visualización de resumen de datos del paciente y antecedentes.
    *   Visualización de historial de consultas recientes del paciente (última completa, anteriores resumidas, con opción de descarga).
    *   Formulario para ingresar: Anamnesis, Exploración Física, Estudios Complementarios, Impresión Diagnóstica y Plan.
    *   Opción para generar un informe de la consulta en formato PDF (simulado, descarga de archivo de texto).

### 4.4. Recetas Médicas (Médico)
*   **Creación de Nueva Receta:**
    *   Selección de paciente mediante buscador.
    *   Visualización de resumen de datos del paciente.
    *   Visualización de historial de recetas previas del paciente (con paginación y opción de descarga).
    *   Formulario para añadir dinámicamente:
        *   Medicación: Nombre del fármaco, presentación, indicaciones.
        *   Medidas de prevención y cuidados.
    *   Campos opcionales para Diagnósticos y Observaciones (para el PDF).
    *   Opción para generar la receta en formato PDF (simulado, descarga de archivo de texto).

### 4.5. Agenda de Citas
*   **Visualización de Calendario Mensual:**
    *   Navegación entre meses.
    *   Indicadores visuales en días con citas o bloqueos.
*   **Panel Lateral de Citas del Día:**
    *   Al hacer clic en un día del calendario, se muestra un panel con las citas y bloqueos de ese día.
*   **Programación de Citas:**
    *   Médico y Secretaria (con permisos).
    *   Selección de paciente, fecha, hora, duración, notas.
*   **Bloqueo de Horarios:**
    *   Médico y Secretaria (con permisos).
    *   Definición de franjas horarias no disponibles (ej. almuerzo, reuniones) con motivo.
*   **Gestión de Estado de Citas:**
    *   Médico y Secretaria (con permisos).
    *   Cambio de estado (Programada, Confirmada, Cancelada, Completada) desde la lista principal y el panel lateral.
*   **Eliminación de Bloqueos:**
    *   Médico y Secretaria (con permisos).
    *   Opción de eliminar horarios bloqueados con confirmación.

### 4.6. Facturación
*   **Acceso:** Médico y Secretaria (con permisos).
*   **Listado de Facturas:**
    *   Visualización en formato de tarjetas.
    *   Buscador por paciente o número de factura.
    *   Paginación.
*   **Gestión de Estado de Facturas:**
    *   Cambio de estado (Borrador, Emitida, Pagada, Anulada, Vencida).
*   **Generación de Facturas PDF (Simulado):**
    *   Opción para "imprimir" la factura, generando un archivo de texto con formato y extensión .pdf.
*   **(Futuro):** Creación detallada de facturas.

### 4.7. Perfil del Médico (Médico)
*   Gestión de:
    *   Datos personales y de contacto.
    *   Datos profesionales (especialidad, matrícula).
    *   Datos fiscales (para facturación).
    *   URL del logotipo para personalizar documentos (recetas, informes, facturas).
*   Sección de seguridad (placeholder para futuras configuraciones).

### 4.8. Gestión de Usuarios Asistenciales (Médico)
*   Página para que el médico administrador gestione las cuentas del personal asistencial (secretarios/as).
*   **(Futuro):** Creación de usuarios, asignación/modificación de permisos granulares, aprobación de cuentas, restablecimiento de contraseñas.
*   Actualmente muestra una lista de usuarios de ejemplo en formato de tarjetas con acciones simuladas.

### 4.9. Generación de Informes con IA (Médico)
*   **(Mantenido, pero sin Google Docs):** Uso de Genkit para generar resúmenes de historiales médicos e informes completos.
*   Los informes se generan en formato Markdown y se ofrecen para descarga como archivos de texto.

## 5. Pila Tecnológica (Stack) Destacada
*   **Frontend:** Next.js (App Router), React, TypeScript.
*   **UI:** ShadCN UI Components, Tailwind CSS.
*   **Inteligencia Artificial:** Genkit (para generación de resúmenes e informes).
*   **Autenticación (Planeado):** Firebase Authentication (Google Sign-In para médicos, Email/Contraseña para secretarios/as).
*   **Base de Datos (Planeado):** Firestore (para almacenar metadatos de pacientes, citas, recetas, facturas, usuarios, etc.).
*   **Almacenamiento de Archivos (Planeado):** No se usará Google Drive directamente. Los archivos adjuntos se subirán y sus metadatos se almacenarán en Firestore; la descarga será simulada o gestionada a través de un servicio de almacenamiento si se implementa (ej. Cloud Storage).

## 6. Directrices de Estilo Visual
*   **Color Primario:** Azul Suave (`#64B5F6`) - Inspira confianza y tranquilidad.
*   **Color de Fondo:** Gris Claro (`#F0F4F7`) - Para un look limpio y profesional.
*   **Color de Acento:** Verde (`#4CAF50`) - Para acciones positivas y confirmaciones (actualmente usado en el calendario).
*   **Fuentes:** Limpias, sans-serif (Geist Sans por defecto) para óptima legibilidad.
*   **Iconografía:** Consistente usando `lucide-react`.
*   **Diseño:** Estructurado, con agrupación lógica de la información.
*   **Componentes:** Preferencia por componentes de ShadCN, estéticamente agradables y funcionales, con esquinas redondeadas y sombras sutiles.
*   **Responsividad:** La aplicación debe ser usable en dispositivos móviles y de escritorio.
*   **Transiciones:** Sutiles para acciones como guardar, editar.

## 7. Consideraciones Futuras (Fuera del Alcance Actual del Prototipo)
*   Implementación completa de la lógica de backend con Firestore.
*   Integración real con Firebase Authentication para todos los roles.
*   Gestión completa de usuarios y permisos desde la interfaz del médico.
*   Flujo de creación y edición detallado para facturas.
*   Funcionalidad de "favoritos" para fármacos en recetas.
*   Notificaciones.
*   Despliegue en producción en Google Cloud Platform.
*   Si se requiere almacenamiento de archivos real, integración con Cloud Storage.
