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
    percent_feeding?: number;
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
  onRowUpdate?: (locId: number, feedId: number, newFeedings: any) => void;
  allLocationFeedings?: Feeding[];
  percentFeeding: number;
  feedBatchAction: any;
}

type itemAndTime = {
  item: string | undefined;
  time?: string;
} | null;

// Add type for server action response
interface FeedBatchResponse {
  message: string;
}

export default function RowForFeedingServer(props: RowForFeedingProps) {
  const [showForm, setShowForm] = useState(false);
  const [formState, action] = useFormState(feedBatch, { message: "" });

  // Prepare all props to pass to the client component, including action, formState, showForm, setShowForm, etc.
  return (
    <RowForFeedingClient
      {...props}
      showForm={showForm}
      setShowForm={setShowForm}
      formState={formState}
      action={action}
      onRowUpdate={props.onRowUpdate}
      cancelAction={cancelFeeding}
    />
  );
}
