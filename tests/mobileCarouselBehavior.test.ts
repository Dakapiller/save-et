import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const app = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8')

test('mobile-hidden carousel arrows have drag and trackpad observers on both carousel surfaces', () => {
  assert.match(app, /const peopleViewport = shell\.querySelector\('\.people-viewport'\)/)
  assert.match(app, /const galleryViewport = shell\.querySelector\('\.gallery-wrap'\)/)

  assert.match(app, /target: peopleViewport/)
  assert.match(app, /target: galleryViewport/)
  assert.equal(app.match(/type: 'touch,pointer,wheel'/g)?.length, 2)
  assert.equal(app.match(/wheelSpeed: -1/g)?.length, 2)

  assert.match(app, /onChange: \(self\) => handleCarouselGesture\(self, rotatePeople\)/)
  assert.match(app, /onChange: \(self\) => handleCarouselGesture\(self, rotateGallery\)/)

  assert.match(app, /peopleObserver\?\.kill\(\)/)
  assert.match(app, /galleryObserver\?\.kill\(\)/)
})

test('mobile carousel swipes use accumulated dominant movement instead of first-frame axis lock', () => {
  assert.match(app, /const handleCarouselGesture = \(self: Observer, rotate: CarouselRotate\) => \{/)
  assert.match(app, /Math\.abs\(self\.deltaX\) <= Math\.abs\(self\.deltaY\)/)
  assert.match(app, /onChange: \(self\) => handleCarouselGesture\(self, rotatePeople\)/)
  assert.match(app, /onChange: \(self\) => handleCarouselGesture\(self, rotateGallery\)/)
  assert.doesNotMatch(app, /lockAxis: true/)
})
