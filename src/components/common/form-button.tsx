"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@nextui-org/react";

interface FormButtonProps {
  color:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function FormButton({
  color,
  children,
  disabled,
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      color={color}
      isLoading={pending}
      isDisabled={disabled}
    >
      {children}
    </Button>
  );
}
