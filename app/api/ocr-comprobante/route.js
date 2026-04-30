import { NextResponse } from "next/server";

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    fecha: { type: "string" },
    tipo: { type: "string", enum: ["Gasto", "Ingreso"] },
    categoria: { type: "string" },
    descripcion: { type: "string" },
    monto: { type: ["number", "null"] },
    confianza: { type: "number" },
    notas: { type: "string" },
  },
  required: ["fecha", "tipo", "categoria", "descripcion", "monto", "confianza", "notas"],
};

function parseDataUrl(input) {
  const match = String(input || "").match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function emptyResponse() {
  return {
    fecha: "",
    tipo: "Gasto",
    categoria: "",
    descripcion: "",
    monto: null,
    confianza: 0,
    notas: "",
  };
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurada." }, { status: 500 });
  }

  try {
    let mimeType = "";
    let imageBase64 = "";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "Falta archivo en campo 'file'." }, { status: 400 });
      }
      mimeType = file.type || "image/jpeg";
      const arrayBuffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const body = await request.json();
      const parsed = parseDataUrl(body?.imageBase64 || body?.image || "");
      if (parsed) {
        mimeType = parsed.mimeType;
        imageBase64 = parsed.data;
      } else if (body?.imageBase64) {
        mimeType = body?.mimeType || "image/jpeg";
        imageBase64 = body.imageBase64;
      }
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "No se recibió una imagen válida." }, { status: 400 });
    }

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "Extraé datos de comprobantes/tickets/facturas de Argentina. No inventes datos. Si no estás seguro, devolvé vacío o null. Respondé SOLO JSON válido con el esquema requerido.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Detectá fecha (YYYY-MM-DD), tipo (Gasto o Ingreso), categoría sugerida, descripción corta y monto total. Si no se puede leer algo, dejar vacío/null.",
              },
              {
                type: "input_image",
                image_url: `data:${mimeType};base64,${imageBase64}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "ocr_comprobante",
            schema: RESPONSE_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      return NextResponse.json({ error: "Error al analizar imagen.", detail }, { status: 502 });
    }

    const result = await aiResponse.json();
    const raw = result?.output_text;
    if (!raw) {
      return NextResponse.json(emptyResponse());
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "No se pudo procesar el comprobante.", detail: error?.message }, { status: 500 });
  }
}
