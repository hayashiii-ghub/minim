import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig({
  assetsDirectory: "site/dist",
  dev: { ip: "0.0.0.0", port: 8793, inspectorPort: 9293 },
});
