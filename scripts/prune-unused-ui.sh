#!/usr/bin/env bash
# Removes shadcn/ui components the app does not use, plus the packages only they needed.
# Re-add any later with:  cd apps/web && npx shadcn@latest add <component>
set -euo pipefail
cd "$(dirname "$0")/.."

UI=apps/web/src/components/ui
PRUNE_UI=(accordion alert aspect-ratio avatar badge breadcrumb calendar card carousel chart
  collapsible command context-menu drawer dropdown-menu form hover-card input-otp menubar
  navigation-menu pagination popover progress resizable scroll-area select separator sheet
  sidebar slider table tabs toggle-group toggle tooltip)
for c in "${PRUNE_UI[@]}"; do rm -f "$UI/$c.tsx"; done
rm -f apps/web/src/hooks/use-mobile.tsx          # only the sidebar used it
rmdir apps/web/src/hooks 2>/dev/null || true

PKGS=(@hookform/resolvers react-hook-form date-fns recharts cmdk vaul input-otp
  embla-carousel-react react-day-picker react-resizable-panels
  @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-avatar
  @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dropdown-menu
  @radix-ui/react-hover-card @radix-ui/react-menubar @radix-ui/react-navigation-menu
  @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-scroll-area
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider
  @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group
  @radix-ui/react-tooltip)
npm uninstall -w @digital-bridges/web "${PKGS[@]}"
echo "Pruned ${#PRUNE_UI[@]} components and ${#PKGS[@]} packages. Now run: npm run build && npm test"
