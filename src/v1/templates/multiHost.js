import { normalizeDial } from "./proxy.js";

/**
 * Multi-Host Reverse Proxy Template (multiple domains pointing to one target)
 * Example use case: keshavsoft.com and www.keshavsoft.com -> :9328
 * @param {object} options
 * @param {string[]} [options.hosts] - Array of hostnames
 * @param {string|number} [options.dial] - Upstream target
 * @returns {object} Caddy route object
 */
export function createMultiHostTemplate({
  hosts = ["keshavsoft.com", "www.keshavsoft.com"],
  dial = "localhost:9328"
} = {}) {
  const normalizedHosts = (Array.isArray(hosts) ? hosts : [hosts]).map((h) =>
    h.trim().toLowerCase()
  );

  return {
    match: [
      {
        host: normalizedHosts
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
                    dial: normalizeDial(dial)
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

export default createMultiHostTemplate;
