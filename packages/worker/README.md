# Cloudflare Worker for collaborative editing

## Deploy

### Set JWT secret for auth token (same as in app)

```
pnpm wrangler secret put COLLABORATIVE_EDITING_JWT_SECRET
```

### Deploy Worker

```
pnpm run deploy
```
