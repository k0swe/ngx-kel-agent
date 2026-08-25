[![npm](https://badgen.net/npm/v/ngx-kel-agent)](https://www.npmjs.com/package/ngx-kel-agent)
[![Test](https://github.com/k0swe/ngx-kel-agent/actions/workflows/test.yml/badge.svg)](https://github.com/k0swe/ngx-kel-agent/actions/workflows/test.yml)

# ngx-kel-agent

This is a client library for Angular applications to integrate with
[`kel-agent`](https://github.com/k0swe/kel-agent). It provides an Angular service that creates and
manages the websocket connection.

## API overview

`ngx-kel-agent` is service-first and exports:

- `AgentService` for websocket connection lifecycle and compatibility shims.
- `WsjtxService` for WSJT-X message streams and command methods.
- `HamlibService` for Hamlib rig-state streams.
- `AgentMessageService` as the internal message bus used by services.

The primary reactive API is Angular `Signal`s (for current state) with companion `Observable`
streams for event/message flow. Legacy `AgentService` protocol passthrough members remain available
as deprecated compatibility paths; new integrations should prefer `WsjtxService` and
`HamlibService` directly.
