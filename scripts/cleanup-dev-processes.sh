#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v lsof >/dev/null 2>&1; then
  echo "lsof is required to clean repo-owned dev processes." >&2
  exit 1
fi

open_pids=()
while IFS= read -r pid; do
  if [[ -n "$pid" ]]; then
    open_pids+=("$pid")
  fi
done < <(lsof -t +D "$root_dir" 2>/dev/null | sort -u || true)

matched_pids=()
for pid in "${open_pids[@]}"; do
  command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"

  case "$command_line" in
    *"next dev"*|*"next/dist/bin/next"*|*"next-server"*|*"playwright"*|*"chromium"*|*"chrome"*|*"postcss"*|*"node "*)
      matched_pids+=("$pid")
      ;;
  esac
done

rm -f \
  "$root_dir/dev_server.log" \
  "$root_dir/lint_output.txt" \
  "$root_dir/page_content.html" \
  "$root_dir/playwright_validation.spec.ts" \
  "$root_dir/server.pid"

rm -rf \
  "$root_dir/.next" \
  "$root_dir/playwright-report" \
  "$root_dir/test-results"

if [[ ${#matched_pids[@]} -eq 0 ]]; then
  echo "No repo-owned dev processes found."
  exit 0
fi

echo "Stopping repo-owned dev processes: ${matched_pids[*]}"
kill -TERM "${matched_pids[@]}" 2>/dev/null || true

still_running=()
for pid in "${matched_pids[@]}"; do
  if kill -0 "$pid" 2>/dev/null; then
    still_running+=("$pid")
  fi
done

if [[ ${#still_running[@]} -gt 0 ]]; then
  echo "Force stopping stubborn processes: ${still_running[*]}"
  kill -KILL "${still_running[@]}" 2>/dev/null || true
fi