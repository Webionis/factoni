import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatClientLocationAddress,
  parseClientLocationSnapshot,
} from "@/lib/invoices/location-snapshot";
import type { Json } from "@/types/database";

interface InterventionLocationCardProps {
  snapshot: Json | null;
  className?: string;
}

export function InterventionLocationCard({
  snapshot,
  className,
}: InterventionLocationCardProps) {
  const location = parseClientLocationSnapshot(snapshot);
  if (!location) return null;

  const address = formatClientLocationAddress(location);
  if (!address) return null;

  return (
    <Card className={className}>
      <CardHeader className="px-5 pb-2 pt-5 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          Lieu d&apos;intervention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-5 pb-5 text-sm sm:px-6 sm:pb-6">
        <p className="font-medium text-foreground">{location.label}</p>
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {address}
        </p>
      </CardContent>
    </Card>
  );
}
