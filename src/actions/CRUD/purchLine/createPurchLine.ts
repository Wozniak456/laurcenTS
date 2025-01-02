"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPurchLine(
  formState: { message: string },
  formData: FormData
) {
  try {
    console.log("createPurchLineRecord", formData);
    const purchase_id: number = parseInt(formData.get("purchase_id") as string);
    const item_id: number = parseInt(formData.get("item_id") as string);
    const quantity: number = parseFloat(formData.get("quantity") as string);
    const unit_id: number = parseInt(formData.get("unit_id") as string);

    const result = await db.$transaction(async (prisma) => {
      await prisma.purchaselines.create({
        data: {
          purchase_id,
          item_id,
          quantity,
          unit_id,
        },
      });
    });
    revalidatePath("/purchtable/view");
    redirect("/purchtable/view");
    return { message: "" }; // Return success message
  } catch (error: any) {
    // Handle the error and return a meaningful message
    console.error(error);
    return {
      message: "Something went wrong while creating the purchase line.",
    };
  }
}
