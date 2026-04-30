import { NextResponse } from "next/server";

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    fecha: { type: "string" },
    tipo: { type: "string", enum: ["Gasto", "Ingreso"] },
    categoria: { type: "string" },
    descripcion: { type: "string" },
    monto: { type: ["number", "null", "string"] },
    confianza: { type: "number" },
    notas: { type: "string" },
  },
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

function normalizarRespuestaOCR(payload) {
  const base = emptyResponse();
  const data = payload && typeof payload === "object" ? payload : {};

  const montoCrudo = data.monto;
  let monto = null;
  if (typeof montoCrudo === "number" && Number.isFinite(montoCrudo)) {
    monto = montoCrudo;
  } else if (typeof montoCrudo === "string") {
    const limpio = montoCrudo
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".")
      .replace(/[^0-9.-]/g, "");
    const numero = Number(limpio);
    monto = Number.isFinite(numero) ? numero : null;
  }

  return {
    fecha: typeof data.fecha === "string" ? data.fecha.trim() : base.fecha,
    tipo: data.tipo === "Ingreso" ? "Ingreso" : "Gasto",
    categoria: typeof data.categoria === "string" ? data.categoria.trim() : base.categoria,
    descripcion: typeof data.descripcion === "string" ? data.descripcion.trim() : base.descripcion,
    monto,
    confianza:
      typeof data.confianza === "number" && Number.isFinite(data.confianza)
        ? Math.max(0, Math.min(1, data.confianza))
        : base.confianza,
    notas: typeof data.notas === "string" ? data.notas.trim() : base.notas,
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
                text: "Sos un extractor OCR financiero robusto para tickets/facturas argentinos con ruido, inclinación, sombras, arrugas y texto incompleto. Priorizá detectar: 1) monto total (buscar TOTAL, IMPORTE, TOTAL FINAL o el valor monetario más grande visible), 2) nombre del comercio, 3) fecha. Si algún dato no es totalmente seguro, devolvé igualmente la mejor estimación posible en lugar de dejar todo vacío. Solo cuando no exista evidencia visual mínima, usar vacío/null.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Analizá este ticket o comprobante. Extraé la siguiente información aunque sea parcialmente:\n\n- fecha (si no está clara, dejar vacía)\n- tipo (Gasto por defecto)\n- categoria (inferir: supermercado, combustible, etc)\n- descripcion (nombre del comercio)\n- monto (buscar TOTAL o valor más grande visible)\n\nSi la confianza es baja, devolver igual los datos encontrados y marcar confianza < 0.5. Respondé únicamente JSON.",
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
            strict: false,
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      const detail = await aiResponse.text();
      return NextResponse.json({ error: "Error al analizar imagen.", detail }, { status: 502 });
    }

    const result = await aiResponse.json();
    console.log("[ocr-comprobante] OpenAI raw response:", result);

    const raw = result?.output_text;
    if (!raw) {
      return NextResponse.json(emptyResponse());
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_error) {
      parsed = {};
    }

    return NextResponse.json(normalizarRespuestaOCR(parsed));
  } catch (error) {
    return NextResponse.json({ error: "No se pudo procesar el comprobante.", detail: error?.message }, { status: 500 });
  }
}
