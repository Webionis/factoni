"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      closeButton
      duration={3800}
      gap={10}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[#16a34a]" strokeWidth={2} />
        ),
        info: <InfoIcon className="size-4 text-[#2563eb]" strokeWidth={2} />,
        warning: (
          <TriangleAlertIcon className="size-4 text-[#d97706]" strokeWidth={2} />
        ),
        error: (
          <OctagonXIcon className="size-4 text-[#dc2626]" strokeWidth={2} />
        ),
        loading: <Loader2Icon className="size-4 animate-spin text-[#64748b]" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "font-semibold text-[#0f172a]",
          description: "text-[#64748b]",
          closeButton:
            "border-[rgba(15,23,42,0.08)] bg-white text-[#64748b] hover:text-[#0f172a]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
