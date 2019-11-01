const ua = navigator.userAgent
const Android = !!ua.match(/Android/i)
export const iOS = !!ua.match(/iPhone|iPad|iPod/i)
export const isMobile = Android || iOS

export const isWxBrowser = !!ua.match(/MicroMessenger/i)

// avoid going back direct
export const isGoback = (nowDirect, toDirect) => {
  if (
    (toDirect === 'UP' && nowDirect === 'DOWN') ||
    (toDirect === 'DOWN' && nowDirect === 'UP') ||
    (toDirect === 'LEFT' && nowDirect === 'RIGHT') ||
    (toDirect === 'RIGHT' && nowDirect === 'LEFT')
  ) {
    return true
  }

  return false
}

// keep a single number with 0
export const keepDouble = (num) => (num > 9 ? '' : '0') + num

// create an array of shuffled values, from lodash
export const shuffle = (array) => {
  let index = -1
  const length = array.length
  const lastIndex = length - 1

  const result = array.slice(0)
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]

    result[rand] = result[index]
    result[index] = value
  }

  return result
}

const STORE_KEY = isMobile ? 'RECORDS_MOBILE' : 'RECORDS'
export const RecordStorage = {
  set (records) {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(records))
  },

  get () {
    return JSON.parse(window.localStorage.getItem(STORE_KEY)) || []
  }
}

export const getAnimationEndName = () => {
  const div = document.createElement('div')
  return typeof div.style.animation !== 'undefined' ? 'animationend' : 'webkitAnimationEnd'
}

/**
 * from https://github.com/component/tap-event
 * Make your touchstart event listeners into a tap event listener!
 * What is "correct" behavior? The tap event:
 * shouldn't be triggered until the user removes his/her finger from the surface of the screen.
 * shouldn't be triggered when the user moves his/her finger at all (ie it should not interfere with drag events).
 * shouldn't be triggered if there's ever more than a single finger on the surface at all.
 * should never trigger the click event.
 * */
export const Tap = (callback, options) => {
  const endEvents = [
    'touchend'
  ]
  const cancelEvents = [
    'touchmove',
    'touchcancel',
    'touchstart'
  ]

  options = options || {}

  // el.addEventListener('touchstart', listener)
  function listener (e1) {
    // tap should only happen with a single finger
    if (!e1.touches || e1.touches.length > 1) {
      return
    }

    const el = this
    const args = arguments

    const timeoutId = setTimeout(cleanup, timeout)

    cancelEvents.forEach((event) => {
      document.addEventListener(event, cleanup)
    })

    endEvents.forEach((event) => {
      document.addEventListener(event, done)
    })

    function done (e2) {
      // since touchstart is added on the same tick
      // and because of bubbling,
      // it'll execute this on the same touchstart.
      // this filters out the same touchstart event.
      if (e1 === e2) {
        return
      }

      cleanup()

      // already handled
      if (e2.defaultPrevented) {
        return
      }

      // overwrite these functions so that they all to both start and events.
      const preventDefault = e1.preventDefault
      const stopPropagation = e1.stopPropagation

      e2.stopPropagation = () => {
        stopPropagation.call(e1)
        stopPropagation.call(e2)
      }

      e2.preventDefault = () => {
        preventDefault.call(e1)
        preventDefault.call(e2)
      }

      // calls the handler with the `end` event,
      // but i don't think it matters.
      args[0] = e2
      callback.apply(el, args)
    }

    // cleanup end events
    // to cancel the tap, just run this early
    function cleanup (e2) {
      // if it's the same event as the origin,
      // then don't actually cleanup.
      // hit issues with this - don't remember
      if (e1 === e2) {
        return
      }

      clearTimeout(timeoutId)

      cancelEvents.forEach((event) => {
        document.removeEventListener(event, cleanup)
      })

      endEvents.forEach((event) => {
        document.removeEventListener(event, done)
      })
    }
  }

  // if the user holds his/her finger down for more than 200ms,
  // then it's not really considered a tap.
  // however, you can make this configurable.
  const timeout = options.timeout || 200

  // to keep track of the original listener
  listener.handler = callback

  return listener
}
