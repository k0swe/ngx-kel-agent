# ngx-kel-agent

This is a client library for Angular applications to integrate with
[`kel-agent`](https://github.com/k0swe/kel-agent). It provides an Angular service that creates and
manages the websocket connection, and exposes incoming messages as `Observable`s and outgoing
messages as method calls.

## Code scaffolding

Run `ng generate component component-name --project ngx-kel-agent` to generate a new component. You
can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-kel-agent`.
> Note: Don't forget to add `--project ngx-kel-agent` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build ngx-kel-agent` to build the project. The build artifacts will be stored in the `dist/`
directory.

## Publishing

After building your library with `ng build ngx-kel-agent`, go to the dist
folder `cd dist/ngx-kel-agent` and run `npm publish`.

## Running unit tests

Run `ng test ngx-kel-agent` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
