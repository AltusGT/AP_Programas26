# 📁 Project Structure - Therapeutic Programs PWA

## Recommended GitHub Repository Structure

```
AP_programas26/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions for deployment
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   ├── manifest.json                  # PWA manifest
│   └── icons/                         # PWA icons (various sizes)
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout with fonts
│   │   ├── page.tsx                   # Home/Dashboard page
│   │   ├── globals.css                # Global styles + Tailwind
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── registro/
│   │   │   └── page.tsx               # Data entry form (therapists)
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Dashboard (supervisors)
│   │   ├── estudiantes/
│   │   │   ├── page.tsx               # Students list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Student detail
│   │   └── programas/
│   │       ├── page.tsx               # Programs list
│   │       └── [id]/
│   │           └── page.tsx           # Program detail
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Mobile header
│   │   │   ├── Sidebar.tsx            # Desktop sidebar
│   │   │   ├── Navigation.tsx         # Main navigation
│   │   │   └── Footer.tsx
│   │   ├── forms/
│   │   │   ├── RegistroForm.tsx       # Session entry form
│   │   │   ├── EstudianteForm.tsx     # Student CRUD form
│   │   │   └── ProgramaForm.tsx       # Program CRUD form
│   │   ├── dashboard/
│   │   │   ├── MetricsCard.tsx        # Metric display cards
│   │   │   ├── ProgramsTable.tsx      # Programs data table
│   │   │   └── Charts.tsx             # Data visualizations
│   │   └── ui/
│   │       ├── Button.tsx             # Reusable button
│   │       ├── Input.tsx              # Form input
│   │       ├── Select.tsx             # Dropdown select
│   │       ├── Card.tsx               # Content card
│   │       └── Modal.tsx              # Modal dialog
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase client initialization
│   │   │   ├── server.ts              # Server-side Supabase client
│   │   │   └── middleware.ts          # Auth middleware
│   │   ├── utils/
│   │   │   ├── dateFormat.ts          # Date formatting utilities
│   │   │   └── validation.ts          # Form validation
│   │   └── constants.ts               # App constants
│   ├── types/
│   │   ├── database.types.ts          # Generated Supabase types
│   │   ├── supabase.ts                # Extended Supabase types
│   │   └── index.ts                   # Exported types
│   ├── hooks/
│   │   ├── useAuth.ts                 # Authentication hook
│   │   ├── useEstudiantes.ts          # Students data hook
│   │   ├── useProgramas.ts            # Programs data hook
│   │   └── useRegistros.ts            # Records data hook
│   └── middleware.ts                  # Next.js middleware for auth
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql     # Database migrations
│   └── config.toml                    # Supabase local config
├── .env.local.example                 # Environment variables template
├── .env.local                         # Local environment (gitignored)
├── .gitignore
├── next.config.js                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json
├── package-lock.json
└── README.md                          # Project documentation
```

## Key Architectural Decisions

### 1. **Next.js App Router** (not Pages Router)
- Modern approach with Server Components by default
- Better performance and SEO
- File-based routing in `src/app/`

### 2. **Mobile-First Architecture**
- All components start with mobile breakpoint
- Progressive enhancement for larger screens
- Touch-optimized UI elements

### 3. **Supabase Integration**
- Client-side for interactive features
- Server-side for auth and secure operations
- Real-time subscriptions for live updates

### 4. **Type Safety**
- Generated types from Supabase schema
- Full TypeScript coverage
- Compile-time error checking

### 5. **Component Organization**
- UI components in `components/ui/` (reusable)
- Feature components in `components/[feature]/`
- Layout components in `components/layout/`

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Getting Started

```bash
# Install dependencies
npm install

# Generate Supabase types
npx supabase gen types typescript --project-id your_project_id > src/types/database.types.ts

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## PWA Configuration

The app is configured as a Progressive Web App with:
- Service worker for offline support
- Installable on mobile devices
- App-like experience on iOS and Android

## Git Workflow

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit: Therapeutic programs PWA"
git branch -M main
git remote add origin https://github.com/your-username/AP_programas26.git
git push -u origin main
```

## Deployment Options

1. **Vercel** (Recommended for Next.js)
   - Connect GitHub repository
   - Automatic deployments on push
   - Zero configuration

2. **Netlify**
   - Similar to Vercel
   - Good for static exports

3. **GitHub Pages** (Static export only)
   - Requires `next.config.js` configuration
   - Limited to static sites
