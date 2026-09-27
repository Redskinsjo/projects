import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });
const require = createRequire(import.meta.url);
function prisma(...args) {
  const result = spawnSync(
    process.execPath,
    [
      path.join(
        path.dirname(require.resolve("prisma/package.json")),
        "build/index.js",
      ),
      ...args,
    ],
    { cwd: root, env: process.env, stdio: "inherit" },
  );
  if (result.error || result.status !== 0) {
    console.error(
      "PKida : initialisation de la base interrompue. Vérifiez DATABASE_URL et l’accès à PostgreSQL.",
    );
    process.exit(result.status || 1);
  }
}
const mode = process.argv[2];
if (mode === "prepare") prisma("generate");
if (!process.env.DATABASE_URL) {
  if (mode === "prepare") {
    console.warn(
      "PKida : ajoutez DATABASE_URL dans .env.local puis redémarrez pour activer la sauvegarde PostgreSQL.",
    );
    process.exit(0);
  }
  console.error(
    "PKida : DATABASE_URL est nécessaire pour appliquer les migrations.",
  );
  process.exit(1);
}
prisma("migrate", "deploy");
