"use client";

import { LoadingButton } from "@/features/form/submit-button";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { openStripePortalAction } from "../../../billing.action";

type PlanCardActionProps = {
  label: string;
  variant?: "default" | "outline" | "secondary";
};

export function PlanCardAction({
  label,
  variant = "default",
}: PlanCardActionProps) {
  const portalMutation = useMutation({
    mutationFn: async () => {
      return resolveActionResult(openStripePortalAction());
    },
    onSuccess: (result) => {
      if (result.url) {
        window.location.href = result.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <LoadingButton
      onClick={() => portalMutation.mutate()}
      loading={portalMutation.isPending}
      variant={variant}
      className="w-full"
    >
      {label}
    </LoadingButton>
  );
}
