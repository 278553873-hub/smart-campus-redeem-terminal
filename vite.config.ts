import path from 'path';
import { defineConfig, loadEnv, type PreviewServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { createSchoolPcDemoScanHandler } from './services/schoolPcDemoScan.mjs';

function schoolPcDemoScan() {
    const attach = (server: ViteDevServer | PreviewServer) => {
        const handle = createSchoolPcDemoScanHandler(() => server.resolvedUrls?.network[0]);
        server.middlewares.use((request, response, next) => {
            if (!handle(request, response)) next();
        });
    };
    return { name: 'school-pc-demo-scan', configureServer: attach, configurePreviewServer: attach };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), schoolPcDemoScan()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
