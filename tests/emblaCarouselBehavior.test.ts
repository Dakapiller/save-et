import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const root = process.cwd()
const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8')
const css = readFileSync(join(root, 'src', 'App.css'), 'utf8')
const gsapSetup = readFileSync(join(root, 'src', 'motion', 'gsap.ts'), 'utf8')
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>
}
const hookPath = join(root, 'src', 'carousel', 'useSiteCarousel.ts')

test('Embla v9 release candidates are pinned exactly', () => {
  assert.deepEqual(
    {
      'embla-carousel': packageJson.dependencies?.['embla-carousel'],
      'embla-carousel-accessibility': packageJson.dependencies?.['embla-carousel-accessibility'],
      'embla-carousel-autoplay': packageJson.dependencies?.['embla-carousel-autoplay'],
      'embla-carousel-react': packageJson.dependencies?.['embla-carousel-react'],
      'embla-carousel-wheel-gestures': packageJson.dependencies?.['embla-carousel-wheel-gestures'],
    },
    {
      'embla-carousel': '9.0.0-rc02',
      'embla-carousel-accessibility': '9.0.0-rc02',
      'embla-carousel-autoplay': '9.0.0-rc02',
      'embla-carousel-react': '9.0.0-rc02',
      'embla-carousel-wheel-gestures': '9.0.0-rc01',
    },
  )
})

test('shared carousel hook configures loop, autoplay, accessibility, wheel gestures, and reduced motion', () => {
  assert.ok(existsSync(hookPath), 'Missing src/carousel/useSiteCarousel.ts')
  const hook = readFileSync(hookPath, 'utf8')

  assert.match(hook, /useEmblaCarousel/)
  assert.match(hook, /loop: true/)
  assert.match(hook, /align: 'start'/)
  assert.match(hook, /slidesToScroll: 1/)
  assert.match(hook, /dragFree: false/)
  assert.match(hook, /dragThreshold: 10/)
  assert.match(hook, /duration: 25/)
  assert.match(hook, /\[reducedMotionQuery\]: \{ duration: 0 \}/)
  assert.match(hook, /Autoplay\(\{/)
  assert.match(hook, /defaultInteraction: true/)
  assert.match(hook, /stopOnLastSnap: false/)
  assert.match(hook, /\[reducedMotionQuery\]: \{ active: false \}/)
  assert.match(hook, /Accessibility\(\{/)
  assert.match(hook, /announceChanges: false/)
  assert.match(hook, /WheelGestures\(\{ forceWheelAxis: 'x' \}\)/)
  assert.match(hook, /setupPrevAndNextButtons/)
  assert.match(hook, /autoplay\?\.play\(\)/)
  assert.match(hook, /\[emblaApi, labels, nextSelector, previousSelector\]/)
})

test('both carousels use Embla viewports with distinct autoplay delays and no manual index movement', () => {
  assert.match(app, /useSiteCarousel\(\{[\s\S]*?delay: 7000/)
  assert.match(app, /useSiteCarousel\(\{[\s\S]*?delay: 4500/)
  assert.match(app, /className="people-carousel"/)
  assert.match(app, /className="people-viewport" ref=\{peopleViewportRef\}/)
  assert.match(app, /className="people-slide"/)
  assert.match(app, /className="gallery-viewport" ref=\{galleryViewportRef\}/)
  assert.match(app, /className="gallery-slide"/)
  assert.doesNotMatch(app, /peopleIndex|galleryIndex/)
  assert.doesNotMatch(app, /rotatePeople|rotateGallery/)
  assert.doesNotMatch(app, /galleryTrackImages/)
  assert.doesNotMatch(app, /Observer\.create/)
})

test('Embla owns carousel transforms while GSAP keeps only inner reveal animation', () => {
  assert.match(css, /\.people-carousel \{/)
  assert.match(css, /\.people-slide \{/)
  assert.match(css, /\.gallery-viewport \{/)
  assert.match(css, /\.gallery-slide \{/)
  assert.doesNotMatch(gsapSetup, /gsap\/Observer/)
  assert.doesNotMatch(gsapSetup, /\bObserver\b/)
  assert.doesNotMatch(app, /x: -peopleIndex|x: -offsetOf\(\)/)
  assert.match(app, /gsap\.from\('\.gallery-slide img'/)
})
