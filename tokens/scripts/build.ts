import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { baseCss, fontsCss, themeCss, tokensCss } from '../src/css.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string }
const dist = join(root, 'dist')

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })
const outputs: Record<string, string> = {
  'tokens.css': tokensCss(version),
  'theme.css': themeCss(version),
  'base.css': baseCss(version),
  'fonts.css': fontsCss(version),
}
for (const [file, css] of Object.entries(outputs)) {
  writeFileSync(join(dist, file), css)
}
process.stdout.write(`@unitae/tokens ${version}: wrote ${Object.keys(outputs).join(', ')}\n`)
