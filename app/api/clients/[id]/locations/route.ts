import { NextResponse } from "next/server";

import { listActiveClientLocations } from "@/lib/data/client-locations";
import { getClientById } from "@/lib/data/clients";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id: clientId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const client = await getClientById(supabase, clientId);
  if (!client || client.user_id !== user.id) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const locations = await listActiveClientLocations(supabase, clientId, user.id);

  return NextResponse.json({
    locations: locations.map((location) => ({
      id: location.id,
      label: location.label,
      address_line1: location.address_line1,
      address_line2: location.address_line2,
      postal_code: location.postal_code,
      city: location.city,
      country: location.country,
      is_default: location.is_default,
    })),
  });
}
