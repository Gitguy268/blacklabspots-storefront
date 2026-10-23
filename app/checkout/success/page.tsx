import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessClient } from "@/components/SuccessClient";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <Suspense fallback={<div className="py-24" />}>
        <SuccessClient />
      </Suspense>
    </div>
  );
}
