import { db } from "@/db";
import { notFound } from "next/navigation";
import ActualizationPage from "@/components/Pools/actualization-form";
import * as stockingActions from "@/actions/stocking";
import { poolManagingTypeExtended } from "@/types/app_types";
import * as actions from "@/actions";

interface PoolManagingShowPageProps {
  params: {
    day: string;
    id: string;
  };
}

export default async function PoolManagingShowPage(
  props: PoolManagingShowPageProps
) {
  try {
    let location = await db.locations.findFirst({
      where: { id: parseInt(props.params.id) },
    });

    if (!location) {
      notFound();
    }
    //console.log(props.params);
    const today = new Date(props.params.day);

    // let poolInfo = await stockingActions.poolInfo(props.params.id, today.toISOString().split("T")[0])

    let poolInfo: poolManagingTypeExtended | undefined =
      await stockingActions.poolInfo(
        parseInt(props.params.id),
        today.toISOString().split("T")[0]
      );

    poolInfo = {
      ...poolInfo,
      location: {
        id: location.id,
        name: location.name,
      },
    };

    const batches = await actions.getCatfishBatches();

    const feeds = await actions.getFeeds();

    // console.log('poolInfo: ', poolInfo)

    return (
      <>
        <ActualizationPage
          poolInfo={poolInfo}
          batches={batches}
          feeds={feeds}
          today={props.params.day}
        />
      </>
    );
  } catch (error) {
    console.error("Error fetching batch data:", error);
  }
}
