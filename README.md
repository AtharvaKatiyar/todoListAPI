# TodoListAPI

Small Express API for a simple user-scoped todo list backed by Prisma (Postgres). This service provides authentication (email/password -> JWT) and CRUD endpoints for todos. The project ships a generated Prisma client and uses `@prisma/adapter-pg` to connect to Postgres.

**Quick Summary**
- **Server:** Express, listens on `http://localhost:3000` by default.
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login` (returns JWT).
- **Todos:** `GET /api/todo/`, `POST /api/todo/add`, `PUT /api/todo/update/:id`, `DELETE /api/todo/delete/:id` (all protected — require `Authorization: Bearer <token>`).

**Requirements**
- Node.js >= 18
- A Postgres database and a valid `DATABASE_URL` connection string
- `npm` (or yarn/pnpm)

**Important environment variables**
- `DATABASE_URL` — Postgres connection string (required)
- `JWT_SECRET` — secret used to sign JWT tokens (required)
- `SALT_ROUND` — bcrypt salt rounds (recommended: `10`)

Create a `.env` file in the root directory (`basics/todoListAPI/`) with at least:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_here
SALT_ROUND=10
```

**Install & Run (development)**
1. Change into the project root:

```bash
cd basics/todoListAPI
```

2. Install dependencies:

```bash
npm install
```

3. Start in development mode (uses `nodemon`):

```bash
npm run dev
```

Or run directly:

```bash
npm start
```

The server listens on port `3000` by default. Health check:

```bash
curl http://localhost:3000/health
# Expected response: {"status":"ok"}
```

**API Endpoints**

- **Register** — Create a new user

  - Method: `POST`
  - URL: `/api/auth/register`
  - Body (JSON):

    ```json
    { "email": "user@example.com", "password": "password" }
    ```

  - Response: `201` with `{ message, userId }` on success.

- **Login** — Obtain JWT

  - Method: `POST`
  - URL: `/api/auth/login`
  - Body (JSON):

    ```json
    { "email": "user@example.com", "password": "password" }
    ```

  - Response: `200` with `{ message, token, user }` on success. Use `token` for protected endpoints.

- **Get Todos**

  - Method: `GET`
  - URL: `/api/todo/`
  - Auth: `Authorization: Bearer <token>` header required

- **Create Todo**

  - Method: `POST`
  - URL: `/api/todo/add`
  - Auth: `Authorization: Bearer <token>`
  - Body (JSON): `{ "title": "Buy milk" }`

- **Update Todo**

  - Method: `PUT`
  - URL: `/api/todo/update/:id`
  - Auth: `Authorization: Bearer <token>`
  - Body (JSON): any of `{ "title": "new title", "completed": true }`

- **Delete Todo**

  - Method: `DELETE`
  - URL: `/api/todo/delete/:id`
  - Auth: `Authorization: Bearer <token>`

**cURL Examples**

- Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}'
```

- Login (save the returned token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}'
```

- Create a todo

```bash
curl -X POST http://localhost:3000/api/todo/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

- List todos

```bash
curl -X GET http://localhost:3000/api/todo/ \
  -H "Authorization: Bearer $TOKEN"
```

- Update todo

```bash
curl -X PUT http://localhost:3000/api/todo/update/<TODO_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

- Delete todo

```bash
curl -X DELETE http://localhost:3000/api/todo/delete/<TODO_ID> \
  -H "Authorization: Bearer $TOKEN"
```

**Notes & Troubleshooting**
- Make sure `DATABASE_URL` points to a reachable Postgres instance and that migrations have been applied. The project contains a generated Prisma client under `generated/prisma` — if you change the schema, re-run `prisma generate`.
- If you get errors on Prisma client construction, ensure `DATABASE_URL` is set and the `@prisma/adapter-pg` dependency is installed (the repo already includes it).
- If auth requests return 500 or router registration fails, check `src/routes/authRouter.js` — the router currently uses `await regiController` which may be a coding mistake; it should be `authRouter.post('/register', regiController);` and similar for login. If you hit an error like `PrismaClientInitializationError` or missing env vars, verify your `.env`.

**Next steps / Improvements**
- Add proper scripts for seeding/test data and migration commands in `package.json`.
- Add request validation and better error responses.
- Add unit/integration tests and Docker compose for local Postgres.

---
Project files worth checking:

- `src/app.js` — server bootstrap
- `src/routes/authRouter.js`, `src/routes/todoRouter.js` — route definitions
- `src/controllers/*` — request handlers
- `src/lib/prisma.js` — Prisma client construction (uses `@prisma/adapter-pg`)
