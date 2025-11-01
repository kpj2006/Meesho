# ProdSync Backend

RESTful API for ProdSync platform built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp env.example .env
```

3. Configure environment variables in `.env`

4. Start development server:
```bash
npm run dev
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `PORT` - Server port (default: 5000)

## Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon

## API Documentation

See main README.md for API endpoints.

