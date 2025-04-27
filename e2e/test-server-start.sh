#!/bin/bash

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

TIMEOUT_SECONDS=15

output_file=$(mktemp)

cleanup() {
  rm -f "$output_file"
}
trap cleanup EXIT

echo -e "${YELLOW}Starting godot-wsl-lsp...${NC}"

# Start up server
godot-wsl-lsp --host 127.0.0.1 >"$output_file" 2>&1 &
godot_pid=$!

success_detected=0
timed_out=0

for ((i=0; i<$TIMEOUT_SECONDS; i++)); do
  if grep -q 'Success' "$output_file"; then
    success_detected=1
    break
  fi
  if ! kill -0 $godot_pid 2>/dev/null; then
    break
  fi
  echo -ne "Waiting for server start... (${i}s)\r"
  sleep 1
done

echo -ne "\r" # clears the "Waiting ..." line

# Stop server if it is still running
if kill -0 $godot_pid 2>/dev/null; then
  if [[ $success_detected -eq 0 ]]; then
    # Process still alive means it timed out
    timed_out=1
  fi

  kill "$godot_pid" 2>/dev/null
fi

wait "$godot_pid"
lsp_exit_code=$?

if [[ $success_detected -eq 1 ]]; then
  echo -e "${GREEN}INFO: Server started up successfully.${NC}"
  exit 0
elif [[ $timed_out -eq 1 ]]; then
  echo -e "${RED}ERROR: Timed out waiting for server start.${NC}" >&2
  cat "$output_file" >&2
  exit 2
else
  echo -e "${RED}ERROR: godot-wsl-lsp exited with error code $lsp_exit_code.${NC}" >&2
  cat "$output_file" >&2
  exit 1
fi
