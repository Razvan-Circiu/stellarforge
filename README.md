# stellarforge

Atlas personal al cerului – aplicație CRUD pentru Obiecte astronomice, Locații, Echipament și Observații, cu planner circular (altitudine în timp, Soare/Lună) și fundal 3D (stele, bandă „Calea Lactee”, planete) realizat cu three + @react-three/fiber.
Livrabile
Adresa repository-ului: https://github.com/Razvan-Circiu/stellarforge.git
Instrucțiuni de compilare / instalare / lansare:
Secțiunile „Prerechizite”, „Instalare”, „Rulare (dev)”, „Build & run (prod)”.
Prerechizite
Node.js 20+ (recomandat: 22.x)
npm (implicit cu Node)
Acces la un terminal (macOS/Linux/WSL sau PowerShell)
git clone  https://github.com/Razvan-Circiu/stellarforge.git
cd stellarforge
npm install
npx prisma format
npx prisma migrate dev -n init
npx prisma generate
npm run dev
Tech stack
Next.js 15 (App Router, Turbopack) – frontend & API routes
TypeScript
Tailwind CSS v4 (plugin @tailwindcss/postcss)
Prisma ORM + SQLite (dev)
three + @react-three/fiber – fundal 3D (stele, Calea Lactee, planete)
Funcționalități
CRUD:
Obiecte (Messier/NGC …, RA/Dec, mag, constelație)
Locații (lat/lon, Bortle)
Echipament (tip, model, specificații)
Observații (obiect/site/gear, seeing, note, upload imagine)
Planner circular: altitudine reală pentru 24h (pas 30 min), filtre:
noapte astronomică (Soare < −18°)
separație Lună–obiect > 30°
Export/Import CSV pentru Obiecte
Fundal 3D:planete cu atmosferă/inele
Night-Red mode (toggle pentru observare pe timp de noapte)
Toasts pentru feedback acțiuni
