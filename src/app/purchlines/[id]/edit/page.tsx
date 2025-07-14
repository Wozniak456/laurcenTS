import { db } from "@/db";
import { notFound } from "next/navigation";
import PurchlineEditForm from "@/components/purchline-edit-form";

export const dynamic = "force-dynamic";

interface PurchlineEditPageProps {
  params: {
    id: string;
  };
}

export default async function PurchlineEditPage(props: PurchlineEditPageProps) {
  const id = parseInt(props.params.id);
  const purchLine = await db.purchaselines.findFirst({
    where: { id },
  });

  if (!purchLine) {
    notFound();
  }

  return (
    <div>
      <PurchlineEditForm purchline={purchLine} />
    </div>
  );
}
