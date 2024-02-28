# Collaborative Editor App

## Develop

### Setup services

- Supabase
  - Setup Google auth
- Stripe
  - Create a subscription product
  - Configure the customer portal

### Set environment variables

```
cp .env.local.example .env.local
```

Then fill in the environment variables in `.env.local`.

### Migrate DB

```
pnpm migrate
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Receive Stripe webhooks locally

```bash
stripe login
pnpm dev:stripe-webhook
```
