import { createProxyTemplate, normalizeDial } from "./templates/proxy.js";
import { createWsSplitTemplate } from "./templates/wsSplit.js";
import { createStaticTemplate } from "./templates/static.js";
import { createMultiHostTemplate } from "./templates/multiHost.js";

export {
  createProxyTemplate,
  createWsSplitTemplate,
  createStaticTemplate,
  createMultiHostTemplate,
  normalizeDial
};

export const TEMPLATES = {
  proxy: {
    name: "proxy",
    description: "Standard unified reverse proxy (HTTP & WebSocket on one port)",
    example: "npx caddy-template proxy appointment.keshavsoft.com 3000",
    generate: (opts) => createProxyTemplate(opts)
  },
  "ws-split": {
    name: "ws-split",
    description: "Dual-target reverse proxy (WebSocket on :8080 and HTTP on :9011)",
    example: "npx caddy-template ws-split quotation.keshavsoft.com 9011 8080",
    generate: (opts) => createWsSplitTemplate(opts)
  },
  static: {
    name: "static",
    description: "Static file server with vars root",
    example: "npx caddy-template static cli.keshavsoft.com /usr/share/caddy",
    generate: (opts) => createStaticTemplate(opts)
  },
  "multi-host": {
    name: "multi-host",
    description: "Multiple domains pointing to a single upstream target",
    example: "npx caddy-template multi-host keshavsoft.com,www.keshavsoft.com 9328",
    generate: (opts) => createMultiHostTemplate(opts)
  }
};

/**
 * Get a generated template JSON object by type name.
 * @param {string} [type="proxy"]
 * @param {object} [options={}]
 * @returns {object}
 */
export function getTemplate(type = "proxy", options = {}) {
  const normType = (type || "proxy").toLowerCase().trim();
  const entry = TEMPLATES[normType] || (normType === "split" ? TEMPLATES["ws-split"] : null);

  if (!entry) {
    throw new Error(
      `Unknown template '${type}'. Available templates: ${Object.keys(TEMPLATES).join(", ")}`
    );
  }

  return entry.generate(options);
}

/**
 * List all available templates with metadata.
 * @returns {Array<{ name: string, description: string, example: string }>}
 */
export function listTemplates() {
  return Object.values(TEMPLATES).map(({ name, description, example }) => ({
    name,
    description,
    example
  }));
}

export default {
  TEMPLATES,
  getTemplate,
  listTemplates,
  createProxyTemplate,
  createWsSplitTemplate,
  createStaticTemplate,
  createMultiHostTemplate,
  normalizeDial
};
