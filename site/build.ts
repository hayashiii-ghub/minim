import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const outputDirectory = join(import.meta.dir, "dist");

export function buildSite(output = outputDirectory): void {
  const { homepage } = JSON.parse(readFileSync(join(import.meta.dir, "../plugin.json"), "utf8")) as {
    homepage: string;
  };
  const siteUrl = new URL(homepage);
  if (siteUrl.protocol !== "https:" || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
    throw new Error("plugin.jsonのhomepageにはHTTPSのサイトURLを指定してください");
  }
  const template = readFileSync(join(import.meta.dir, "index.html"), "utf8");
  const html = template.replaceAll("{{SITE_URL}}", siteUrl.href);
  mkdirSync(output, { recursive: true });
  for (const file of ["og-minim.png", "favicon.svg", "favicon.png", "favicon.ico"]) {
    copyFileSync(join(import.meta.dir, "public", file), join(output, file));
  }
  writeFileSync(join(output, "index.html"), html);
  writeFileSync(join(output, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);
  writeFileSync(join(output, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
}

export function siteResponse(request: Request, output = outputDirectory): Response {
  const { pathname } = new URL(request.url);
  const path = pathname === "/" || pathname === "/index.html" ? "index.html"
    : pathname === "/robots.txt" ? "robots.txt"
    : pathname === "/og-minim.png" ? "og-minim.png"
    : pathname === "/favicon.svg" ? "favicon.svg"
    : pathname === "/favicon.png" ? "favicon.png"
    : pathname === "/favicon.ico" ? "favicon.ico"
    : pathname === "/sitemap.xml" ? "sitemap.xml" : null;
  return path ? new Response(Bun.file(join(output, path))) : new Response("Not Found", { status: 404 });
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--serve")) {
    throw new Error("使い方: bun site/build.ts [--serve]");
  }
  buildSite();
  console.log("Static site ready: site/dist/index.html");

  if (args[0] === "--serve") {
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: Number(process.env.PORT ?? 4173),
      fetch(request) { return siteResponse(request); },
    });
    console.log(`Preview: ${server.url}`);
  }
}
