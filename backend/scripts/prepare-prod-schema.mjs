// Ubah provider Prisma dari "sqlite" (development) ke "postgresql" (production).
// Dijalankan otomatis oleh `npm run build:prod` di Render / Docker. Lintas OS (tanpa sed).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../prisma/schema.prisma');
const original = fs.readFileSync(schemaPath, 'utf8');
const updated = original.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');

if (original === updated && !/provider\s*=\s*"postgresql"/.test(original)) {
  console.error('[prepare-prod-schema] provider sqlite tidak ditemukan di schema.prisma');
  process.exit(1);
}

fs.writeFileSync(schemaPath, updated);
console.log('[prepare-prod-schema] Prisma provider -> postgresql');
