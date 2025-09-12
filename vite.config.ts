import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import * as fs from 'fs'
import * as path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Custom plugin to replace environment variables in JSON files
const replaceEnvInJson = (): Plugin => {
  return {
    name: 'replace-env-in-json',
    transformIndexHtml: {
      enforce: 'pre',
      transform(_, { path: htmlPath }) {
        // Only process during build or when serving the index.html
        if (htmlPath.endsWith('index.html')) {
          // This will be called during the build process, not modifying the source file
          console.log('Processing environment variables for the build...');
        }
        return undefined;
      }
    },
    configureServer(server) {
      // This ensures the correct URL is used in development mode
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('tonconnect-manifest.json')) {
          const env = loadEnv(server.config.mode, process.cwd(), '');
          const manifestPath = path.resolve(__dirname, 'public/tonconnect-manifest.json');

          try {
            let manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            manifestContent = manifestContent.replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || '');

            res.setHeader('Content-Type', 'application/json');
            res.end(manifestContent);
          } catch (error) {
            console.error('Error processing tonconnect-manifest.json:', error);
            next();
          }
        } else {
          next();
        }
      });
    },
    generateBundle() {
      // This runs during the build process
      const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
      const manifestPath = path.resolve(__dirname, 'public/tonconnect-manifest.json');

      try {
        let manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        manifestContent = manifestContent.replace(/%VITE_APP_URL%/g, env.VITE_APP_URL || '');

        // Add the processed manifest to the build output
        this.emitFile({
          type: 'asset',
          fileName: 'tonconnect-manifest.json',
          source: manifestContent
        });

        console.log(`Processed %VITE_APP_URL% with ${env.VITE_APP_URL} for tonconnect-manifest.json in the build`);
      } catch (error) {
        console.error('Error processing tonconnect-manifest.json during build:', error);
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), '');
  // const apiUrl = new URL(env.VITE_BACKEND_API_URL);

  return {
    plugins: [react(), mkcert(), replaceEnvInJson(), nodePolyfills()],
    base: '/',
    server: {
      https: {},
      host: '127.0.0.1',
      port: 3000,
      // proxy: {
      //   '/api': {
      //     target: `https://${apiUrl.host}`,
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: (path) => path
      //   }
      // }
    }
  }
})
