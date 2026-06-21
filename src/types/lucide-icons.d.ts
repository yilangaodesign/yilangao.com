// Individual lucide icon imports (`lucide-react/dist/esm/icons/<name>`) are
// required for components consumed by the Turbopack-bundled playground to avoid
// SSR/client icon mismatches (EAP-056). lucide-react ships no `exports` map, so
// TypeScript's bundler resolution cannot find types for the deep `.mjs` path.
// This wildcard declaration restores typing for those default imports.
declare module "lucide-react/dist/esm/icons/*" {
  import type { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}
