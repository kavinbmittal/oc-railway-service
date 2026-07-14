export function gatewayTokenUpdates(config, token) {
  const updates = [];

  if (config?.gateway?.auth?.mode !== "token") {
    updates.push(["gateway.auth.mode", "token"]);
  }
  if (config?.gateway?.auth?.token !== token) {
    updates.push(["gateway.auth.token", token]);
  }
  if (config?.gateway?.remote?.token !== token) {
    updates.push(["gateway.remote.token", token]);
  }

  return updates;
}
