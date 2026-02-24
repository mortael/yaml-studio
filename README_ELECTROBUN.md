# YAML Studio - Electrobun Edition

This application is now ready to be built as a cross-platform desktop executable using Electrobun.

## Project Structure

- `src/bun/index.ts`: Main process entry point (Bun).
- `electrobun.config.ts`: Electrobun configuration defining the `main` view.
- `App.tsx`, `index.tsx`, etc.: Web application source (React).

## How it works

The application uses Electrobun's native `views://` protocol. This eliminates the need for a separate HTTP server in production. Electrobun's built-in view system handles the bundling and serving of the React application.

## Prerequisites

- [Bun](https://bun.sh) installed on your system.

## Development

1. Start the Vite development server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the Electrobun application:
   ```bash
   npm run electrobun:dev
   ```

## Building for Production

1. Build the web application:
   ```bash
   npm run build
   ```

2. Build the native executable:
   ```bash
   npm run electrobun:build
   ```

The output will be in the `out` directory.
