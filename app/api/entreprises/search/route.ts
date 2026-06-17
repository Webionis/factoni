import { NextResponse } from "next/server";

import { searchFrenchCompanies } from "@/lib/entreprises/recherche-entreprises";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (q.length > 120) {
    return NextResponse.json(
      { error: "Requête trop longue" },
      { status: 400 },
    );
  }

  try {
    const results = await searchFrenchCompanies(q, { limit: 8 });
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Service de recherche indisponible. Réessayez dans un instant." },
      { status: 502 },
    );
  }
}
