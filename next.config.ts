import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Racine explicite : évite que Next remonte sur un package-lock.json parasite
  // situé au-dessus du projet (ex. dans le dossier personnel) et se trompe de workspace.
  turbopack: {
    root: __dirname,
  },
  // Vignettes du dashboard : les photos Supabase (souvent plusieurs Mo) sont
  // redimensionnées et converties par l'optimiseur d'images de Next/Vercel.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'atgedsxwrbatrntupuwe.supabase.co', pathname: '/storage/v1/object/public/project-images/**' },
    ],
  },
};

export default nextConfig;
