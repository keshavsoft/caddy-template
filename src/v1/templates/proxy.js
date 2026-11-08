/**
 * Normalize dial string (e.g. 3000 -> "localhost:3000", ":3000" -> "localhost:3000")
 * @param {string|number} dial
 * @returns {string}
 */
export function normalizeDial(dial) {
  if (!dial) return "localhost:3000";
  const str = String(dial).trim();
  if (/^\d+$/.test(str)) return `localhost:${str}`;
  if (str.startsWith(":")) return `localhost${str}`;
  return str;
}

/**
 * Standard Unified Reverse Proxy Template (handles both HTTP and WebSockets on one port)
 * Example use case: CareCall appointment-notifier, Node.js / Express / Fastify apps
 * @param {object} options
 * @param {string} [options.host] - Domain name (e.g. "appointment.keshavsoft.com")
 * @param {string|number} [options.dial] - Upstream target (e.g. 3000 or "localhost:3000")
 * @returns {object} Caddy route object
 */
export function createProxyTemplate({ host = "app.keshavsoft.com", dial = "localhost:3000" } = {}) {
  const dialTarget = normalizeDial(dial);

  return {
    match: [
      {
        host: [host.trim().toLowerCase()]
      }
    ],
    handle: [
      {
        handler: "subroute",
        routes: [
          {
            handle: [
              {
                handler: "reverse_proxy",
                upstreams: [
                  {
                    dial: dialTarget
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    terminal: true
  };
}

export default createProxyTemplate;
