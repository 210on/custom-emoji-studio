import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const GITHUB_PAGES_BASE = '/custom-emoji-studio/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  const isGithubPagesBuild =
    process.env.GITHUB_ACTIONS === 'true' || env.VITE_DEPLOY_TARGET === 'github-pages';
  const base = env.VITE_BASE_PATH || (isGithubPagesBuild ? GITHUB_PAGES_BASE : '/');

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
