<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Operational Safeguards

- Keep only one Algae-owned dev server alive at a time.
- Run `npm run cleanup:dev` before restarting validation and immediately after crashes or abandoned runs.
- Prefer Playwright for browser verification in this repo. Do not use the VS Code browser tools.
- Avoid leaving idle Next.js, Node.js, or Playwright helper processes behind after checks complete.
<!-- END:nextjs-agent-rules -->
