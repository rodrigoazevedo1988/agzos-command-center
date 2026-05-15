import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const newToken = randomUUID();

await db
  .update(usersTable)
  .set({
    inviteUsedAt: null,
    inviteToken: newToken,
    passwordHash: null,
  })
  .where(eq(usersTable.email, "rodrigo.azevedo1988@gmail.com"));

console.log("✅ Token resetado para Rodrigo:");
console.log("   Email: rodrigo.azevedo1988@gmail.com");
console.log("   Novo token:", newToken);
process.exit(0);
