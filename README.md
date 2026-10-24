# Groupli.app

## Local development

### Setup

1. `direnv allow`
2. `pnpm i`
3. `drizzle-kit push` to run db migrations

Node.js 24 and pnpm 12.14.0 are pinned in `package.json` (`engines.node` / `packageManager`).
The Nix dev shell provides Node 24 + corepack, which installs the pinned pnpm automatically.
Production builds (Railpack/Coolify) read the same fields.

#### Secrets

1. Create a file `.env` in the root of the repo with the following content:

 ```env
 # Local DB url
 DB_URL=data.sqlite

 # Local
 OTLP_URL=http://localhost:4318/v1/traces
 # Auth not needed for local
 # OTLP_AUTH="Basic XXX"
 ```

### Tracing

1. `nix run` to get Grafana/Tempo running locally
1. Run the project (dev or preview)
1. Click on the "Get Started" button (will take about 15 sec the first time) and add some members.
1. See traces under <http://localhost:4000/explore>
1. Login with "admin/admin"

### Run dev with hot reloading

1. `pnpm dev`
1. Open <http://localhost:3000>

## Testing

### Unit Tests

```bash
pnpm test          # Run once
pnpm test:w        # Watch mode
```

### E2E Tests

```bash
pnpm test:e2e      # Run e2e tests (dev mode)
pnpm test:e2e:ci   # Run e2e tests (production mode)
```

See [e2e/README.md](./e2e/README.md) for more details.

### CI Pipeline

Run the complete CI pipeline locally:

```bash
pnpm build:ci
```

This runs (via `scripts/ci.sh`):

1. Type checking
2. Unit tests
3. Production build
4. Database seeding for e2e tests
5. E2E tests against production build

The CI script automatically:

- Sets all required environment variables (`DB_URL`, `OTLP_URL`, `CI`, `E2E_GROUP_TEST_ID`)
- Seeds the database with test data
- Runs e2e tests against the production server

**Note:** In CI mode, environment variables are exported directly by the shell script - no `.test-env.json` file is created.

## Production

### Backup

Script that is run on the server to backup the db:

```sh
sqlite3 db/data.sqlite ".backup 'db/backups/backup_$(date +\%Y-%m-%d_%H-%M-%S).sqlite'" && rclone copy db/backups infomaniak-backup:default/groupli/backup
```

`rclone copy` only uploads new and changed backups and never deletes anything in the bucket.

The `infomaniak-backup` remote is configured with `rclone config` for the root user.

Only if the task is ever moved inside the deployment container does the remote need to be made available there, either by mounting an `rclone.conf` (via Coolify volume) or with environment variables (rclone reads env-based remotes without any config file):

```env
RCLONE_CONFIG_INFOMANIAK_BACKUP_TYPE=s3
RCLONE_CONFIG_INFOMANIAK_BACKUP_PROVIDER=Other
RCLONE_CONFIG_INFOMANIAK_BACKUP_ENDPOINT=https://s3.swiss-backup04.infomaniak.com
RCLONE_CONFIG_INFOMANIAK_BACKUP_ACCESS_KEY_ID=...
RCLONE_CONFIG_INFOMANIAK_BACKUP_SECRET_ACCESS_KEY=...
```

### Accessing Infomaniak Backups

#### Setup rclone connection

Configure rclone to connect to Infomaniak Swiss Backup 04 (S3):

```sh
rclone config
```

1. Choose `n` for new remote
2. Name it `infomaniak-backup`
3. Choose `s3` for Amazon S3 Compliant Storage Providers
4. Choose `Other` for S3 provider
5. Choose `1` for AWS credentials in the next step (env or IAM)
6. Enter your Access Key ID
7. Enter your Secret Access Key
8. Leave region blank (press Enter)
9. Enter endpoint: `https://s3.swiss-backup04.infomaniak.com`
10. Leave location constraint blank (press Enter)
11. Leave ACL blank (press Enter)
12. Accept defaults for remaining options
13. Choose `y` to confirm and save

#### Mount backups

To mount and access the Infomaniak backup storage:

```sh
./mount-infomaniak-backup-s3.sh
```

The backups will be accessible at `./infomaniak/groupli/backup/`. Press Ctrl+C to unmount when done.
