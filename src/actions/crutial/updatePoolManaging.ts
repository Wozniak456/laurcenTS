"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stockPool } from "./stockPool";

export async function updatePoolManaging(
  today: string
  // formState: { message: string } | undefined,
  // formData: FormData
) {
  revalidatePath(`/pool-managing/day/${today}`);
  redirect(`/pool-managing/day/${today}`);
}
