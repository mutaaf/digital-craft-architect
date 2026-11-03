
# Digital Craft Architect

A modern web application showcasing AI-powered solutions for traditional industries.

## Features

- Responsive design for all devices
- Interactive components with smooth animations
- Contact form with AI formalization
- Case studies and testimonials carousel
- Google Analytics integration
- Sentry error tracking

## Easter Egg

This application includes a hidden snake game! To access it:

1. Enter the Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
2. Control the snake with arrow keys
3. Collect food to grow and increase your score
4. Press SPACE to restart after game over
5. Press ESC to close the game

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Blog writer (agency server)

`scripts/blog-writer.sh` drafts one blog post per run and opens it as a `gtm/blog-*` PR. It never merges; the normal CI gates and blog-ship handle that. The prompt lives in `blog/writer/PROMPT.md` and changes only by PR. `scripts/blog-writer-postcheck.ts` checks the new post before the repo checks.

**Status: disabled.** Do not enable it until the cloud routine `trig_0127b6vx6XFJzjLpoJF17yBp` (digitalcraft-blog-publisher) is retired, or the two writers will double post.

- Run once by hand: `bash scripts/blog-writer.sh --manual` (refused on Mon/Wed while disabled). Gates only, no model call: `--dry-run`.
- Enable scheduled runs: create `~/.config/dca-blog-writer/ENABLED` and install a timer or cron entry that calls the script.
- Stop it: `rm ~/.config/dca-blog-writer/ENABLED` (or create `~/.config/dca-blog-writer/STOP`) and remove the timer or cron entry.

## Built With

- React + TypeScript
- Tailwind CSS
- Sentry for error tracking
- React Query for data fetching
