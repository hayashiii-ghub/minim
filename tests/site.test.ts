import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite, siteResponse } from "../site/build.ts";

test("公開物は本文とリンクを保ち、正本の公開URLを使う静的ファイルだけになる", async () => {
  const output = mkdtempSync(join(tmpdir(), "minim-site-"));
  try {
    buildSite(output);
    expect(readdirSync(output).sort()).toEqual(["index.html", "robots.txt", "sitemap.xml"]);
    const html = readFileSync(join(output, "index.html"), "utf8");
    const template = readFileSync(join(import.meta.dir, "../site/index.html"), "utf8");
    const { homepage } = JSON.parse(readFileSync(join(import.meta.dir, "../plugin.json"), "utf8")) as {
      homepage: string;
    };
    expect(html.match(/<body>[\s\S]*<\/body>/u)?.[0]).toBe(template.match(/<body>[\s\S]*<\/body>/u)?.[0]);
    expect(html).toContain(`<link rel="canonical" href="${homepage}">`);
    expect(html).toContain(`<meta property="og:url" content="${homepage}">`);
    expect(html).not.toContain("{{SITE_URL}}");
    expect(html).not.toContain("<script");
    expect(readFileSync(join(output, "robots.txt"), "utf8")).toContain(`${homepage}sitemap.xml`);
    expect(readFileSync(join(output, "sitemap.xml"), "utf8")).toContain(`<loc>${homepage}</loc>`);
    for (const path of ["/", "/index.html", "/robots.txt", "/sitemap.xml"]) {
      const response = siteResponse(new Request(`http://localhost${path}`), output);
      expect(response.status).toBe(200);
      expect(await response.text()).not.toBe("");
    }
    expect(siteResponse(new Request("http://localhost/missing"), output).status).toBe(404);
    expect(siteResponse(new Request("http://localhost/plugin.json"), output).status).toBe(404);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
