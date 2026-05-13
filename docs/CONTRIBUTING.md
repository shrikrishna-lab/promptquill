# Contributing

First off, thank you for considering contributing to PromptQuill. It's people like you that make this project great.

## How to Report Issues

1. Search the [issue tracker](https://github.com/yourusername/promptquill/issues) to avoid duplicates
2. If your issue is new, open a new issue
3. Include:
   - A clear, descriptive title
   - Steps to reproduce (with screenshots if possible)
   - Expected behavior vs actual behavior
   - Browser and OS versions
   - Any relevant console errors or logs

## How to Submit Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run lint: `npm run lint`
5. Commit using conventional commits (see below)
6. Push: `git push origin feat/my-feature`
7. Open a pull request against the `main` branch

### PR Checklist

- [ ] Code follows existing style and conventions
- [ ] Lint passes (`npm run lint`)
- [ ] If you added a feature, update relevant docs
- [ ] No new warnings or errors in dev console

## Code Style

- **Frontend**: React 18 with functional components and hooks. Use ES modules.
- **Backend**: Node.js with Express. CommonJS or ESM consistent with surrounding code.
- **Formatting**: Use the project's Prettier/ESLint config if one exists; otherwise match surrounding code.
- **Naming**: `camelCase` for variables and functions, `PascalCase` for components, `SCREAMING_SNAKE_CASE` for constants.
- **Imports**: Group by: 1) external libs, 2) internal modules, 3) styles — with blank lines between groups.

## Development Setup

1. Follow the [Setup Guide](./SETUP.md) to get the project running locally
2. Make sure `npm run dev` starts without errors
3. Create a branch off `main` for your work
4. Test your changes thoroughly before opening a PR

## Commit Message Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional body]
```

Types:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `style:` — formatting, missing semicolons, etc. (no code change)
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `perf:` — performance improvement
- `test:` — adding or updating tests
- `chore:` — build process, tooling, dependencies

Examples:
```
feat: add rate limiting to AI provider fallback
fix: handle null response from Gemini API
docs: update API endpoint references
```

## Questions?

Open a [Discussion](https://github.com/yourusername/promptquill/discussions) or ping the maintainers.
