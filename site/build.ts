import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--serve")) {
  throw new Error("使い方: bun site/build.ts [--serve]");
}

const output = join(import.meta.dir, "out");
const index = join(output, "index.html");
mkdirSync(output, { recursive: true });
copyFileSync(join(import.meta.dir, "index.html"), index);
console.log("Static site ready: out/index.html");

if (args[0] === "--serve") {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: Number(process.env.PORT ?? 4173),
    fetch(request) {
      const { pathname } = new URL(request.url);
      return pathname === "/" || pathname === "/index.html"
        ? new Response(Bun.file(index))
        : new Response("Not Found", { status: 404 });
    },
  });
  console.log(`Preview: ${server.url}`);
}
