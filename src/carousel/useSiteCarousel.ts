import { useCallback, useEffect, useMemo } from 'react'
import Accessibility from 'embla-carousel-accessibility'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import WheelGestures from 'embla-carousel-wheel-gestures'

export type SiteCarouselLabels = {
  carousel: string
  next: string
  previous: string
  slide: (firstSlideIndex: number, lastSlideIndex: number, totalSlides: number) => string
}

type UseSiteCarouselOptions = {
  delay: number
  labels: SiteCarouselLabels
  nextSelector: string
  previousSelector: string
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const wrapperRoot = (viewport: HTMLElement) => viewport.parentElement

export function useSiteCarousel({
  delay,
  labels,
  nextSelector,
  previousSelector,
}: UseSiteCarouselOptions) {
  const options = useMemo(
    () => ({
      axis: 'x' as const,
      align: 'start' as const,
      loop: true,
      slidesToScroll: 1,
      dragFree: false,
      draggable: true,
      dragThreshold: 10,
      skipSnaps: false,
      duration: 25,
      focus: true,
      resize: true,
      slideChanges: true,
      breakpoints: {
        [reducedMotionQuery]: { duration: 0 },
      },
    }),
    [],
  )

  const plugins = useMemo(
    () => [
      Accessibility({
        announceChanges: false,
        carouselAriaLabel: labels.carousel,
        previousButtonAriaLabel: labels.previous,
        nextButtonAriaLabel: labels.next,
        slideAriaLabel: (_grouped, firstSlideIndex, lastSlideIndex, totalSlides) =>
          labels.slide(firstSlideIndex, lastSlideIndex, totalSlides),
        rootNode: wrapperRoot,
      }),
      Autoplay({
        delay,
        active: true,
        instant: false,
        defaultInteraction: true,
        stopOnLastSnap: false,
        rootNode: wrapperRoot,
        breakpoints: {
          [reducedMotionQuery]: { active: false },
        },
      }),
      WheelGestures({ forceWheelAxis: 'x' }),
    ],
    [delay, labels],
  )

  const [viewportRef, emblaApi] = useEmblaCarousel(options, plugins)

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    const { accessibility, autoplay } = emblaApi.plugins()
    accessibility?.setupPrevAndNextButtons(previousSelector, nextSelector)

    if (!window.matchMedia(reducedMotionQuery).matches) {
      autoplay?.play()
    }
  }, [emblaApi, labels, nextSelector, previousSelector])

  const stopAutoplay = useCallback(() => emblaApi?.plugins().autoplay?.stop(), [emblaApi])

  const goToPrevious = useCallback(() => {
    stopAutoplay()
    emblaApi?.goToPrev()
  }, [emblaApi, stopAutoplay])

  const goToNext = useCallback(() => {
    stopAutoplay()
    emblaApi?.goToNext()
  }, [emblaApi, stopAutoplay])

  return { viewportRef, goToPrevious, goToNext }
}
