"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface editVendorFormState {
  // errors:{
  //     delivery_date?: string[],
  //     vendor_id?: string[],
  //     vendor_doc_number?: string[],
  //     _form?: string[]
  // }
}

export async function editVendor(
  formState: editVendorFormState,
  formData: FormData
): Promise<editVendorFormState> {
  try {
    //console.log('editeditVendor', formData)
    const vendor_id: number = parseInt(formData.get("vendor_id") as string);
    const vendor_name = formData.get("name") as string;
    const vendor_description = formData.get("description") as string;

    const vendor = await db.vendors.update({
      where: { id: vendor_id },
      data: {
        name: vendor_name,
        description: vendor_description,
      },
    });
  } catch (err: unknown) {
    return { errors: {} };
  }
  revalidatePath("/vendors/view");
  revalidatePath("/purchtable/view");
  revalidatePath("/accumulation/view");
  redirect("/vendors/view");
}
