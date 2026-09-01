/** @type {import('next').NextConfig} */
const basePath =
  process.env.GITHUB_PAGES_BASE_PATH ||
  (process.env.GITHUB_ACTIONS ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] || ""}` : "")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exporta como site estático (HTML/JS/CSS puros), compatível com GitHub Pages.
  output: "export",
  // GitHub Pages serve o projeto em https://usuario.github.io/NOME_DO_REPO/,
  // então o basePath precisa bater com o nome do repositório.
  basePath,
  trailingSlash: true,
  // Expõe o basePath para o código client-side (ex: <img> apontando pra /public),
  // já que com images.unoptimized o next/image não prefixa o src automaticamente.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig