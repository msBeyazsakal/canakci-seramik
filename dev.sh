#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_DIR="$DIR/.devcert"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/key.pem" ]; then
  echo "🔐 Creating self-signed certificate..."
  openssl req -x509 -newkey rsa:4096 \
    -keyout "$CERT_DIR/key.pem" \
    -out "$CERT_DIR/cert.pem" \
    -days 365 -nodes \
    -subj "/CN=192.168.1.101" 2>/dev/null
fi

echo "🚀 Starting dev server with HTTPS..."
npx next dev --port 3000 \
  --experimental-https \
  --experimental-https-key "$CERT_DIR/key.pem" \
  --experimental-https-cert "$CERT_DIR/cert.pem" \
  --hostname 0.0.0.0
