import test from "node:test";
import assert from "node:assert/strict";

import { gatewayTokenUpdates } from "../src/gateway-config.js";

test("gatewayTokenUpdates skips CLI writes when tokens are already current", () => {
  const config = { gateway: { auth: { mode: "token", token: "same" }, remote: { token: "same" } } };
  assert.deepEqual(gatewayTokenUpdates(config, "same"), []);
});

test("gatewayTokenUpdates returns only stale gateway fields", () => {
  const config = { gateway: { auth: { mode: "password", token: "old" }, remote: { token: "same" } } };
  assert.deepEqual(gatewayTokenUpdates(config, "same"), [
    ["gateway.auth.mode", "token"],
    ["gateway.auth.token", "same"],
  ]);
});
