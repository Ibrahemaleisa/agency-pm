"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { str, type ActionState } from "@/lib/action-state";
import { getDict } from "@/lib/lang";

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { t } = await getDict();
  const email = str(fd, "email");
  const password = str(fd, "password");
  if (!email || !password) return { error: t.login.errorRequired };
  const user = await verifyCredentials(email, password);
  if (!user) return { error: t.login.errorInvalid };
  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
