'use server'
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { stockPool } from "./stockPool";

export async function updatePoolManaging(
    // formState: { message: string } | undefined,
    // formData: FormData
){
    revalidatePath(`/pool-managing/view`)
    redirect(`/pool-managing/view`)
}