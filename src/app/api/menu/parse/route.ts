import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface ParsedItem {
  name: string;
  description: string;
  category: string;
  price: number;
}

const MENU_PARSE_PROMPT = `Você é um especialista em extrair itens de cardápio de restaurantes.

Analise o conteúdo fornecido (texto ou imagem de um cardápio) e extraia TODOS os itens encontrados.

Para cada item, retorne:
- name: nome do item (ex: "Pizza Margherita", "Refrigerante 2L")
- description: ingredientes ou descrição curta (se disponível, senão "")
- category: uma das categorias: "pizzas", "bebidas", "sobremesas", "entradas", "extras"
- price: preço em reais como número (ex: 39.90). Se houver múltiplos tamanhos, use o preço médio ou mais comum.

Regras:
- Ignore headers, títulos, e informações do restaurante
- Ignore bordas recheadas e adicionais como itens separados (coloque em "extras" se tiver preço)
- Se um item não tiver preço visível, ignore-o
- Preços em formato brasileiro: R$ 39,90 = 39.90
- Retorne APENAS um JSON array válido, sem markdown, sem explicação

Exemplo de output:
[{"name":"Pizza Margherita","description":"Molho, mussarela, manjericão","category":"pizzas","price":39.90}]`;

/** Tenta extrair texto do PDF usando pdfjs-dist */
async function extractPdfText(data: Uint8Array): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();

      const lineMap = new Map<number, { x: number; str: string }[]>();
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const typed = item as { str: string; transform: number[] };
        const y = Math.round(typed.transform[5]);
        const x = typed.transform[4];
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push({ x, str: typed.str });
      }

      const sortedLines = [...lineMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, items]) =>
          items.sort((a, b) => a.x - b.x).map(i => i.str).join(" ")
        );

      pages.push(sortedLines.join("\n"));
    }

    await doc.destroy();
    return pages.join("\n");
  } catch (e) {
    console.error("[PDF Text Extract] Failed:", e);
    return "";
  }
}

/** Converte PDF para imagens PNG usando pdfjs-dist canvas rendering */
async function pdfToImages(data: Uint8Array): Promise<string[]> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
    const images: string[] = [];

    // Limit to first 3 pages
    const maxPages = Math.min(doc.numPages, 3);

    for (let i = 1; i <= maxPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      // Use node-canvas-like approach — create a simple pixel buffer
      // pdfjs-dist legacy can render to a canvas-like object
      const { createCanvas } = await import("canvas");
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise;

      const pngBuffer = canvas.toBuffer("image/png");
      images.push(pngBuffer.toString("base64"));
    }

    await doc.destroy();
    return images;
  } catch (e) {
    console.error("[PDF to Image] Failed:", e);
    return [];
  }
}

/** Parse com IA usando texto extraído */
async function parseWithAI(
  client: Anthropic,
  content: { type: "text"; text: string } | { type: "image"; base64: string; mediaType: string },
): Promise<ParsedItem[]> {
  const messages: Anthropic.MessageParam[] = [{
    role: "user",
    content: content.type === "text"
      ? [{ type: "text", text: `${MENU_PARSE_PROMPT}\n\nConteúdo do cardápio:\n${content.text}` }]
      : [
          { type: "image", source: { type: "base64", media_type: content.mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: content.base64 } },
          { type: "text", text: MENU_PARSE_PROMPT },
        ],
  }];

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages,
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[AI Parse] No JSON array found in response:", text.slice(0, 200));
    return [];
  }

  try {
    const items = JSON.parse(jsonMatch[0]) as ParsedItem[];
    return items.filter(i => i.name && i.price > 0);
  } catch (e) {
    console.error("[AI Parse] JSON parse error:", e);
    return [];
  }
}

