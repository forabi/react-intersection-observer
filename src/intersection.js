// @flow
type Callback = (inView: boolean) => void

type Instance = {
  callback: Callback,
  visible: boolean,
  options: IntersectionObserverOptions,
  observerId: ?string,
  observer: ?IntersectionObserver,
}

const INSTANCE_MAP: Map<HTMLElement, Instance> = new Map()
const OBSERVER_MAP: Map<?string, IntersectionObserver> = new Map()

/**
 * Monitor element, and trigger callback when element becomes visible
 * @param element {HTMLElement}
 * @param callback {Function} Called with inView
 * @param options {Object} InterSection observer options
 * @param options.threshold {Number} Number between 0 and 1, indicating how much of the element should be visible before triggering
 * @param options.root {HTMLElement} It should have a unique id or data-intersection-id in order for the Observer to reused.
 * @param options.rootMargin {String} The CSS margin to apply to the root element.
 * @param rootId {String} Unique identifier for the root element, to enable reusing the IntersectionObserver
 */
export function observe(
  element: HTMLElement,
  callback: Callback,
  options: IntersectionObserverOptions = {
    threshold: 0,
  },
  rootId?: string,
) {
  const { root, rootMargin } = options
  const threshold = options.threshold || 0
  if (!element || !callback) return
  let observerId = rootMargin
    ? `${threshold.toString()}_${rootMargin}`
    : `${threshold.toString()}`

  if (root) {
    observerId = rootId ? `${rootId}_${observerId}` : null
  }

  let observerInstance = observerId ? OBSERVER_MAP.get(observerId) : null
  if (!observerInstance) {
    observerInstance = new IntersectionObserver(onChange, options)
    if (observerId) OBSERVER_MAP.set(observerId, observerInstance)
  }

  const instance: Instance = {
    callback,
    visible: false,
    options,
    observerId,
    observer: !observerId ? observerInstance : undefined,
  }

  INSTANCE_MAP.set(element, instance)

  observerInstance.observe(element)

  return instance
}

/**
 * Stop observing an element. If an element is removed from the DOM or otherwise destroyed,
 * make sure to call this method.
 * @param element {HTMLElement}
 */
export function unobserve(element: ?HTMLElement) {
  if (!element) return
  const instance = INSTANCE_MAP.get(element)

  if (instance) {
    const { observerId, observer } = instance
    const observerInstance = observerId
      ? OBSERVER_MAP.get(observerId)
      : observer

    if (observerInstance) {
      // $FlowFixMe - the interface in bom.js is wrong. Spec should accept the element.
      observerInstance.unobserve(element)
    }

    // Check if we are stilling observing any elements with the same threshold.
    let itemsLeft = false
    if (observerId) {
      INSTANCE_MAP.forEach((item, key) => {
        if (item && item.observerId === observerId && key !== element) {
          itemsLeft = true
        }
      })
    }

    if (observerInstance && !itemsLeft) {
      // No more elements to observe for threshold, disconnect observer
      observerInstance.disconnect()
      OBSERVER_MAP.delete(observerId)
    }

    // Remove reference to element
    INSTANCE_MAP.delete(element)
  }
}

/**
 * Destroy all IntersectionObservers currently connected
 **/
export function destroy() {
  OBSERVER_MAP.forEach(observer => {
    observer.disconnect()
  })

  OBSERVER_MAP.clear()
  INSTANCE_MAP.clear()
}

function onChange(changes) {
  changes.forEach(intersection => {
    const { isIntersecting, intersectionRatio, target } = intersection
    const instance = INSTANCE_MAP.get(target)
    if (instance) {
      const options = instance.options

      let inView = false

      if (Array.isArray(options.threshold)) {
        // If threshold is an array, check if any of them intersects. This just triggers the onChange event multiple times.
        inView = options.threshold.some(threshold => {
          return instance.visible
            ? intersectionRatio > threshold
            : intersectionRatio >= threshold
        })
      } else if (options.threshold !== undefined) {
        // Trigger on 0 ratio only when not visible. This is fallback for browsers without isIntersecting support
        inView = instance.visible
          ? intersectionRatio > options.threshold
          : intersectionRatio >= options.threshold
      }

      if (isIntersecting !== undefined) {
        // If isIntersecting is defined, ensure that the element is actually intersecting.
        // Otherwise it reports a threshold of 0
        inView = inView && isIntersecting
      }

      // Update the visible value on the instance
      instance.visible = inView

      if (instance.callback) {
        instance.callback(inView)
      }
    }
  })
}

export default {
  observe,
  unobserve,
  destroy,
}
