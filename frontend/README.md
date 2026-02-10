# Semantic Search Engine - Frontend

Next.js 14 frontend application for the Semantic Search Engine.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── dataset/        # Task 1: Dataset management page
│   │   ├── embedding/      # Task 2: Embedding & vector store page
│   │   ├── search/         # Task 3: Semantic search page
│   │   ├── layout.tsx      # Root layout with sidebar
│   │   ├── page.tsx        # Home page (redirects to dataset)
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── Sidebar.tsx     # Navigation sidebar
│   └── lib/
│       └── api.ts          # API utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Communication

The frontend communicates with the FastAPI backend at `http://localhost:8000`.

API utilities are available in `src/lib/api.ts`:
- `apiGet()` - GET requests
- `apiPost()` - POST requests with JSON
- `apiPostFormData()` - POST requests with file uploads
- `apiDelete()` - DELETE requests

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
