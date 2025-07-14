import { db } from "@/db";
import { notFound } from "next/navigation";
import ProdLineEditForm from "@/components/ProdLines/line-edit-form";

export const dynamic = "force-dynamic";

interface ProdLineEditPageProps {
  params: {
    id: string;
  };
}

export default async function ProdLineEditPage(props: ProdLineEditPageProps) {
  const id = parseInt(props.params.id);
  const line = await db.productionlines.findFirst({
    where: { id },
  });

  if (!line) {
    notFound();
  }

  return (
    <div>
      <ProdLineEditForm line={line} />
    </div>
  );
}
