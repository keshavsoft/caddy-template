import { readFileSync } from "node:fs";
import { getTemplate, listTemplates, TEMPLATES } from "./index.js";

/**
 * Get package version from package.json
 */
export function getVersion() {
  try {
    const pkgUrl = new URL("../../package.json", import.meta.url);
    const pkg = JSON.parse(readFileSync(pkgUrl, "utf8"));
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

/**
 * Print CLI help message
 */
export function printHelp() {
  console.log(`
caddy-template (v${getVersion()})
Battle-tested Caddy JSON route template generator by KeshavSoft.

Usage:
  npx caddy-template [template] [domain] [target] [extra-target]

Templates:
  proxy        Unified HTTP & WebSocket reverse proxy (default)
               Args: [domain] [port/dial]
               Example: npx caddy-template proxy appointment.keshavsoft.com 3000

  ws-split     Dual-target: dedicated WebSocket port + separate HTTP port
               Args: [domain] [http-port] [ws-port] [ws-path]
               Example: npx caddy-template ws-split quotation.keshavsoft.com 9011 8080

  static       Static file server with vars root
               Args: [domain] [document-root]
               Example: npx caddy-template static cli.keshavsoft.com /usr/share/caddy

  multi-host   Multiple domains pointing to one upstream target
               Args: [comma-separated-domains] [port/dial]
               Example: npx caddy-template multi-host keshavsoft.com,www.keshavsoft.com 9328

Commands:
  list         List all available templates with descriptions

Options:
  -h, --help       Show this help message
  -v, --version    Show version number

Examples:
  # Output to console:
  npx caddy-template proxy appointment.keshavsoft.com 3000

  # Save directly to a JSON file:
  npx caddy-template proxy care.keshavsoft.com 3000 > route.json
  npx caddy-template ws-split quote.keshavsoft.com 9011 8080 > quote.json
`);
}

/**
 * Main CLI runner
 * @param {string[]} args
 */
export function run(args = process.argv.slice(2)) {
  if (args.includes("-h") || args.includes("--help") || args.length === 0) {
    printHelp();
    return;
  }
  if (args.includes("-v") || args.includes("--version")) {
    console.log(getVersion());
    return;
  }

  const type = args[0]?.toLowerCase().trim();

  if (type === "list") {
    console.log("\nAvailable Caddy Route Templates:\n");
    console.table(listTemplates());
    return;
  }

  const arg1 = args[1]; // domain / host / hosts
  const arg2 = args[2]; // port / dial / root
  const arg3 = args[3]; // wsDial
  const arg4 = args[4]; // wsPath

  let options = {};

  if (type === "ws-split" || type === "split") {
    options = {
      host: arg1,
      httpDial: arg2,
      wsDial: arg3,
      wsPath: arg4
    };
  } else if (type === "static") {
    options = {
      host: arg1,
      root: arg2
    };
  } else if (type === "multi-host") {
    options = {
      hosts: arg1 ? arg1.split(",").map((s) => s.trim()) : undefined,
      dial: arg2
    };
  } else {
    // proxy / default
    options = {
      host: arg1,
      dial: arg2
    };
  }

  // Remove undefined properties
  Object.keys(options).forEach((k) => options[k] === undefined && delete options[k]);

  try {
    const routeObj = getTemplate(type, options);
    console.log(JSON.stringify(routeObj, null, 2));
  } catch (err) {
    console.error(`\nError: ${err.message}\n`);
    console.error(`Available templates: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }
}

export default run;
