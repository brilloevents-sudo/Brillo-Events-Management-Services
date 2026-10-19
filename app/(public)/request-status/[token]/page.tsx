"use client";

import { useParams } from "next/navigation";
import { XenditPaymentPortal } from "@/components/funnel/xendit-payment-portal";

export default function RequestStatusTokenPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";
  return <XenditPaymentPortal tokenFromProp={token} />;
}
