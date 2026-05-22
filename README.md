# NewFeed Frontend

Next.js App Router client for the NewFeed microservices stack.

## Environment

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_API_URL` — API Gateway (e.g. `http://localhost:8080`)
- `NEXT_PUBLIC_GRAPHQL_POST_URL` — `http://localhost:8080/graphql/post`
- `NEXT_PUBLIC_GRAPHQL_COMMENT_URL` — `http://localhost:8080/graphql/comment`
- `NEXT_PUBLIC_WS_COMMENT_URL` — `ws://localhost:8080/graphql/comment`
- `NEXT_PUBLIC_WS_NOTIFICATION_URL` — `http://localhost:8080` (Socket.IO path: `/notifications/socket.io`)

Identity comes from the HttpOnly `access_token` cookie set by the auth service. Do not set `user_id` in the browser.

## Project structure

```
features/
  auth/           # login, session, server actions
  feed/           # news feed GraphQL operations
  comments/       # comments + subscriptions
  notifications/  # inbox REST + Socket.IO push
  shared/         # Apollo client, generated GraphQL types
graphql/schemas/  # SDL synced with backend (for codegen)
```

## GraphQL codegen

```bash
npm run codegen
```

Regenerates `features/shared/generated/graphql.ts` from `graphql/schemas/` and `features/**/graphql/*.graphql`.

## Development

```bash
npm run dev
```
