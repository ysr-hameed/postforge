#!/usr/bin/env bash
# One-shot setup for PostForge on Termux (proot Ubuntu) or any Linux.
# Usage:  bash setup.sh
# The API key is read hidden and kept ONLY in this shell session. It is never written to a file.
set -e
BASE="https://router.slyxup.com/v1"
MODEL="slyxup-auto"

cd "$(dirname "$0")"

echo "==> Checking Node.js (need 20+)"
if ! command -v node >/dev/null 2>&1; then echo "Node.js not found. Install Node 20+ first."; exit 1; fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then echo "Node $NODE_MAJOR found, need 20+."; exit 1; fi

echo "==> Installing dependencies"
npm install --no-audit --no-fund

echo "==> API key (input hidden, not saved to disk)"
read -r -s -p "Paste POSTFORGE_LLM_KEY: " KEY; echo
if [ -z "$KEY" ]; then echo "No key entered."; exit 1; fi

export POSTFORGE_LLM_BASE_URL="$BASE"
export POSTFORGE_LLM_MODEL="$MODEL"
export POSTFORGE_LLM_KEY="$KEY"

echo "==> Testing the model connection"
RESP=$(curl -s -w "\n%{http_code}" "$BASE/chat/completions" \
  -H "authorization: Bearer $KEY" -H "content-type: application/json" \
  -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":\"say hi\"}],\"max_tokens\":20}")
CODE=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')
if [ "$CODE" != "200" ]; then
  echo "Model call failed (HTTP $CODE):"; echo "$BODY" | head -c 300; echo
  echo "Setup not complete. Check the key and model name."; exit 1
fi
echo "Model OK."

echo "==> Generating a test post with the real model"
node cli.js --url spiceroute.in --count 2 --style mix --out out

echo
echo "Done. Posts are in ./out/"
echo "Your key is only set in this shell. For the next session, run 'bash setup.sh' again."
echo "To run the UI:  npm start   (then open http://localhost:3000)"
