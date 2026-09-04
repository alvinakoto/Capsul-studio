import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine explicite : évite que Next remonte sur un package-lock.json parasite
  // situé au-dessus du projet (ex. dans le dossier personnel) et se trompe de workspace.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
