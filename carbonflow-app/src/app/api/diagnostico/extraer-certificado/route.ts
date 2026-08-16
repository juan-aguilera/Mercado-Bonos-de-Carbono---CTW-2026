import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { extraerCertificadoTradicion } from "@/lib/integrations/certificadoTradicion";

// Turbopack/webpack no preservan la ruta relativa que pdfjs-dist usa para
// resolver su worker en Node, asi que se fija explicitamente al archivo real
// dentro de node_modules.
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;

async function extraerTexto(data: Uint8Array): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }
  await loadingTask.destroy();
  return text;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo PDF" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 });
  }

  let text: string;
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    text = await extraerTexto(data);
  } catch {
    return NextResponse.json({ error: "No se pudo leer el PDF" }, { status: 422 });
  }

  return NextResponse.json(extraerCertificadoTradicion(text));
}
