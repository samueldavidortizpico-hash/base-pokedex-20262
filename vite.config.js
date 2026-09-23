import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Rutas relativas en la build: asi dist/index.html tambien funciona
  // abierto con Live Server o desde una subcarpeta, no solo desde la raiz.
  base: './',
  plugins: [react()],
})
