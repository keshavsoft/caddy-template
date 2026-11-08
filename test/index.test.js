import test from "node:test";
import assert from "node:assert/strict";
import {
  getTemplate,
  listTemplates,
  createProxyTemplate,
  createWsSplitTemplate,
  createStaticTemplate,
  createMultiHostTemplate,
  normalizeDial
} from "../src/index.js";
import * as v1 from "../src/v1/index.js";

test("normalizeDial converts ports and formats correctly", () => {
  assert.equal(normalizeDial(3000), "localhost:3000");
  assert.equal(normalizeDial("4000"), "localhost:4000");
  assert.equal(normalizeDial(":8080"), "localhost:8080");
  assert.equal(normalizeDial("127.0.0.1:9011"), "127.0.0.1:9011");
  assert.equal(normalizeDial("backend.local:5000"), "backend.local:5000");
});

test("createProxyTemplate generates valid unified reverse proxy route", () => {
  const route = createProxyTemplate({ host: "appointment.keshavsoft.com", dial: 3000 });

  assert.equal(route.terminal, true);
  assert.deepEqual(route.match[0].host, ["appointment.keshavsoft.com"]);
  assert.equal(route.handle[0].handler, "subroute");

  const subroute = route.handle[0].routes[0];
  assert.equal(subroute.handle[0].handler, "reverse_proxy");
  assert.deepEqual(subroute.handle[0].upstreams[0].dial, "localhost:3000");
});

test("createWsSplitTemplate generates dual-target reverse proxy route", () => {
  const route = createWsSplitTemplate({
    host: "quotation.keshavsoft.com",
    httpDial: 9011,
    wsDial: 8080,
    wsPath: "/ws*"
  });

  assert.equal(route.terminal, true);
  assert.deepEqual(route.match[0].host, ["quotation.keshavsoft.com"]);

  const subroutes = route.handle[0].routes;
  assert.equal(subroutes.length, 2);

  // WS subroute
  assert.deepEqual(subroutes[0].match[0].path, ["/ws*"]);
  assert.equal(subroutes[0].handle[0].upstreams[0].dial, "localhost:8080");

  // HTTP subroute
  assert.equal(subroutes[1].handle[0].upstreams[0].dial, "localhost:9011");
});

test("createStaticTemplate generates valid file_server route", () => {
  const route = createStaticTemplate({
    host: "cli.keshavsoft.com",
    root: "/usr/share/cli.keshavsoft.com"
  });

  assert.equal(route.terminal, true);
  assert.deepEqual(route.match[0].host, ["cli.keshavsoft.com"]);

  const handles = route.handle[0].routes[0].handle;
  assert.equal(handles[0].handler, "vars");
  assert.equal(handles[0].root, "/usr/share/cli.keshavsoft.com");
  assert.equal(handles[1].handler, "file_server");
});

test("createMultiHostTemplate handles array of domains", () => {
  const route = createMultiHostTemplate({
    hosts: ["keshavsoft.com", "www.keshavsoft.com"],
    dial: 9328
  });

  assert.deepEqual(route.match[0].host, ["keshavsoft.com", "www.keshavsoft.com"]);
  assert.equal(route.handle[0].routes[0].handle[0].upstreams[0].dial, "localhost:9328");
});

test("getTemplate resolves known templates and throws on unknown", () => {
  const p = getTemplate("proxy", { host: "test.com", dial: 5000 });
  assert.deepEqual(p.match[0].host, ["test.com"]);

  const s = getTemplate("ws-split", { host: "ws.com", httpDial: 80, wsDial: 8080 });
  assert.deepEqual(s.match[0].host, ["ws.com"]);

  assert.throws(() => getTemplate("invalid-type"), /Unknown template/);
});

test("listTemplates returns template catalog", () => {
  const list = listTemplates();
  assert.ok(list.length >= 4);
  assert.ok(list.some((t) => t.name === "proxy"));
  assert.ok(list.some((t) => t.name === "ws-split"));
});

test("root exports match v1 module", () => {
  assert.equal(typeof v1.createProxyTemplate, "function");
  assert.equal(typeof v1.getTemplate, "function");
});
