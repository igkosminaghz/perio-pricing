import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative by default (Render + local dist). GitHub Pages sets VITE_BASE=/perio-pricing/
  base: process.env.VITE_BASE || './',
})
