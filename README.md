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

Looking for plain-English explanations, traffic diagrams, and the 5-minute hosting checklist?  
📖 Read the **[Caddy Template Knowledge Base Handbook](https://keshavsoft.github.io/caddy-template-knowledge/)**

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

## ⚡ The Story: Why We Transitioned to Native JSON

According to the [official Caddy architecture documentation](https://caddyserver.com/docs/getting-started#the-caddyfile-is-an-adapter), **the Caddyfile is only an adapter**.

| Paradigm | [Caddyfile Adapter](https://caddyserver.com/docs/caddyfile) | [Native Caddy JSON](https://caddyserver.com/docs/json/) |
| :--- | :--- | :--- |
| **Primary Use** | Manual text editing | True source of truth |
| **API Support** | Static, requires file reload | Full zero-downtime [Caddy Admin API](https://caddyserver.com/docs/api) (`:2019`) |
| **Fleet Automation** | Fragile regex string parsing (`sed`) | Safe, programmatic JSON AST manipulation |
| **Active WebSockets** | Risk of dropped sockets via systemctl | Preserved in-memory across hot reloads |

**Why `caddy-template` exists:** Native JSON is ideal for machines, but hand-crafting 25-line nested JSON ASTs (`match ➔ handle ➔ subroute ➔ routes ➔ handle ➔ reverse_proxy ➔ upstreams ➔ dial`) invites syntax and bracket errors. `caddy-template` outputs pre-validated, schema-compliant blueprints every time.

---

## 🧩 The KeshavSoft Caddy Suite Ecosystem

| Repository | Responsibility | npm / Docs | Key Command |
| :--- | :--- | :--- | :--- |
| **[`caddy-cli`](https://github.com/keshavsoft/caddy-cli)** | Observability & Port Mapping | [![npm](https://img.shields.io/npm/v/caddy-cli.svg?style=flat-square)](https://www.npmjs.com/package/caddy-cli) | `npx caddy-cli -p` |
| **[`caddy-template`](https://github.com/keshavsoft/caddy-template)** | Route Blueprint Generation | [![npm](https://img.shields.io/npm/v/caddy-template.svg?style=flat-square)](https://www.npmjs.com/package/caddy-template) | `npx caddy-template proxy <host> <port>` |
| **[`caddy-subdomain`](https://github.com/keshavsoft/caddy-subdomain)** | Smoke Probes & Promotion | [![npm](https://img.shields.io/npm/v/caddy-subdomain.svg?style=flat-square)](https://www.npmjs.com/package/caddy-subdomain) | `npx caddy-subdomain probe <host>` |
| **[`caddy-fileserver`](https://github.com/keshavsoft/caddy-fileserver)** | Ubuntu Filesystem Bridge | [![npm](https://img.shields.io/npm/v/caddy-fileserver.svg?style=flat-square)](https://www.npmjs.com/package/caddy-fileserver) | `npx caddy-fileserver init <host>` |
| **[`caddy-knowledge`](https://github.com/keshavsoft/caddy-knowledge)** | Master Architectural Handbook | [Live Handbook](https://keshavsoft.github.io/caddy-knowledge/) | Full Suite Reference |
| **[`caddy-template-knowledge`](https://github.com/keshavsoft/caddy-template-knowledge)** | Route Blueprint Manual | [Live Manual](https://keshavsoft.github.io/caddy-template-knowledge/) | AST Deep-Dives |
| **[`caddy-hosting`](https://github.com/keshavsoft/caddy-hosting)** | Unified Gateway & Hub | [Live Portal](https://keshavsoft.github.io/caddy-hosting/) | Gateway Hub |

### The 3-Stage VPS Subdomain Maturity Model
1. **Stage 1 (Smoke Probe):** `npx caddy-subdomain probe <domain>` &rarr; verify DNS & SSL in memory (200 OK) with zero code/disk.
2. **Stage 2 (Static File Server):** `npx caddy-fileserver init <domain>` &rarr; provisions `/usr/share/<domain>` & native `file_server`.
3. **Stage 3 (Dynamic Node Backend):** `npx caddy-cli -p` (find free port) &rarr; `npx caddy-template proxy <domain> <port>` &rarr; `npx caddy-subdomain add <domain> <port>`.

---

## 📄 License

[ISC](LICENSE) &copy; [KeshavSoft](https://github.com/keshavsoft)
