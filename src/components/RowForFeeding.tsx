import React, { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import feedButton from "../../public/icons/typcn_arrow-up-outline.svg";
import copyButton from "../../public/icons/typcn_arrow-right-outline.svg";
import SuccessButton from "../../public/icons/SuccessFeeding.svg";
import CrossButton from "../../public/icons/UnsuccessfulFeeding.svg";
import cancelIcon from "../../public/icons/cancel-icon.svg";
import { useFormState } from "react-dom";
import * as actions from "@/actions";
import {
  checkLaterTransactions,
  cancelFeeding,
} from "@/actions/crutial/cancelFeeding";
import FormButton from "./common/form-button";
import { poolInfo } from "@/actions/stocking";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { getPercentFeedingForDate } from "@/utils/periodic";
import RowForFeedingClient from "./RowForFeedingClient";
import { feedBatch } from "@/actions";

interface Feeding {
  feedType: string;
  feedName?: string;
  feedId?: number;
  feedings?: {
    [time: string]: {
      feeding?: string;
      editing?: string;
      hasDocument?: boolean;
    };
  };
}

interface RowForFeedingProps {
  locInfo: {
    id: number;
    name: string;
  };
  rowData: Feeding;
  times: {
    id: number;
    time: string;
  }[];
  rowCount?: number;
  today: string;
  batch?: {
    id: number;
    name: string;
  };
  onRefresh?: () => void;
  onRowUpdate?: (
    locId: number,
    feedId: number,
    newFeedings: Feeding["feedings"]
  ) => void;
  allLocationFeedings?: Feeding[];
  percentFeeding: number;
  feedBatchAction: typeof feedBatch;
}

type itemAndTime = {
  item: string | undefined;
  time?: string;
} | null;

// Add type for server action response
interface FeedBatchResponse {
  message: string;
}

interface FormState {
  message: string;
}

export default function RowForFeedingServer(props: RowForFeedingProps) {
  const [showForm, setShowForm] = useState(false);
  const [formState, action] = useFormState<FormState, FormData>(
    async (state: FormState, formData: FormData) => {
      const result = await feedBatch(state, formData);
      return result;
    },
    { message: "" }
  );

  const handleAction = async (formData: FormData) => {
    const result = await action(formData);
    return result;
  };

  return (
    <RowForFeedingClient
      {...props}
      showForm={showForm}
      setShowForm={setShowForm}
      formState={formState}
      action={handleAction}
      onRowUpdate={props.onRowUpdate}
      cancelAction={async (locId: number, date: string, feedId: number) => {
        const result = await cancelFeeding(locId, date, feedId);
        return result;
      }}
    />
  );
}
