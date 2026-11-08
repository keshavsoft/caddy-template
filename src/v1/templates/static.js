/**
 * Static File Server Template
 * Example use case: cli.keshavsoft.com, static documentation, frontend SPA
 * @param {object} options
 * @param {string} [options.host] - Domain name
 * @param {string} [options.root] - Document root path on the server
 * @returns {object} Caddy route object
 */
export function createStaticTemplate({
  host = "static.keshavsoft.com",
  root = "/usr/share/caddy/static.keshavsoft.com"
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
            handle: [
              {
                handler: "vars",
                root: root.trim()
              },
              {
                handler: "file_server",
                hide: ["/etc/caddy/Caddyfile"]
              }
            ]
          }
        ]
      }
    ],
    terminal: true
  };
}

export default createStaticTemplate;
