import DrawImage from "../opengraph-image";
import { getDrawBySlug, LOTERIAS_CONFIG } from "@/lib/loterias";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET(_request: Request, context: { params: Promise<{ loteria: string; concurso: string }> }) {
  const params = await context.params;
  if (!LOTERIAS_CONFIG[params.loteria] || !getDrawBySlug(params.loteria, params.concurso)) {
    return new Response("Imagem não encontrada", { status: 404 });
  }
  return DrawImage({ params: Promise.resolve(params) });
}
