# YAML Studio - Electrobun Edition

This application is now ready to be built as a cross-platform desktop executable using Electrobun.

## Project Structure

- `src/bun/index.ts`: Main process entry point (Bun).
- `electrobun.config.ts`: Electrobun configuration.
- `App.tsx`, `index.tsx`, etc.: Web application source (React).

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
