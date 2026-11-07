# unitae-design

The Unitae design system, shared by the app, the control plane and the website.

| Package                      | What it is                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| [`@unitae/tokens`](./tokens) | Colours, type, radius, motion and chart palettes — CSS variables, a Tailwind v4 theme and a JS API |
| `@unitae/ui` _(planned)_     | Unitae components: app shell, stat tile, chart kit, filter bar, form sections, status…             |

## Develop

```sh
pnpm install
pnpm test:lint && pnpm test:typecheck && pnpm test && pnpm build
```

Releases: bump `tokens/package.json`, then push a tag such as `tokens-v0.1.0` — the release workflow tests, builds and publishes through npm trusted publishing (no stored token).

## Licence

MIT. The Unitae name and logo are not covered by this licence.
