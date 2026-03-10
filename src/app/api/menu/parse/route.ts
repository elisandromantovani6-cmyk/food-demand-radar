import { NextRequest, NextResponse } from "next/server";

interface ParsedItem {
  name: string;
  description: string;
  category: string;
  price: number;
}

/** Extrai preço de uma string — suporta R$39,90 / 39.90 / 39,90 */
function extractPrice(text: string): number | null {
  // R$ 39,90 ou R$39.90
  const match = text.match(/R?\$?\s*(\d{1,4})[.,](\d{2})/);
  if (match) return parseFloat(`${match[1]}.${match[2]}`);

  // Número solto como 39.90 ou 39,90
  const numMatch = text.match(/(\d{1,4})[.,](\d{2})/);
  if (numMatch) return parseFloat(`${numMatch[1]}.${numMatch[2]}`);

  // Número inteiro como preço (ex: "35")
  const intMatch = text.match(/(\d{2,3})/);
  if (intMatch) return parseInt(intMatch[1]);

  return null;
}

/** Detecta categoria baseada em keywords */
function detectCategory(name: string, context: string): string {
  const lower = (name + " " + context).toLowerCase();

  if (/pizza|margherita|calabresa|pepperoni|mussarela|queijo|portuguesa|frango.*catupiry|napolitana|quatro|toscana|baiana|lombo|bacon/.test(lower)) return "pizzas";
  if (/refri|coca|guaraná|suco|cerveja|água|fanta|sprite|drink|bebida|refrigerante|limonada|caipirinha|chopp/.test(lower)) return "bebidas";
  if (/sobremesa|petit|brownie|pudim|torta|sorvete|chocolate|brigadeiro|açaí|mousse|cheesecake/.test(lower)) return "sobremesas";
  if (/entrada|bruschetta|salada|caldo|sopa|bolinho|coxinha|pastel|pão.*alho/.test(lower)) return "entradas";
  if (/borda|extra|adicional|catupiry|cheddar/.test(lower)) return "extras";

  return "pizzas"; // default para pizzaria
}

/** Parse texto livre — tenta extrair nome e preço de cada linha */
function parseTextContent(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let currentCategory = "";

  for (const line of lines) {
    // Detecta headers de seção (ex: "PIZZAS", "== Bebidas ==", "--- Sobremesas ---")
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

    // Ignora linhas que parecem headers/separadores
    if (/^[-=*_]{3,}$/.test(line)) continue;
    if (/^(cardápio|menu|tabela|preços|valores)/i.test(line)) continue;
    if (line.length < 3) continue;

    // Tenta extrair preço da linha
    const price = extractPrice(line);
    if (price === null || price < 1 || price > 999) continue;

    // Remove o preço da linha para pegar o nome
    let name = line
      .replace(/R?\$?\s*\d{1,4}[.,]\d{2}/, "")
      .replace(/\.\.\.*\s*$/, "")  // remove "........"
      .replace(/[-–—]+\s*$/, "")   // remove traços finais
      .replace(/\s{2,}/g, " ")     // normaliza espaços
      .trim();

    // Remove pontuação final
    name = name.replace(/[.,;:\-–—]+$/, "").trim();

    if (name.length < 2) continue;

    // Tenta separar nome e descrição (ex: "Margherita - molho, mussarela, manjericão")
    let description = "";
    const descSplit = name.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
    if (descSplit && descSplit[1].length > 2) {
      name = descSplit[1].trim();
      description = descSplit[2].trim();
    }

    const category = currentCategory || detectCategory(name, description);

    items.push({ name, description, category, price });
  }

  return items;
}

/** Parse CSV — espera colunas: nome, descrição, categoria, preço */
function parseCsvContent(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Detecta separador (vírgula, ponto e vírgula, tab)
  const firstLine = lines[0] || "";
  const sep = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";

  // Pula header se parece ter um
  const start = /^(nome|item|produto|name)/i.test(firstLine) ? 1 : 0;

  for (let i = start; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ""));
    if (cols.length < 2) continue;

    const name = cols[0];
    const price = extractPrice(cols[cols.length - 1] || cols[1]);
    if (!name || !price || price < 1) continue;

    const description = cols.length >= 3 ? cols[1] : "";
    const categoryRaw = cols.length >= 4 ? cols[2] : "";
    const category = categoryRaw ? categoryRaw.toLowerCase() : detectCategory(name, description);

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

    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    let textContent = "";
    let items: ParsedItem[] = [];

    // PDF
    if (fileName.endsWith(".pdf")) {
      try {
        const buffer = await file.arrayBuffer();
        const { PDFParse } = await import("pdf-parse");
        const pdf = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await pdf.getText();
        textContent = result.text;
        await pdf.destroy();
      } catch (e) {
        console.error("PDF parse error:", e);
        return NextResponse.json({
          error: "Não foi possível ler o PDF. Tente enviar como .txt ou .csv",
        }, { status: 400 });
      }
    }
    // Text / CSV
    else if (fileName.endsWith(".txt") || fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
      textContent = await file.text();
    }
    // Outros
    else {
      return NextResponse.json({
        error: "Formato não suportado. Envie PDF, TXT ou CSV.",
      }, { status: 400 });
    }

    if (!textContent.trim()) {
      return NextResponse.json({ error: "Arquivo vazio ou sem texto extraível" }, { status: 400 });
    }

    // Decide parser
    if (fileName.endsWith(".csv") || fileName.endsWith(".tsv")) {
      items = parseCsvContent(textContent);
    } else {
      items = parseTextContent(textContent);
    }

    // Deduplica por nome (case insensitive)
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
      rawText: textContent.slice(0, 2000),
      itemsFound: items.length,
      items,
    });
  } catch (error) {
    console.error("Menu parse error:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
}
