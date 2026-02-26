# YAML Studio - Electrobun Edition

This application is now ready to be built as a cross-platform desktop executable using Electrobun.

## Project Structure

- `src/bun/index.ts`: Main process entry point (Bun).
- `src/views/main/index.html`: View entry point.
- `src/views/main/index.tsx`: React entry point.
- `electrobun.config.ts`: Electrobun configuration.

## How it works

The application uses Electrobun's native `views://` protocol. 
- **Main View**: Defined in `electrobun.config.ts` as `main`.
- **URL**: Accessed via `views://main/index.html` in the main process.
- **Bundling**: Electrobun automatically bundles the TypeScript code referenced in `index.html`.

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
