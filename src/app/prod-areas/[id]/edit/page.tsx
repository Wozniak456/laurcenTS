import { db } from "@/db";
import { notFound } from "next/navigation";
import ProdAreaEditForm from "@/components/ProdArea/area-edit-form";

export const dynamic = "force-dynamic";

interface ProdAreaEditPageProps {
  params: {
    id: string;
  };
}

export default async function ProdAreaEditPage(props: ProdAreaEditPageProps) {
  const id = parseInt(props.params.id);
  const area = await db.productionareas.findFirst({
    where: { id },
  });

  if (!area) {
    notFound();
  }

  return (
    <div>
      <ProdAreaEditForm area={area} />
    </div>
  );
}
