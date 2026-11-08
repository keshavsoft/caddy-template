# caddy-template

[![npm version](https://img.shields.io/npm/v/caddy-template.svg?color=amber&style=flat-square)](https://www.npmjs.com/package/caddy-template)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-emerald.svg?style=flat-square)](https://keshavsoft.github.io/caddy-template/)
[![GitHub](https://img.shields.io/badge/github-keshavsoft%2Fcaddy--template-zinc.svg?style=flat-square&logo=github)](https://github.com/keshavsoft/caddy-template)
[![Caddy Docs](https://img.shields.io/badge/official-caddyserver.com-00ADD8.svg?style=flat-square)](https://caddyserver.com/docs/)

> **Pre-configured, battle-tested Caddy JSON route templates for reverse proxies, WebSockets, and static servers.**  
> Never write deeply nested Caddy JSON routes from scratch again.

---

## 🌐 Live Interactive Playground & Generator

Customize, generate, and copy Caddy route templates directly in your browser:  
👉 **[https://keshavsoft.github.io/caddy-template/](https://keshavsoft.github.io/caddy-template/)**

---

## 💡 Why `caddy-template`?

In Caddy, writing native JSON configurations requires nesting multiple levels of handlers:
```text
match ➔ host ➔ handle ➔ subroute ➔ routes ➔ handle ➔ reverse_proxy ➔ upstreams ➔ dial
```

Instead of guessing Caddy's internal JSON schema or copying from old config files, **`caddy-template`** outputs ready-to-use, production-verified JSON route blocks for every common web architecture:

| Template | Best For | Typical Architecture |
| :--- | :--- | :--- |
| **`proxy`** | Unified Node.js / Python / Go Apps | Single port handling both HTTP and WebSockets (e.g. CareCall `appointment-notifier`) |
| **`ws-split`** | Split Daemon Setups | Separate WebSocket server on port A (`/ws*`) + HTTP web server on port B (`*`) |
| **`static`** | SPAs / Documentation Sites | Static `file_server` with `vars` document root |
| **`multi-host`** | Multi-Domain Bindings | Apex domain and `www` subdomain forwarding to the same backend target |

---

## 🚀 Quick Run with `npx`

Zero installation required:

```bash
# Generate standard reverse proxy route:
npx caddy-template proxy appointment.keshavsoft.com 3000

# Save directly to a JSON file:
npx caddy-template proxy appointment.keshavsoft.com 3000 > appointment-route.json

# Split WebSocket setup:
npx caddy-template ws-split quotation.keshavsoft.com 9011 8080 > quotation-route.json

# Static documentation site:
npx caddy-template static cli.keshavsoft.com /usr/share/caddy/cli > static-route.json
```

---

## 📖 Template Catalog

### 1. `proxy` (Unified Reverse Proxy)
```bash
npx caddy-template proxy appointment.keshavsoft.com 3000
```
```json
{
  "match": [
    {
      "host": [
        "appointment.keshavsoft.com"
      ]
    }
  ],
  "handle": [
    {
      "handler": "subroute",
      "routes": [
        {
          "handle": [
            {
              "handler": "reverse_proxy",
              "upstreams": [
                {
                  "dial": "localhost:3000"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "terminal": true
}
```

### 2. `ws-split` (Dual-Target WebSocket + HTTP)
```bash
npx caddy-template ws-split quotation.keshavsoft.com 9011 8080
```
```json
{
  "match": [
    {
      "host": [
        "quotation.keshavsoft.com"
      ]
    }
  ],
  "handle": [
    {
      "handler": "subroute",
      "routes": [
        {
          "match": [
            {
              "path": [
                "/ws*"
              ]
            }
          ],
          "handle": [
            {
              "handler": "reverse_proxy",
              "upstreams": [
                {
                  "dial": "localhost:8080"
                }
              ]
            }
          ]
        },
        {
          "handle": [
            {
              "handler": "reverse_proxy",
              "upstreams": [
                {
                  "dial": "localhost:9011"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "terminal": true
}
```

### 3. `static` (Static File Server)
```bash
npx caddy-template static cli.keshavsoft.com /usr/share/caddy
```
```json
{
  "match": [
    {
      "host": [
        "cli.keshavsoft.com"
      ]
    }
  ],
  "handle": [
    {
      "handler": "subroute",
      "routes": [
        {
          "handle": [
            {
              "handler": "vars",
              "root": "/usr/share/caddy"
            },
            {
              "handler": "file_server",
              "hide": [
                "/etc/caddy/Caddyfile"
              ]
            }
          ]
        }
      ]
    }
  ],
  "terminal": true
}
```

---

## 📦 Programmatic Usage (ESM)

Import templates into your Node.js automation scripts or deployment pipelines:

```javascript
import {
  createProxyTemplate,
  createWsSplitTemplate,
  createStaticTemplate,
  getTemplate,
  listTemplates
} from "caddy-template";

// Generate proxy route object:
const route = createProxyTemplate({
  host: "appointment.keshavsoft.com",
  dial: 3000
});

// Or use the dynamic resolver:
const wsRoute = getTemplate("ws-split", {
  host: "quotation.keshavsoft.com",
  httpDial: 9011,
  wsDial: 8080
});

console.log(JSON.stringify(route, null, 2));
```

---

## 🔗 The KeshavSoft Caddy Suite

- **[caddy-cli](https://github.com/keshavsoft/caddy-cli)**: Observability, port lookup (`-p`), and domain drill-down (`-d`).
- **[caddy-template](https://github.com/keshavsoft/caddy-template)**: Battle-tested route JSON generator.
- **[Official Caddy Documentation](https://caddyserver.com/docs/)**: Upstream Caddy references.

---

## 📄 License

[ISC](LICENSE) &copy; [KeshavSoft](https://github.com/keshavsoft)
