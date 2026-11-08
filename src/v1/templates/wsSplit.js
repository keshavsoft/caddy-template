import { normalizeDial } from "./proxy.js";

/**
 * Split Reverse Proxy Template: Dedicated WebSocket port + Separate HTTP Web port
 * Example use case: quotation.keshavsoft.com (/ws* -> :8080, * -> :9011)
 * @param {object} options
 * @param {string} [options.host] - Domain name
 * @param {string|number} [options.httpDial] - HTTP upstream target (e.g. 9011)
 * @param {string|number} [options.wsDial] - WebSocket upstream target (e.g. 8080)
 * @param {string} [options.wsPath] - WebSocket path matcher (e.g. "/ws*")
 * @returns {object} Caddy route object
 */
export function createWsSplitTemplate({
  host = "quotation.keshavsoft.com",
  httpDial = "localhost:9011",
  wsDial = "localhost:8080",
  wsPath = "/ws*"
} = {}) {
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
            match: [
              {
                path: [wsPath]
              }
            ],
            handle: [
              {
                handler: "reverse_proxy",
                upstreams: [
                  {
                    dial: normalizeDial(wsDial)
                  }
                ]
              }
            ]
          },
          {
            handle: [
              {
                handler: "reverse_proxy",
                upstreams: [
                  {
                    dial: normalizeDial(httpDial)
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

export default createWsSplitTemplate;
