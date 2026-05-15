/**
 * Script de seed — cria os 2 usuários admin com tokens de convite.
 * Execute UMA única vez: pnpm tsx src/scripts/seed-admins.ts
 *
 * Os tokens gerados devem ser enviados manualmente para cada usuário.
 */

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const ADMINS = [
  { email: "rodrigo.azevedo1988@gmail.com", name: "Rodrigo Azevedo" },
  { email: "darnaldo00@gmail.com", name: "Arnaldo" },
];

async function main() {
  console.log("🔑 Gerando tokens de convite para os admins...\n");

  for (const admin of ADMINS) {
    // Verifica se já existe
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, admin.email))
      .limit(1);

    if (existing) {
      console.log(`⚠️  Usuário ${admin.email} já existe — pulando.`);
      if (existing.inviteToken && !existing.inviteUsedAt) {
        console.log(`   Token atual: ${existing.inviteToken}\n`);
      } else if (existing.inviteUsedAt) {
        console.log(`   Conta já configurada (senha definida).\n`);
      }
      continue;
    }

    const token = randomUUID();

    await db.insert(usersTable).values({
      email: admin.email,
      name: admin.name,
      role: "admin",
      inviteToken: token,
    });

    console.log(`✅ Admin criado: ${admin.email}`);
    console.log(`   Nome: ${admin.name}`);
    console.log(`   Token de convite: ${token}`);
    console.log(`   → Envie este token para o usuário acessar /login (aba "Primeiro acesso")\n`);
  }

  console.log("Concluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao executar seed:", err);
  process.exit(1);
});
