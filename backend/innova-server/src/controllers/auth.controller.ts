import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { prisma } from "../lib/prisma.js";
import type { UserRole } from "../models/user.model.js";
import type { CookieOptions } from "express";

function mapRole(role: string): UserRole {
  const r = role.trim().toLowerCase();

  if (r === "administrador") return "admin";
  if (r === "gerente") return "gerente";

  throw new Error("Rol inválido: " + role);
}

export async function login(req: Request, res: Response): Promise<void> {
  const userName = String(req.body?.userName ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");
  if (!userName || !password) {
    res.status(400).json({ message: "Usuario y contraseña requeridos" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: userName } });
  if (!user) {
    res.status(401).json({ message: "Credenciales incorrectas" });
    return;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401).json({ message: "Credenciales incorrectas" });
    return;
  }

  const role = mapRole(user.role);
  const token = jwt.sign(
    { sub: user.email, name: user.email, role },
    config.jwt.secret,
    {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      expiresIn: config.jwt.expiresIn,
    },
  );

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };

  res.cookie("innova_token", token, cookieOptions);
  res.json({ token, userName: user.email, role });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("innova_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  res.json({ success: true });
}
export async function me(req: Request, res: Response): Promise<void> {
  const a = req.auth;

  if (!a) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  res.json({ userName: a.name, role: a.role });
}
