# ngx-kel-agent

This is a client library for Angular applications to integrate with
[`kel-agent`](https://github.com/k0swe/kel-agent). It provides an Angular service that creates and
manages the websocket connection.

`ngx-kel-agent` is intentionally service-first. Use:

- `WsjtxService` for WSJT-X state/signals and command methods
- `HamlibService` for Hamlib rig state/signals
- `AgentService` for connection lifecycle and deprecated compatibility passthroughs

Signals are the primary state API; observables are provided for message/event streams.
