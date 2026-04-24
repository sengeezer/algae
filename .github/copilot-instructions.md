- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
  Project: Algae. Framework: Next.js App Router. Language: TypeScript application with JavaScript and TypeScript algorithm examples only. Deployment target: Vercel.

- [x] Scaffold the Project
  Created a single-app Next.js workspace in the current directory with TypeScript, Tailwind CSS, ESLint, App Router, src directory, Turbopack, and npm.

- [x] Customize the Project
  Replaced the default starter with Algae's first real implementation slice: a searchable catalog, expanded interview-core algorithm library, MDX-backed content repository, algorithm detail routes, and local-first study state.

- [x] Install Required Extensions
  No extensions were specified by the setup information.

- [x] Compile the Project
  `npm run lint` passed cleanly. Runtime validation must be done from one clean dev-server session at a time after running `npm run cleanup:dev`.

- [x] Create and Run Task
  No dedicated VS Code task was added. The existing npm scripts are sufficient for this single-app Next.js workflow.

- [ ] Launch the Project

- [x] Ensure Documentation is Complete
  Updated README.md for Algae, restored `.github/copilot-instructions.md`, and kept the project information current for the MDX-backed catalog implementation slice.

- Operational Safeguards
  Keep at most one repo-owned Next.js dev server alive at a time.
  Before starting a new server, after finishing validation, and immediately after any interrupted session, run `npm run cleanup:dev`.
  Prefer the smallest viable validation step first. Avoid stacking long-lived watchers, duplicate dev servers, or repeated background commands.
  Use Playwright-based browser validation for this repository. Do not use the VS Code browser tools here.
  Remove transient PID and log files during cleanup so new sessions start from a known baseline.

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.