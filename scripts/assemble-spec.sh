#!/bin/bash
# scripts/assemble-spec.sh
# Assembles all spec section files into a single output document.
# Output: docs/specs/.build/SPEC-ForgeDX.assembled.md (gitignored)
# Never commit the assembled output.

set -e

SECTIONS_DIR="docs/specs/sections"
BUILD_DIR="docs/specs/.build"
OUTPUT="$BUILD_DIR/SPEC-ForgeDX.assembled.md"

mkdir -p "$BUILD_DIR"

echo "# ForgeDX — Full Specification (Assembled)" > "$OUTPUT"
echo "_Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ) — Do not commit this file._" >> "$OUTPUT"
echo "" >> "$OUTPUT"

for section in "$SECTIONS_DIR"/[0-9]*.md; do
  echo "--- $(basename $section) ---" >> "$OUTPUT"
  cat "$section" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "Assembled: $section"
done

echo "Output: $OUTPUT"
echo "Size: $(wc -l < "$OUTPUT") lines"
