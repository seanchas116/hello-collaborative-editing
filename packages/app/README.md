# Collaborative Editor Frontend

## Develop

### Setup Supabase

Create a new Supabase project.

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
