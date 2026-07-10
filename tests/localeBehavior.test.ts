import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const app = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8')

test('hero title remounts on locale changes so SplitText cannot preserve stale copy', () => {
  assert.match(app, /<h1 key=\{`hero-title-\$\{locale\}`\}>/)
})

test('document language follows the selected locale', () => {
  assert.match(app, /document\.documentElement\.lang = locale/)
})

test('English hero title keeps the requested line break after living community', () => {
  assert.match(app, /\{locale === 'en' && <br \/>\}/)
})
