# Groupli.app

## Local development

### Setup

1. `direnv allow`
1. `pnpm i`
1. `drizzle-kit push` to run db migrations

#### With tracing

1. Create a file `.dev.vars` in the root of the repo with the following content:

 ```env
 # Local
 OTLP_URL=http://localhost:4318/v1/traces
 # Auth not needed for local
 # OTLP_AUTH="Basic XXX"
 ```

1. `nix run` to get Grafana/Tempo running locally
1. Run the project (dev or preview)
1. Click on the "Get Started" button (will take about 15 sec the first time) and add some members.
1. See traces under <http://localhost:4000/explore>

### Run dev with hot reloading

1. `pnpm dev`
1. Open <http://localhost:3000>
