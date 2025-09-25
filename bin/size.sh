#!/bin/bash

# Create temporary config for bundled build
cat > tsup.bundle.config.js << 'EOF'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/application.js'],
  format: 'esm',
  bundle: true,
  minify: true,
  target: 'es2020',
  outDir: 'temp',
  clean: true,
  esbuildOptions(options) {
    options.drop = ['console', 'debugger']
    options.legalComments = 'none'
  }
})
EOF

# Build bundled version
npx tsup --config tsup.bundle.config.js

# Get gzipped size
GZIP_SIZE=$(gzip -c temp/application.js | wc -c | tr -d ' ')
ORIGINAL_SIZE=$(wc -c < temp/application.js | tr -d ' ')

echo ""
echo "📦 Bundled size: ${ORIGINAL_SIZE} bytes"
echo "🗜️ Gzipped size: ${GZIP_SIZE} bytes"
echo "📊 Compression: $(echo "scale=1; (1 - $GZIP_SIZE / $ORIGINAL_SIZE) * 100" | bc -l)%"
echo ""

# Cleanup
rm -rf temp tsup.bundle.config.js
