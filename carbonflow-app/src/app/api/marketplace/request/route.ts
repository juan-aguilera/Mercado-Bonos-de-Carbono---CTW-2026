import { NextRequest, NextResponse } from "next/server";
import { addRequest, listRequests, updateRequest } from "@/lib/marketplace/requestStore";
import type { MarketplaceRequest, RequestCategory } from "@/lib/marketplace/types";
import { delay, simulatedMarketplaceReply } from "@/lib/simulador";

export async function GET() {
  return NextResponse.json({ requests: listRequests() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = body.category as RequestCategory;
    if (!body.listingId || !body.requesterName || !body.requesterEmail || !body.consentAt) {
      return NextResponse.json({ error: "Faltan campos obligatorios o consentimiento" }, { status: 400 });
    }
    if (category === "reported_credit" && body.requestType?.toLowerCase().includes("comercial")) {
      return NextResponse.json({ error: "No se admiten solicitudes comerciales sobre créditos retirados" }, { status: 400 });
    }

    const created: MarketplaceRequest = {
      id: crypto.randomUUID(),
      category,
      listingId: body.listingId,
      listingTitle: body.listingTitle,
      needId: body.needId,
      projectId: body.projectId,
      compatibilityScore: body.compatibilityScore,
      requesterName: body.requesterName,
      requesterOrganization: body.requesterOrganization ?? "",
      requesterEmail: body.requesterEmail,
      requesterPhone: body.requesterPhone,
      requestType: body.requestType,
      message: body.message ?? "",
      sharedFields: body.sharedFields ?? [],
      consentAt: body.consentAt,
      status: "Enviada",
      createdAt: new Date().toISOString(),
      responseType: "simulated",
    };

    addRequest(created);
    await delay(1500);
    const simulatedResponse = simulatedMarketplaceReply(category);
    const updated = updateRequest(created.id, {
      status: "Respuesta simulada recibida",
      simulatedResponse,
    });

    return NextResponse.json({ request: updated ?? { ...created, simulatedResponse, status: "Respuesta simulada recibida" } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo crear la solicitud" },
      { status: 500 }
    );
  }
}
