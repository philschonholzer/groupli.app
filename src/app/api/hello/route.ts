import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  let responseText = "Hello World";

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // responseText += suffix

  // this is the KV binding you defined in the wrangler.toml file
  const db = getRequestContext().env.DB;

  const { results } = await db
    .prepare("SELECT * FROM Persons WHERE Name LIKE ?")
    .bind(request.nextUrl.searchParams.get("name") || "%")
    .all();

  return Response.json(results);
}
