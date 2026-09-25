import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { anonymizeExpiredOrders } from "@/lib/orders.server";

// Appelée chaque jour par Vercel Cron (voir vercel.json).
export async function GET(request: NextRequest) {
  if (!env.cronSecret || request.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return new NextResponse("Non autorisé", { status: 401 });
  }
  const count = await anonymizeExpiredOrders();
  return NextResponse.json({ anonymized: count });
}
