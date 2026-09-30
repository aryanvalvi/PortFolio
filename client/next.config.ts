import type {NextConfig} from "next"

// Temporarily disable automatic MDX integration to avoid Turbopack
// processing issues on some environments (e.g. VPS with Next 16).
// If you rely on MDX pages, we'll follow up with a compatible MDX
// integration for Next 16. For now, export a minimal config.
const nextConfig: NextConfig = {
  // Keep standard page extensions (without md/mdx) to avoid
  // attempting to process MDX as pages until MDX is re-enabled.
  pageExtensions: ["js", "jsx", "ts", "tsx"],
}

export default nextConfig
