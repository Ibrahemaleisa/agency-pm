"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { str, type ActionState } from "@/lib/action-state";

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email");
  const password = str(fd, "password");
  if (!email || !password) return { error: "Email and password are required." };
  const user = await verifyCredentials(email, password);
  if (!user) return { error: "Invalid email or password." };
  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
