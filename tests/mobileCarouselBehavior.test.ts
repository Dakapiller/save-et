import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const app = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8')
const hook = readFileSync(join(process.cwd(), 'src', 'carousel', 'useSiteCarousel.ts'), 'utf8')
const gsapSetup = readFileSync(join(process.cwd(), 'src', 'motion', 'gsap.ts'), 'utf8')

test('mobile-hidden carousel arrows are backed by Embla drag and wheel gestures', () => {
  assert.match(app, /className="people-viewport" ref=\{peopleViewportRef\}/)
  assert.match(app, /className="gallery-viewport" ref=\{galleryViewportRef\}/)
  assert.match(hook, /draggable: true/)
  assert.match(hook, /WheelGestures\(\{ forceWheelAxis: 'x' \}\)/)
  assert.doesNotMatch(app, /Observer\.create/)
  assert.doesNotMatch(gsapSetup, /gsap\/Observer/)
})

test('mobile carousel swipes preserve vertical page scrolling and snap one slide', () => {
  assert.match(hook, /slidesToScroll: 1/)
  assert.match(hook, /dragFree: false/)
  assert.match(hook, /skipSnaps: false/)
  assert.match(hook, /dragThreshold: 10/)
})
