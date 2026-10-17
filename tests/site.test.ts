import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildSite, siteResponse } from "../site/build.ts";

test("公開物は本文とリンクを保ち、正本の公開URLを使う静的ファイルだけになる", async () => {
  const output = mkdtempSync(join(tmpdir(), "minim-site-"));
  try {
    buildSite(output);
    expect(readdirSync(output).sort()).toEqual(["index.html", "og-minim.png", "robots.txt", "sitemap.xml"]);
    const html = readFileSync(join(output, "index.html"), "utf8");
    const template = readFileSync(join(import.meta.dir, "../site/index.html"), "utf8");
    const { homepage } = JSON.parse(readFileSync(join(import.meta.dir, "../plugin.json"), "utf8")) as {
      homepage: string;
    };
    expect(html.match(/<body>[\s\S]*<\/body>/u)?.[0]).toBe(template.match(/<body>[\s\S]*<\/body>/u)?.[0]);
    expect(html).toContain(`<link rel="canonical" href="${homepage}">`);
    expect(html).toContain(`<meta property="og:url" content="${homepage}">`);
    expect(html).toContain(`<meta property="og:image" content="${homepage}og-minim.png">`);
    expect(html).toContain('<meta property="og:image:type" content="image/png">');
    expect(html).toContain('<meta property="og:image:width" content="1200">');
    expect(html).toContain('<meta property="og:image:height" content="630">');
    expect(html).toContain('<meta property="og:image:alt" content="minim — UI with agents.">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<meta name="twitter:title" content="minim">');
    expect(html).toContain('<meta name="twitter:description" content="AIとのやりとりのための、11の短い約束。">');
    expect(html).toContain(`<meta name="twitter:image" content="${homepage}og-minim.png">`);
    expect(html).toContain('<meta name="twitter:image:alt" content="minim — UI with agents.">');
    expect(html).not.toContain("{{SITE_URL}}");
    expect(html).not.toContain("<script");
    expect(readFileSync(join(output, "robots.txt"), "utf8")).toContain(`${homepage}sitemap.xml`);
    expect(readFileSync(join(output, "sitemap.xml"), "utf8")).toContain(`<loc>${homepage}</loc>`);
    for (const path of ["/", "/index.html", "/robots.txt", "/sitemap.xml"]) {
      const response = siteResponse(new Request(`http://localhost${path}`), output);
      expect(response.status).toBe(200);
      expect(await response.text()).not.toBe("");
    }
    const sourceImage = readFileSync(join(import.meta.dir, "../site/public/og-minim.png"));
    const image = readFileSync(join(output, "og-minim.png"));
    expect(image).toEqual(sourceImage);
    expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
    const imageResponse = siteResponse(new Request("http://localhost/og-minim.png"), output);
    expect(imageResponse.status).toBe(200);
    expect(imageResponse.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await imageResponse.arrayBuffer())).toEqual(sourceImage);
    expect(siteResponse(new Request("http://localhost/missing"), output).status).toBe(404);
    expect(siteResponse(new Request("http://localhost/plugin.json"), output).status).toBe(404);
    expect(siteResponse(new Request("http://localhost/og-minim.svg"), output).status).toBe(404);
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