/** Fallback: parse texto localmente sem IA */
function parseTextLocally(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let currentCategory = "";

  for (const line of lines) {
    const sectionMatch = line.match(/^[=\-*#\s]*(pizzas?|bebidas?|sobremesas?|entradas?|extras?|acompanhamentos?|combos?|promoç[oõ]es?|especiais?|tradicionais?|premium|gourmet|salgad[ao]s?|doces?)[=\-*#\s]*$/i);
    if (sectionMatch) {
      const sec = sectionMatch[1].toLowerCase();
      if (/pizza|tradiciona|premium|gourmet|salgad|especiai/.test(sec)) currentCategory = "pizzas";
      else if (/bebida|drink/.test(sec)) currentCategory = "bebidas";
      else if (/sobremesa|doce/.test(sec)) currentCategory = "sobremesas";
      else if (/entrada|acompanhamento/.test(sec)) currentCategory = "entradas";
      else if (/extra/.test(sec)) currentCategory = "extras";
      continue;
    }

    if (/^[-=*_]{3,}$/.test(line)) continue;
    if (/^(cardápio|menu|tabela|preços|valores)/i.test(line)) continue;
    if (line.length < 3) continue;

    const priceMatch = line.match(/R?\$?\s*(\d{1,4})[.,](\d{2})/);
    if (!priceMatch) continue;
    const price = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
    if (price < 1 || price > 999) continue;

    let name = line
      .replace(/R?\$?\s*\d{1,4}[.,]\d{2}/, "")
      .replace(/\.\.\.*\s*$/, "")
      .replace(/[-–—]+\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .replace(/[.,;:\-–—]+$/, "")
      .trim();

    if (name.length < 2) continue;

    let description = "";
    const descSplit = name.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
    if (descSplit && descSplit[1].length > 2) {
      name = descSplit[1].trim();
      description = descSplit[2].trim();
    }

    const lower = (name + " " + description).toLowerCase();
    let category = currentCategory;
    if (!category) {
      if (/pizza|margherita|calabresa|pepperoni|mussarela|queijo|portuguesa|frango.*catupiry/.test(lower)) category = "pizzas";
      else if (/refri|coca|guaraná|suco|cerveja|água|fanta|sprite|drink|bebida/.test(lower)) category = "bebidas";
      else if (/sobremesa|petit|brownie|pudim|torta|sorvete|chocolate|brigadeiro/.test(lower)) category = "sobremesas";
      else if (/entrada|bruschetta|salada|caldo|sopa|bolinho|coxinha|pastel/.test(lower)) category = "entradas";
      else if (/borda|extra|adicional/.test(lower)) category = "extras";
      else category = "pizzas";
    }

    items.push({ name, description, category, price });
  }

  return items;
}

/** Parse CSV */
function parseCsvContent(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";
  const start = /^(nome|item|produto|name)/i.test(firstLine) ? 1 : 0;

  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 2) continue;

    const name = cols[0];
    const priceStr = cols[cols.length - 1] || cols[1];
    const priceMatch = priceStr.match(/(\d{1,4})[.,](\d{2})/);
    if (!name || !priceMatch) continue;
    const price = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
    if (price < 1) continue;

    const description = cols.length >= 3 ? cols[1] : "";
    const categoryRaw = cols.length >= 4 ? cols[2] : "";
    const category = categoryRaw ? categoryRaw.toLowerCase() : "pizzas";

    items.push({ name, description, category, price });
  }

  return items;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const fileSize = file.size;

    console.log(`[Menu Parse] File: "${file.name}", size: ${fileSize}, type: "${file.type}"`);

    if (fileSize === 0) {
      return NextResponse.json({ error: "Arquivo está vazio (0 bytes)." }, { status: 400 });
    }

    const maxSize = /\.pdf$/.test(fileName) ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json({
        error: `Arquivo muito grande (máx ${/\.pdf$/.test(fileName) ? "20MB" : "5MB"})`,
      }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const useAI = !!apiKey;
    let items: ParsedItem[] = [];
    let rawText = "";

    // Handle image files directly with AI vision
    if (/\.(jpg|jpeg|png|webp)$/.test(fileName)) {
      if (!useAI) {
        return NextResponse.json({
          error: "Para processar imagens, configure ANTHROPIC_API_KEY no .env.local",
        }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mediaType = file.type || "image/jpeg";

      console.log("[Menu Parse] Processing image with AI vision...");
      const client = new Anthropic({ apiKey });
      items = await parseWithAI(client, { type: "image", base64, mediaType });
      rawText = `[Imagem analisada por IA: ${items.length} itens encontrados]`;
    }
    // Handle PDF
    else if (fileName.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);

      // Step 1: Try text extraction
      rawText = await extractPdfText(data);
      console.log(`[PDF Parse] Extracted text length: ${rawText.length}`);

      if (useAI) {
        // If we have text, send it to AI for smart parsing
        if (rawText.trim().length > 20) {
          console.log("[PDF Parse] Using AI to parse extracted text...");
          const client = new Anthropic({ apiKey });
          items = await parseWithAI(client, { type: "text", text: rawText });
        }

        // If no text or AI found nothing, try image-based approach
        if (items.length === 0) {
          console.log("[PDF Parse] Trying image-based AI parsing...");
          const client = new Anthropic({ apiKey });

          // Convert PDF buffer to base64 and send as document
          const base64 = Buffer.from(buffer).toString("base64");
          // Claude supports PDF directly via base64
          const messages: Anthropic.MessageParam[] = [{
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 },
              },
              { type: "text", text: MENU_PARSE_PROMPT },
            ],
          }];

          try {
            const response = await client.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              messages,
            });

            const responseText = response.content
              .filter((b): b is Anthropic.TextBlock => b.type === "text")
              .map(b => b.text)
              .join("");

            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              items = JSON.parse(jsonMatch[0]) as ParsedItem[];
              items = items.filter(i => i.name && i.price > 0);
            }

            if (!rawText.trim()) {
              rawText = `[PDF analisado por IA: ${items.length} itens encontrados]`;
            }
          } catch (e) {
            console.error("[PDF AI Vision] Error:", e);
          }
        }
      }

      // Fallback: local parsing without AI
      if (items.length === 0 && rawText.trim()) {
        console.log("[PDF Parse] Falling back to local text parsing...");
        items = parseTextLocally(rawText);
      }

      if (!rawText.trim() && items.length === 0) {
        return NextResponse.json({
          error: useAI
            ? "Não foi possível extrair itens deste PDF. Tente outro arquivo ou envie uma foto do cardápio."
            : "PDF sem texto extraível. Configure ANTHROPIC_API_KEY para processar PDFs com imagem, ou envie como .txt/.csv",
        }, { status: 400 });
      }
    }
    // Text / CSV
    else if (/\.(txt|csv|tsv)$/.test(fileName)) {
      rawText = await file.text();

      if (!rawText.trim()) {
        return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
      }

      if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
        items = parseCsvContent(rawText);
      } else if (useAI) {
        const client = new Anthropic({ apiKey });
        items = await parseWithAI(client, { type: "text", text: rawText });
      }

      // Fallback to local parsing
      if (items.length === 0) {
        items = parseTextLocally(rawText);
      }
    }
    // Unsupported
    else {
      return NextResponse.json({
        error: "Formato não suportado. Envie PDF, TXT, CSV ou imagem (JPG/PNG).",
      }, { status: 400 });
    }

    // Deduplicate by name (case insensitive)
    const seen = new Set<string>();
    items = items.filter(item => {
      const key = item.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      rawText: rawText.slice(0, 2000),
      itemsFound: items.length,
      items,
      aiPowered: useAI,
    });
  } catch (error) {
    console.error("Menu parse error:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
}
