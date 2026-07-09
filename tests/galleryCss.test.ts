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

test('gallery wrapper and arrows use desktop side placement', () => {
  assert.match(blockFor('.gallery-section'), /background: #ffffff;/)
  assert.match(blockFor('.gallery-section'), /height: 820px;/)
  assert.match(blockFor('.gallery-wrap'), /left: calc\(var\(--side\) \+ 1px\);/)
  assert.match(
    blockFor('.gallery-wrap'),
    /width: min\(1381px, calc\(100vw - var\(--side\) - 1px\)\);/,
  )
  assert.match(blockFor('.gallery-track'), /overflow: visible;/)
  assert.match(blockFor('.gallery-track'), /will-change: transform;/)
  assert.match(blockFor('.gallery-track img'), /border-radius: 10px;/)
  assert.match(blockFor('.gallery-prev'), /left: -84px;/)
  assert.match(blockFor('.gallery-prev'), /top: 225px;/)
  assert.match(blockFor('.gallery-next'), /right: 66px;/)
  assert.match(blockFor('.gallery-next'), /top: 225px;/)
})

test('gallery carousel uses the same measured slide pattern as people carousel', () => {
  assert.equal(
    app.match(/import galleryCommunity\d+ from '\.\/assets\/figma\/gallery\/gallery-\d+\.jpg'/g)?.length,
    19,
  )
  assert.match(
    app,
    /const galleryCommunityImages = \[\n  galleryCommunity13,\n  galleryCommunity04,\n  galleryCommunity20,\n  galleryCommunity01,\n  galleryCommunity17,\n  galleryCommunity18,\n  galleryCommunity24,\n  galleryCommunity06,\n  galleryCommunity26,\n  galleryCommunity09,\n  galleryCommunity14,\n  galleryCommunity23,\n  galleryCommunity08,\n  galleryCommunity10,\n  galleryCommunity27,\n  galleryCommunity11,\n  galleryCommunity25,\n  galleryCommunity16,\n  galleryCommunity22,\n\] as const/,
  )
  assert.match(app, /const galleryImages = galleryCommunityImages/)
  assert.match(app, /const galleryTrackImages = \[\.\.\.galleryImages, galleryImages\[0\], galleryImages\[1\]\] as const/)
  assert.match(app, /galleryTrackImages\.map\(\(image, index\) => \(/)
  assert.match(app, /querySelector<HTMLElement>\('\.gallery-track'\)/)
  assert.match(app, /const target = track\.children\[galleryIndex\] as HTMLElement \| undefined/)
  assert.match(app, /x: -offsetOf\(\)/)
  assert.match(app, /loading="lazy"/)
  assert.match(app, /decoding="async"/)
})

test('gallery carousel masks both sides with the same overlap treatment', () => {
  assert.match(
    app,
    /galleryIndex > 0 \? 'gallery-fade gallery-fade--left' : 'gallery-fade gallery-fade--left gallery-fade--hidden'/,
  )

  const rightFade = blockFor('.gallery-fade')
  const leftFade = blockFor('.gallery-fade--left')
  const hiddenFade = blockFor('.gallery-fade--hidden')

  assert.match(rightFade, /background: linear-gradient\(90deg, rgba\(255, 255, 255, 0\), #ffffff 137px, #ffffff\);/)
  assert.match(rightFade, /height: 513px;/)
  assert.match(rightFade, /pointer-events: none;/)
  assert.match(rightFade, /right: calc\(-1 \* var\(--side\)\);/)
  assert.match(rightFade, /top: 0;/)
  assert.match(rightFade, /width: calc\(var\(--side\) \+ 185px\);/)
  assert.match(rightFade, /z-index: 3;/)

  assert.match(leftFade, /background: linear-gradient\(90deg, #ffffff, #ffffff calc\(100% - 137px\), rgba\(255, 255, 255, 0\)\);/)
  assert.match(leftFade, /left: calc\(-1 \* var\(--side\) - 1px\);/)
  assert.match(leftFade, /right: auto;/)
  assert.match(leftFade, /width: calc\(var\(--side\) \+ 1px\);/)

  assert.match(hiddenFade, /opacity: 0;/)
  assert.match(hiddenFade, /visibility: hidden;/)
})

test('gallery arrows use gallery-specific Figma assets', () => {
  assert.match(app, /import galleryArrowPrev from '\.\/assets\/figma\/vectors\/gallery-arrow-prev\.svg'/)
  assert.match(app, /import galleryArrowNext from '\.\/assets\/figma\/vectors\/gallery-arrow-next\.svg'/)
  assert.match(app, /className="gallery-prev"[\s\S]*iconSrc=\{galleryArrowPrev\}/)
  assert.match(app, /className="gallery-next"[\s\S]*iconSrc=\{galleryArrowNext\}/)
})

test('gallery next arrow moves beside the stage on 4k viewports', () => {
  assert.match(
    css,
    /@media \(min-width: 2200px\) \{[\s\S]*?\.gallery-next \{[\s\S]*?left: calc\(100% \+ 20px\);[\s\S]*?right: auto;[\s\S]*?\}/,
  )
})

test('gallery hides the arrows in the mobile/tablet range (swipe-only)', () => {
  // At <=1100px the natural-flow mobile treatment applies; the carousel is
  // swipe-driven and the prev/next arrows are hidden.
  assert.match(
    css,
    /@media \(max-width: 1100px\) \{[\s\S]*?\.gallery-fade,\n {2}\.gallery-fade--left,\n {2}\.gallery-prev,\n {2}\.gallery-next \{[\s\S]*?display: none;[\s\S]*?\}/,
  )
})

test('mobile gallery clips at the viewport wrapper, not the moving track', () => {
  assert.match(
    css,
    /@media \(max-width: 1100px\) \{[\s\S]*?\.gallery-wrap \{[\s\S]*?overflow: hidden;[\s\S]*?\}[\s\S]*?\.gallery-track \{[\s\S]*?overflow: visible;[\s\S]*?width: max-content;[\s\S]*?\}/,
  )
  assert.doesNotMatch(
    css,
    /@media \(max-width: 1100px\) \{[\s\S]*?\.gallery-track \{[\s\S]*?overflow: hidden;[\s\S]*?width: 592px;[\s\S]*?\}/,
  )
})
