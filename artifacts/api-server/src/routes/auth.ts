import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function signToken(payload: { id: number; email: string; name: string; role: string }) {
  const secret = process.env["JWT_SECRET"];
  const expiresIn = (process.env["JWT_EXPIRES_IN"] ?? "7d") as jwt.SignOptions["expiresIn"];

  if (!secret) throw new Error("JWT_SECRET não configurado.");

  return jwt.sign(payload, secret, { expiresIn });
}

// POST /api/auth/setup — primeiro acesso via token de convite
router.post("/auth/setup", async (req, res) => {
  const { email, token, password, name } = req.body as {
    email?: string;
    token?: string;
    password?: string;
    name?: string;
  };

  if (!email || !token || !password || !name) {
    res.status(400).json({ error: "email, token, password e name são obrigatórios." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "A senha deve ter no mínimo 8 caracteres." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  if (user.inviteToken !== token) {
    res.status(401).json({ error: "Token de convite inválido." });
    return;
  }

  if (user.inviteUsedAt) {
    res.status(409).json({ error: "Este token já foi utilizado. Faça login normalmente." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .update(usersTable)
    .set({
      passwordHash,
      name: name.trim(),
      inviteUsedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id));

  const jwtToken = signToken({ id: user.id, email: user.email, name: name.trim(), role: user.role });

  res.json({
    token: jwtToken,
    user: { id: user.id, email: user.email, name: name.trim(), role: user.role },
  });
});

// POST /api/auth/login — login com email e senha
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email e password são obrigatórios." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  const jwtToken = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });

  res.json({
    token: jwtToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// GET /api/auth/me — retorna o usuário autenticado
router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
