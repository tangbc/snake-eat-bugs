import Config from './config'
import { isGoback } from './util'
import { DEFAULTDIRECT } from './playground'

// AppHeader component definition
const Sugar = window.Sugar
const Wheel = Sugar.Component.extend({
  init (config) {
    this.Super('init', config, {
      class: 'wheel',
      css: {
        width: `${Config.WIDTH}px`
      },
      template: './template/wheel.html',
      model: {
        init: true,
        direct: ''
      }
    })
  },

  switchDirect (direct) {
    const data = this.vm.$data

    if (!this.isBegin || isGoback(data.direct, direct)) {
      return
    }

    if (data.direct !== direct) {
      data.direct = direct
      this.fire('onUpdateDirectFromWheel', direct)
    }
  },

  afterRender () {
    this.moveX = 0
    this.moveY = 0
    this.isOver = false
    this.isBegin = false

    setTimeout(() => {
      this.updatePosition()
    }, 100)

    this.el.addEventListener('touchstart', this.eventTouchstart.bind(this))
    this.el.addEventListener('touchmove', this.eventTouchmove.bind(this))
    this.el.addEventListener('touchend', this.eventTouchend.bind(this))
    this.el.addEventListener('touchcancel', this.eventTouchcancel.bind(this))
  },

  updatePosition () {
    const rect = this.el.parentNode.getBoundingClientRect()
    this.el.style.top = rect.bottom + 10 + 'px'
  },

  eventTouchstart (e) {
    if (!this.isBegin || this.isOver) {
      return
    }

    const { clientX, clientY } = e.touches[0]
    this.moveX = clientX
    this.moveY = clientY

    this.el.classList.add('press')
  },

  eventTouchmove (e) {
    e.preventDefault()

    if (!this.isBegin || this.isOver) {
      return
    }

    const { clientX, clientY } = e.touches[0]

    const moveX = Math.round(clientX)
    const moveY = Math.round(clientY)

    const dX = moveX - this.moveX
    const dY = moveY - this.moveY

    if (Math.abs(dX) > Math.abs(dY) && dX > 0) {
      this.switchDirect('RIGHT')
    } else if (Math.abs(dX) > Math.abs(dY) && dX < 0) {
      this.switchDirect('LEFT')
    } else if (Math.abs(dX) < Math.abs(dY) && dY > 0) {
      this.switchDirect('DOWN')
    } else if (Math.abs(dX) < Math.abs(dY) && dY < 0) {
      this.switchDirect('UP')
    } else {
    }
  },

  eventTouchend (e) {
    this.end()
  },

  eventTouchcancel (e) {
    this.end()
  },

  end () {
    this.moveX = 0
    this.moveY = 0
    this.el.classList.remove('press')
  },

  start () {
    this.isBegin = true

    const data = this.vm.$data
    data.init = false
    data.direct = DEFAULTDIRECT
  },

  over () {
    this.isOver = true
  },

  pause () {
    this.isBegin = !this.isBegin
  },

  reset () {
    this.moveX = 0
    this.moveY = 0
    this.isOver = false
    this.isBegin = false
    this.vm.$data.direct = ''
  }
})

export default Wheel
