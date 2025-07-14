import { db } from "@/db";
import CreateEditSalesLine from "@/components/SalesLines/create-new-sales-line";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface NewSalesLineComponentProps {
  params: {
    id: string;
  };
}

export default async function NewSalesLineComponent(
  props: NewSalesLineComponentProps
) {
  try {
    const header = await db.salestable.findFirst({
      select: {
        id: true,
        doc_id: true,
        date_time: true,
        customers: true,
        saleslines: true,
      },
      where: {
        id: BigInt(props.params.id),
      },
    });

    if (!header) {
      notFound();
    }

    const items = await db.items.findMany({
      include: {
        units: true,
      },
    });

    return <CreateEditSalesLine header={header} items={items} />;
  } catch (error) {
    console.error("Error fetching batch data:", error);
  }
  // finally {
  //     await db.$executeRaw`SELECT pg_terminate_backend(pid)
  //                          FROM pg_stat_activity
  //                          WHERE state = 'idle';`;
  //     console.log('Disconnected idle sessions successfully.');
  // }
}
