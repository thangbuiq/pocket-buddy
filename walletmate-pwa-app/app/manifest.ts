import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Walletmate",
    short_name: "Walletmate",
    description: "Your AI-powered personal finance companion",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#080f10",
    theme_color: "#4fffb0",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
