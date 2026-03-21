# TODO

## v2: One-tap model switch from Telegram

When a model fallback alert fires, include an inline "Switch" button that rewrites `agents.defaults.model.primary` in `openclaw.json` via an HMAC-secured `/ops/model-switch` endpoint. Also add an "Undo" button to the confirmation message so switching back is one more tap.

Deferred because it writes to `openclaw.json` on the live volume — needs careful testing for race conditions and a rollback mechanism before shipping.
