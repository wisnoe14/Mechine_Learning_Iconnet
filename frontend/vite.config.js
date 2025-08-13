import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    headers: {
    // CSP: izinkan style-src 'self' dan 'unsafe-inline' agar style inline dan Tailwind bisa jalan
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
    }
  }
});