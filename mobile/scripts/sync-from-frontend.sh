#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$MOBILE_DIR/.." && pwd)"
FRONTEND_SRC="$REPO_ROOT/frontend/src"
MOBILE_SRC="$MOBILE_DIR/app/src"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ ! -d "$FRONTEND_SRC" ]]; then
  echo "Missing frontend source: $FRONTEND_SRC" >&2
  exit 1
fi

if [[ ! -d "$MOBILE_SRC" ]]; then
  echo "Missing mobile source: $MOBILE_SRC" >&2
  exit 1
fi

case "$MOBILE_SRC" in
  "$MOBILE_DIR"/app/src) ;;
  *)
    echo "Resolved mobile source is outside /mobile/app/src: $MOBILE_SRC" >&2
    exit 1
    ;;
esac

copy_if_exists() {
  local relative_path="$1"
  if [[ -e "$MOBILE_SRC/$relative_path" ]]; then
    mkdir -p "$(dirname "$TMP_DIR/src/$relative_path")"
    cp -R "$MOBILE_SRC/$relative_path" "$TMP_DIR/src/$relative_path"
  fi
}

echo "Preparing frontend source copy..."
mkdir -p "$TMP_DIR/src"
cp -R "$FRONTEND_SRC/." "$TMP_DIR/src/"

echo "Restoring mobile-specific overrides..."
copy_if_exists "App.jsx"
copy_if_exists "main.jsx"
copy_if_exists "components/AuthModal.jsx"
copy_if_exists "components/RazorpayButton.jsx"
copy_if_exists "lib/payment.mobile.js"
copy_if_exists "lib/platform.mobile.js"
copy_if_exists "lib/pro.js"
copy_if_exists "lib/razorpayPayment.js"
copy_if_exists "lib/supabase.mobile.js"
copy_if_exists "pages/LandingPage.jsx"
copy_if_exists "styles/mobile-overrides.css"

echo "Rewriting copied Supabase imports to the mobile client..."
find "$TMP_DIR/src" -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
  perl -0pi -e "s/from '\\.\\/supabase\\.js'/from '.\\/supabase.mobile.js'/g; s/from '\\.\\/supabase'/from '.\\/supabase.mobile'/g; s/from '\\.\\/lib\\/supabase'/from '.\\/lib\\/supabase.mobile'/g; s/from '\\.\\.\\/lib\\/supabase'/from '..\\/lib\\/supabase.mobile'/g; s/from '\\.\\.\\/\\.\\.\\/lib\\/supabase'/from '..\\/lib\\/supabase.mobile'/g;" "$file"
done

echo "Diff between current mobile source and synced candidate:"
git diff --no-index -- "$MOBILE_SRC" "$TMP_DIR/src" || true

if [[ "${1:-}" != "--yes" ]]; then
  read -r -p "Apply this sync to /mobile/app/src? Type 'yes' to continue: " answer
  if [[ "$answer" != "yes" ]]; then
    echo "Sync cancelled. /frontend and /mobile were not changed."
    exit 0
  fi
fi

echo "Applying sync to /mobile/app/src only..."
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$TMP_DIR/src/" "$MOBILE_SRC/"
else
  rm -rf "$MOBILE_SRC"
  mkdir -p "$MOBILE_SRC"
  cp -R "$TMP_DIR/src/." "$MOBILE_SRC/"
fi

echo "Sync complete. /frontend untouched. /backend untouched."
