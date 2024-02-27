# Cloudflare Worker for collaborative editing

## Deploy

### Deploy Worker

```
pnpm run deploy
```

### Set JWT secret for auth token (same as app)

```
pnpm wrangler secret put COLLABORATIVE_EDITING_JWT_SECRET
```
