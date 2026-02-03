# 📱 Programas Terapéuticos - PWA

Sistema de registro y seguimiento de programas terapéuticos con Next.js, Tailwind CSS y Supabase.

## 🎯 Características

- **100% Mobile-First**: Diseñado desde móvil hacia escritorio
- **PWA**: Instalable en dispositivos móviles
- **Tipografía Profesional**: Open Sans + Roboto
- **Real-time**: Sincronización en tiempo real con Supabase
- **Seguro**: Row Level Security (RLS) implementado
- **Type-Safe**: 100% TypeScript

## 🚀 Inicio Rápido

### 1. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ir a SQL Editor
3. Ejecutar el script [`supabase-schema.sql`](./supabase-schema.sql)
4. Copiar las credenciales del proyecto

### 2. Configurar Variables de Entorno

```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### 3. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

La aplicación estará disponible en **http://localhost:3000**

## 📁 Estructura del Proyecto

```
AP_programas26/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Layout principal con fuentes
│   │   ├── page.tsx           # Página de inicio (Dashboard)
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   └── dashboard/         # Componentes del Dashboard
│   ├── lib/
│   │   └── supabase/          # Clientes Supabase
│   └── types/                 # TypeScript types
├── public/
│   ├── manifest.json          # PWA manifest
│   └── ...                    # Assets estáticos
├── supabase-schema.sql        # Schema de base de datos
└── PROJECT_STRUCTURE.md       # Documentación completa
```

## 🗄️ Base de Datos

### Tablas Principales

- **estudiantes**: Información de estudiantes
- **programas_catalogo**: Catálogo de programas terapéuticos
- **registros_programas**: Registros de sesiones y resultados
- **roles_usuarios**: Sistema de roles (terapeuta, supervisora, admin)

### Vistas Predefinidas

- `vista_programas_activos`: Programas en estado "Abierto"
- `vista_metricas_dashboard`: Métricas agregadas para dashboard

Ver [`supabase-schema.sql`](./supabase-schema.sql) para detalles completos.

## 🎨 Diseño

### Tipografía

- **Títulos**: Open Sans (600, 700)
- **Texto**: Roboto (300, 400, 500, 700)
- **Números**: Roboto Mono (400, 500)

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px

## 🔒 Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Políticas de acceso basadas en roles
- Autenticación con Supabase Auth
- Variables de entorno para credenciales

## 📦 Deploy

### Vercel (Recomendado)

1. Push a GitHub
2. Conectar repositorio en [Vercel](https://vercel.com)
3. Configurar variables de entorno
4. Deploy automático

### Otras Opciones

- Netlify
- GitHub Pages (static export)
- Self-hosted

## 📚 Documentación

- [Estructura del Proyecto](./PROJECT_STRUCTURE.md)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 👥 Roles de Usuario

- **Terapeuta**: Registro de sesiones desde móvil
- **Supervisora**: Registro de sesiones + Gestión completa + Dashboard
- **Admin**: Administración de usuarios y roles

## 🛠️ Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Fonts**: Google Fonts (Open Sans, Roboto)

## 📱 PWA

La aplicación es instalable en dispositivos móviles:

1. Abrir en Chrome/Safari mobile
2. Agregar a pantalla de inicio
3. Usar como app nativa

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📞 Soporte

Para preguntas o soporte, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para terapeutas y supervisoras**
