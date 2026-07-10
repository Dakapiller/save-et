import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const css = readFileSync(join(process.cwd(), 'src', 'App.css'), 'utf8')
const app = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8')

function blockFor(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector} \\{([\\s\\S]*?)\\n\\}`))

  assert.ok(match, `Missing CSS block for ${selector}`)

  return match[1]
}

function blockForIn(source: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = source.match(new RegExp(`${escapedSelector} \\{([\\s\\S]*?)\\n\\}`))

  assert.ok(match, `Missing CSS block for ${selector}`)

  return match[1]
}

const mobileCss = css.slice(css.indexOf('@media (max-width: 1100px)'), css.indexOf('@media (max-width: 400px)'))
const narrowMobileCss = css.slice(css.indexOf('@media (max-width: 400px)'), css.indexOf('@media (max-width: 340px)'))

test('desktop hero image reaches the viewport right edge from inside the wrapper', () => {
  const heroImage = blockFor('.hero-image')

  assert.match(heroImage, /position: absolute;/)
  assert.match(heroImage, /object-position: center 70%;/)
  assert.match(heroImage, /right: calc\(-1 \* var\(--side\) - 31px\);/)
  assert.match(heroImage, /width: 751px;/)
})

test("hero frame preserves the replacement photo's 4960:5787 aspect ratio", () => {
  const heroImage = blockFor('.hero-image')
  const mobileHeroImage = blockForIn(mobileCss, '.hero-image')

  assert.match(app, /import heroImage from '.\/assets\/figma\/hero-miin-dsc09179\.jpeg'/)
  assert.match(heroImage, /height: 876px;/)
  assert.match(heroImage, /width: 751px;/)
  assert.match(mobileHeroImage, /aspect-ratio: 4960 \/ 5787;/)
})

test('4k hero image keeps the Figma content offset instead of reaching the viewport edge', () => {
  assert.match(
    css,
    /@media \(min-width: 2200px\) \{[\s\S]*?\.hero-image \{[\s\S]*?right: -31px;[\s\S]*?\}/,
  )
})

test('mobile hero image has rounded corners', () => {
  const heroImage = blockForIn(mobileCss, '.hero-image')

  assert.match(heroImage, /border-radius: 10px;/)
  assert.match(heroImage, /object-position: center 70%;/)
})

test('mobile hero CTA appears directly after the title before the body copy', () => {
  assert.match(blockForIn(mobileCss, '.hero-copy'), /display: flex;/)
  assert.match(blockForIn(mobileCss, '.hero-copy'), /flex-direction: column;/)
  assert.match(blockForIn(mobileCss, '.hero-copy h1'), /order: 1;/)
  assert.match(blockForIn(mobileCss, '.hero-copy .campaign-button'), /order: 2;/)
  assert.match(blockForIn(mobileCss, '.hero-copy p'), /order: 3;/)
})

test('narrow phones use compact hero type so the CTA stays above the fold', () => {
  assert.match(blockForIn(narrowMobileCss, '.hero-copy h1'), /font-size: 30px;/)
})
