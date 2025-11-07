# Secure Payments Backend - Task 2 starter

Stack: Node, Express, TypeScript, MongoDB, Mongoose. Includes HTTPS, Helmet, CSP, rate limiting, bcrypt password hashing, JWT cookies, and strict input validation.

## Quick start
1) Install dependencies:
```
npm install
```

2) Create local TLS certs with mkcert (Windows, Mac, Linux):
- Install mkcert, then:
```
mkdir certs
mkcert -install
mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost-cert.pem localhost 127.0.0.1 ::1
```
3) Copy `.env.example` to `.env` and adjust values if needed.

4) Start MongoDB locally. Example with Docker:
```
docker run -d --name mongo -p 27017:27017 mongo:7
```

5) Run dev server:
```
npm run dev
```

- HTTPS on https://localhost:3001
- HTTP on http://localhost:3000 will redirect to HTTPS
- Health check: GET https://localhost:3001/api/health

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/payments  (auth required)

## Security highlights
- HTTPS only in prod, HSTS enabled
- Helmet with CSP and frame-ancestors 'none'
- Rate limiting on auth routes, slow down optional
- Bcrypt hashing and salting
- JWT in httpOnly Secure cookie with SameSite=strict
- Input whitelisting with express-validator
