# Release to Production

Deploy the latest changes from `main` branch to production by triggering the release workflow.

## Instructions

1. **Run the release workflow** using GitHub CLI:
   ```bash
   gh workflow run release-to-production.yml -f confirm=release
   ```

2. **Confirm execution** - The workflow will merge `main` into `release`, triggering Cloudflare Pages deployment to production.

3. **Verify deployment** - After ~60 seconds, check production at: https://gametime-tic-tac-toe.pages.dev

## Notes

- All changes in `main` should already be reviewed and tested
- The workflow requires typing "release" as confirmation (handled by `-f confirm=release`)
- Production URL: `gametime-tic-tac-toe.pages.dev`
