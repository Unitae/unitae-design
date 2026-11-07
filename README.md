# unitae-design

The Unitae design system, shared by the app, the control plane and the website.

| Package                      | What it is                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| [`@unitae/tokens`](./tokens) | Colours, type, radius, motion and chart palettes — CSS variables, a Tailwind v4 theme and a JS API |
| [`@unitae/ui`](./ui)         | Unitae components: stat tiles, chart kit with table twins, status, segmented control, brand mark   |

## Develop

```sh
pnpm install
pnpm test:lint && pnpm test:typecheck && pnpm test && pnpm build
```

Releases: bump the package's `package.json`, then push its tag (`tokens-v0.1.0`, `ui-v0.1.0`) — the release workflow tests, builds and publishes through npm trusted publishing (no stored token).

## Licence

MIT. The Unitae name and logo are not covered by this licence.
