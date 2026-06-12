# DevConnect — Social Video y Feedback

> Red social para desarrolladores. Comparte código, da feedback, conecta con otros devs.

🔗 **Demo en vivo:** [dev-connect-social-video-y-feedback.vercel.app](https://dev-connect-social-video-y-feedback.vercel.app)

---

## ¿Qué es DevConnect?

DevConnect es una plataforma social pensada exclusivamente para desarrolladores de software. Funciona como un feed de Twitter/X pero orientado al código: puedes publicar posts con fragmentos de código con syntax highlighting, dar likes, repostear, comentar, y explorar publicaciones de otros devs.

No necesitas registrarte con OAuth para probarlo — el botón **"Entrar como Demo"** te da acceso inmediato.

### Funcionalidades

- **Feed en tiempo real** — publicaciones con texto y bloques de código en 14+ lenguajes
- **Syntax highlighting** — visualización clara de código en TypeScript, Python, Go, Rust, SQL, y más
- **Likes y reposts optimistas** — respuesta inmediata en UI sin esperar al servidor
- **Comentarios** — sección de comentarios por post con actualización instantánea
- **Login demo** — acceso sin cuentas externas, ideal para evaluar la app
- **Landing page animada** — hero 3D, parallax, grid cinético, y secciones con GSAP
- **Modo sin base de datos** — corre completamente en memoria cuando no hay `DATABASE_URL`

---

## Stack técnico

### Frontend

| Tecnología | Uso |
|---|---|
| **React 19** | UI declarativa con las últimas features (use, compiler) |
| **TypeScript** | Tipado estático end-to-end |
| **Vite 7** | Build ultrarrápido con HMR |
| **React Router v7** | Navegación SPA con hash router |
| **TanStack Query v5** | Server state, caché y sincronización |
| **tRPC v11** | Llamadas de API type-safe sin código generado |
| **Tailwind CSS v3** | Estilos utilitarios |
| **Radix UI** | Componentes accesibles sin opinión de estilos |
| **GSAP** | Animaciones de scroll y transiciones |
| **Three.js** | Gráficos 3D en la landing |
| **Lucide React** | Iconografía |
| **Zod** | Validación de esquemas en cliente y servidor |
| **superjson** | Serialización que preserva tipos (Date, Map, etc.) |

### Backend

| Tecnología | Uso |
|---|---|
| **Hono** | Servidor HTTP minimalista y ultrarrápido |
| **tRPC** | Router type-safe compartido con el frontend |
| **Drizzle ORM** | Queries SQL tipadas y migraciones |
| **MySQL 2** | Driver de base de datos (Aiven / Railway) |
| **jose** | Firma y verificación de JWT (sessions) |
| **In-memory mock store** | Modo demo sin base de datos real |

### Infraestructura y DevOps

| Tecnología | Uso |
|---|---|
| **Vercel** | Deploy serverless del frontend y API |
| **esbuild** | Pre-bundling del servidor para resolver path aliases en Vercel |
| **Node.js** | Runtime del servidor |
| **@hono/node-server** | Adaptador Hono → handler serverless de Vercel |

---

## Arquitectura

```
app/
├── src/                    # Frontend React
│   ├── components/         # UI components (PostCard, CommentSection, …)
│   ├── pages/              # Dashboard, Home, Login, NotFound
│   ├── sections/           # Secciones animadas de la landing
│   ├── providers/          # TRPCProvider, QueryClient
│   └── hooks/              # useAuth, useToast
├── server/                 # Backend Hono + tRPC
│   ├── router.ts           # AppRouter (auth, posts, comments)
│   ├── posts-router.ts     # CRUD de posts + likes
│   ├── comments-router.ts  # CRUD de comentarios
│   ├── auth-router.ts      # me, logout
│   ├── queries/            # Capa de datos (mock en memoria o MySQL)
│   └── lib/                # JWT, cookies, env
├── api/
│   ├── _src.ts             # Entry point del handler serverless
│   └── index.js            # Bundle pre-compilado para Vercel (esbuild)
└── vercel.json             # Config de Vercel (rewrite /api/* → index.js)
```

El servidor y el cliente comparten los tipos de la API a través del tipo `AppRouter` exportado desde `server/router.ts` — no hay generación de código, los tipos viajan directamente.

---

## Desafíos técnicos resueltos

### Serverless statelessness
Vercel corre cada request en una instancia diferente. El in-memory store se pierde entre requests. Soluciones aplicadas:
- **Pre-seeding de usuarios demo** al inicializar el módulo (no depende del runtime de cada request)
- **Optimistic updates** en la UI — likes, reposts y comentarios actualizan el estado local inmediatamente sin esperar al servidor

### Batching de tRPC en serverless
`httpBatchLink` agrupa queries y mutations en un solo request HTTP. En serverless esto causaba que `createPost` y `createComment` quedaran bloqueados indefinidamente. Solución: cambiar a `httpLink` para que cada llamada sea independiente.

### Path aliases en Vercel
El compilador de TypeScript de Vercel no resuelve aliases como `@contracts/*` o `@db/*`. Solución: pre-compilar el servidor con esbuild en tiempo de build y commitear `api/index.js` — Vercel lo despliega directamente como función sin recompilar.

### Errores de startup silenciosos
Sin manejo de errores, si el módulo del servidor lanzaba una excepción al inicializar, Vercel devolvía un crash genérico sin detalles. Solución: `api/_src.ts` envuelve la inicialización en `try/catch` y devuelve JSON 500 con el mensaje de error.

---

## Correr localmente

```bash
# Clonar
git clone https://github.com/eddyjosuetr-coder/DevConnect-Social-Video-y-Feedback.git
cd DevConnect-Social-Video-y-Feedback/app

# Instalar dependencias
npm install

# Desarrollo (sin DB — modo mock en memoria)
npm run dev

# Con base de datos real (MySQL)
echo "DATABASE_URL=mysql://..." > .env
npm run db:push
npm run dev
```

La app corre en `http://localhost:5173`. El servidor Hono se monta en `/api` a través del plugin de Vite.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | No | Conexión MySQL. Sin ella corre en modo mock. |
| `APP_SECRET` | No | Secreto para firmar JWTs. Tiene fallback inseguro para demo. |

---

## Autor

**Eddy Josue** — [@eddyjosuetr-coder](https://github.com/eddyjosuetr-coder)
