import { getDb } from "../server/queries/connection";
import { posts, comments, postLikes } from "./schema.js";

const SEED_POSTS = [
  {
    userId: 1,
    content: "Acabo de descubrir que puedes hacer debugging de React con el nuevo React DevTools y es una locura. El profiler ahora muestra exactamente que componentes se re-renderizan y por que.\n\nSi todavia usas console.log para debuggear, pruebalo. Te cambia la vida.",
    code: `// React DevTools Profiler API\nimport { Profiler } from 'react';\n\nfunction onRenderCallback(id, phase, actualDuration) {\n  console.log({ id, phase, actualDuration });\n}\n\n<Profiler id="App" onRender={onRenderCallback}>\n  <App />\n</Profiler>`,
    codeLanguage: "tsx",
    tags: "react,devtools,debugging,performance",
    likesCount: 47,
    commentsCount: 2,
  },
  {
    userId: 1,
    content: "Hot take: TypeScript es necesario para cualquier proyecto que tenga mas de un desarrollador. El tiempo que ahorras escribiendo JavaScript lo pierdes 10x buscando bugs en produccion.",
    code: null,
    codeLanguage: null,
    tags: "typescript,javascript,hot-take",
    likesCount: 132,
    commentsCount: 2,
  },
  {
    userId: 1,
    content: "Deploye mi side project con Rust + WebAssembly y el rendimiento es increible. 60FPS consistentes procesando datos en tiempo real directo en el navegador.",
    code: `#[wasm_bindgen]\npub fn process_data(input: &[f32]) -> Vec<f32> {\n    input.par_iter()\n        .map(|x| x * 2.0 + 1.0)\n        .collect()\n}`,
    codeLanguage: "rust",
    tags: "rust,webassembly,performance,wasm",
    likesCount: 89,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "Alguien mas odia los merge conflicts? Acabo de pasar 3 horas resolviendo uno solo porque alguien renombro un archivo que yo estaba editando.\n\nPro tip: comunicar tus cambios antes de hacer refactor masivo.",
    code: null,
    codeLanguage: null,
    tags: "git,teamwork,workflow",
    likesCount: 234,
    commentsCount: 1,
  },
  {
    userId: 1,
    content: "Docker multi-stage builds son el hack que nadie te ensena. Mi imagen paso de 1.2GB a 87MB solo separando build y runtime.",
    code: `# Build stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json .\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Runtime stage\nFROM node:20-alpine AS runtime\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCMD ["node", "dist/index.js"]`,
    codeLanguage: "dockerfile",
    tags: "docker,devops,optimization",
    likesCount: 156,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "Pregunta seria: que stack usarian para un MVP en 2025?\n\nYo iria con:\n- Next.js 15 (App Router)\n- tRPC + Drizzle\n- PostgreSQL\n- Vercel\n\nUstedes que dicen?",
    code: null,
    codeLanguage: null,
    tags: "mvp,stack,advice,2025",
    likesCount: 45,
    commentsCount: 1,
  },
  {
    userId: 1,
    content: "Aprendi algo nuevo hoy: los CSS container queries son MUCHO mejores que los media queries para componentes reutilizables. El componente se adapta a su contenedor, no al viewport.",
    code: `.card-container {\n  container-type: inline-size;\n}\n\n@container (min-width: 400px) {\n  .card {\n    display: grid;\n    grid-template-columns: 200px 1fr;\n  }\n}`,
    codeLanguage: "css",
    tags: "css,frontend,responsive",
    likesCount: 92,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "Me acabo de enterar que puedes hacer reverse debugging en VS Code con el extension de JavaScript debugger. Puedes ejecutar el codigo HACIA ATRAS. Esto hubiera salvado mi semana pasada.",
    code: `// .vscode/launch.json\n{\n  "type": "node",\n  "request": "launch",\n  "name": "Debug",\n  "runtimeExecutable": "npx",\n  "runtimeArgs": ["tsx", "--inspect-brk"],\n  "args": ["src/index.ts"]\n}`,
    codeLanguage: "json",
    tags: "vscode,debugging,javascript,tips",
    likesCount: 198,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "Terminando mi primer proyecto open source real. Es un CLI tool para generar scaffolding de proyectos. Si alguien quiere probarlo y darme feedback, seria genial!\n\nLink en mi perfil.",
    code: null,
    codeLanguage: null,
    tags: "opensource,cli,project,feedback",
    likesCount: 67,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "El mindset de 'move fast and break things' esta muerto. En 2025 el que gana es el que construye software robusto, testeado y mantenible. Calidad sobre velocidad, siempre.",
    code: null,
    codeLanguage: null,
    tags: "mindset,quality,software-engineering",
    likesCount: 312,
    commentsCount: 0,
  },
  {
    userId: 1,
    content: "Configurando CI/CD por primera vez con GitHub Actions. Me tarde mas en entender la sintaxis de los workflows que en escribir el codigo de la app.\n\nPero ahora cada push a main se deploya automatico y es magia pura.",
    code: null,
    codeLanguage: null,
    tags: "github-actions,cicd,devops,learning",
    likesCount: 54,
    commentsCount: 0,
  },
];

const SEED_COMMENTS = [
  { postId: 1, userId: 1, content: "Totalmente de acuerdo. El profiler de React DevTools es una joya subestimada." },
  { postId: 1, userId: 1, content: "Yo lo uso en produccion tambien. Ayuda a identificar renders innecesarios en tiempo real." },
  { postId: 2, userId: 1, content: "Discrepo. Para proyectos pequenos y rapidos, JavaScript vanilla es suficiente." },
  { postId: 2, userId: 1, content: "Esto. TypeScript paga su costo inicial 100x en proyectos medianos y grandes." },
  { postId: 4, userId: 1, content: "git rerere es tu amigo para esto. Activalo y te ahorra tiempo." },
  { postId: 6, userId: 1, content: "Yo cambiaria PostgreSQL por Turso (SQLite en edge) si es un proyecto personal." },
];

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  await db.delete(comments);
  await db.delete(postLikes);
  await db.delete(posts);

  for (const post of SEED_POSTS) {
    await db.insert(posts).values(post);
  }
  console.log(`Inserted ${SEED_POSTS.length} posts`);

  for (const comment of SEED_COMMENTS) {
    await db.insert(comments).values(comment);
  }
  console.log(`Inserted ${SEED_COMMENTS.length} comments`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
