# LWG Store (Monorepo)

Full-stack e-commerce MVP for **LWG Partners Network**.

## Structure
- `server/` — Node/Express API (MongoDB, Nodemailer, PDFKit, JWT, Cloudinary)
- `client/` — Vite static frontend (HTML/JS/CSS)

## Local quick start

### Backend (server)
```bash
cd server
cp .env.example .env   # or create .env with your values
npm install
# if TypeScript: npm run build
npm start              # or: npm run dev
