import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Tests QR code entre PC et téléphone sur le même Wi-Fi :
    // le dev server accepte les connexions de l'IP locale.
    // Aucun port n'est exposé sur Internet (réseau local uniquement).
    host: true,
    // En Vite 6+, le contrôle du header Host bloque sinon
    // les requêtes venant de http://<IP-du-PC>:5173.
    allowedHosts: true,
  },
})
