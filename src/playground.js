import Bug from './bug'
import Config from './config'
import soundControl from './sound'
import { isMobile, getAnimationEndName, Tap, isGoback } from './util'

export const DEFAULTDIRECT = 'LEFT'

// base const definition
const UNIT = Config.UNIT
const WIDTH = Config.WIDTH
const HEIGHT = Config.HEIGHT
const LENGTH = Config.LENGTH
const TYPE = { head: 'head', body: 'body', dead: 'dead' }
// number of rows and lines
const ROWS = Math.floor(WIDTH / UNIT)
const LINES = Math.floor(HEIGHT / UNIT)
// calculate the middle grid of snake head which x/y to start
const START_Y = Math.floor(LINES / 2) - 1
const START_X = Math.floor((ROWS - LENGTH) / 2)
// edge of x and y
const EDGE_X = ROWS - 1
const EDGE_Y = LINES - 1

// create a grid line position cssText
const createGridLineStyle = (top, left) => ([
    `top: ${top}px; left: ${left}px;`,
    (top ? 'border-top: 1px dashed;' : 'bottom: 0px;'),
    (left ? 'border-left: 1px dashed;' : 'right: 0px;'),
    'padding: 0; margin: 0; position: absolute; overflow: hidden;'
].join(''))

// create a snake grub body item
const createGrub = (x, y, type) => ({
  x,
  y,
  type,
  life: '',
  direct: ''
})

// AppPlayground component definition
const Sugar = window.Sugar
const Playground = Sugar.Component.extend({
  init (config) {
    // create init snake, put they on the middle of playground
    const initSnakes = [createGrub(START_X, START_Y, TYPE.head)]
    for (let i = 1; i < LENGTH + 1; i++) {
      initSnakes.push(createGrub(START_X + i, START_Y, TYPE.body))
    }

    this.Super('init', config, {
      class: 'playground',
      css: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        'border-width': `${Config.BORDER}px`
      },
      template: './template/playground.html',
      model: {
        isMobile,
        isPause: false, // is pasue status
        gridLines: '', // grid line innerHTML
        running: false, // if snake running or over
        showResult: false, // show result when game over
        unit: UNIT, // per step progress piex
        scale: `${UNIT}px`, // per grub scale
        bgsize: `${UNIT}px ${UNIT}px`, // just for snake head bg
        snakes: initSnakes,
        bugs: []
      },
      methods: {
        cancelPause () {
          this.pause()
        }
      }
    })
  },

  afterRender () {
    this.initState()
    this.buildGrid()

    // bug producer
    this.bug = new Bug(ROWS, LINES)
    this.addBug()

    if (isMobile) {
      this.initMobileEvent()
    }
  },

  // notify parent component we touch on mobile side
  initMobileEvent () {
    this.el.addEventListener('touchstart', Tap(() => {
      this.fire('onMobilePlaygroundTouch')
    }))

    // fire game over msg after animationend
    this.query('#over').addEventListener(getAnimationEndName(), () => {
      this.fire('onGameOver')
    })
  },

  initState () {
    // is there has any uneaten bugs
    this.rest = false
    this.timer = null

    // head x and y
    this.x = START_X
    this.y = START_Y

    // if game is over or not start yet
    this.over = false
    // default direction
    this.direct = DEFAULTDIRECT
  },

  // build grid for rectify
  buildGrid () {
    let i
    let gridLines = ''

    // build rows
    for (i = 0; i <= EDGE_X; i++) {
      gridLines += `<div class="line" style="${createGridLineStyle(0, UNIT * i)}"></div>`
    }

    // build lines
    for (i = 0; i <= EDGE_Y; i++) {
      gridLines += `<div class="line" style="${createGridLineStyle(UNIT * i, 0)}"></div>`
    }

    this.vm.$els.grid.innerHTML = gridLines
  },

  // start game
  start () {
    this.vm.$data.running = true
    this.timer = window.setTimeout(() => {
      // change snake direct
      switch (this.direct) {
        case 'UP':
          this.turnUp()
          break
        case 'DOWN':
          this.turnDown()
          break
        case 'LEFT':
          this.turnLeft()
          break
        case 'RIGHT':
          this.turnRight()
          break
        default: return
      }

      if (this.over) {
        return
      }

      this.moveBody() // move snake body first
        .moveHead() // then move snake head
        .check() // check if snake is alive
        .start()
    }, Config.SPEED)
  },

  turnUp () {
    if (this.y > 0) {
      this.y--
    } else {
      this.gameOver()
    }
  },

  turnDown () {
    if (this.y < EDGE_Y) {
      this.y++
    } else {
      this.gameOver()
    }
  },

  turnLeft () {
    if (this.x > 0) {
      this.x--
    } else {
      this.gameOver()
    }
  },

  turnRight: function () {
    if (this.x < EDGE_X) {
      this.x++
    } else {
      this.gameOver()
    }
  },

  // move snake head
  moveHead () {
    const snakes = this.vm.$data.snakes
    snakes[0].x = this.x
    snakes[0].y = this.y
    snakes[0].direct = this.direct
    return this
  },

  // move snake body, front grub position pass to behind grub
  moveBody () {
    const snakes = this.vm.$data.snakes
    for (let i = snakes.length - 1; i > 0; i--) {
      snakes[i].x = snakes[i - 1].x
      snakes[i].y = snakes[i - 1].y
      // snakes[i].direct = snakes[i - 1].direct
    }
    return this
  },

  // check if snake is alive
  check () {
    this.checkEatSelf()
    this.checkEatLeftover()
    return this
  },

  // check if sanke eat itself
  checkEatSelf () {
    const snakes = this.vm.$data.snakes

    for (let i = 1; i < snakes.length; i++) {
      if (this.x === snakes[i].x && this.y === snakes[i].y) {
        this.gameOver()
      }
    }
  },

  // check if snake eat a leftover
  checkEatLeftover () {
    const res = this.bug.check(this.x, this.y)

    if (res === 0) {
      this.eatBug().addBug()
    } else if (res === 1) {
      this.gameOver()
    }
  },

  // eat a fresh bug
  eatBug () {
    this.addGrub()
    this.rest = false
    this.vm.$data.bugs[0].eaten = true
    this.bug.addEaten(this.x, this.y)
    // notify parent component
    this.fire('onEatBug')
    soundControl.play('eats')
    return this
  },

  // add a grub to snake body
  addGrub () {
    const data = this.vm.$data
    const snakes = data.snakes
    const last = snakes.length - 1
    snakes.push(createGrub(snakes[last].x, snakes[last].y, TYPE.body))
  },

  // add a new/fresh bug to playground
  addBug (debug) {
    if (this.rest && !debug) {
      return
    }

    const data = this.vm.$data
    const snakeZone = this.getSnakeZone(data.snakes)
    const newBug = this.bug.create(snakeZone)

    if (newBug) {
      this.rest = true
      data.bugs.unshift(newBug)
    } else {
      if (!this.noAvailablePlace) {
        this.noAvailablePlace = true
        window.alert('👍👍👍 No available bug already!')
      }
    }
  },

  // get snake current zone array
  getSnakeZone (snakes) {
    var zone = []
    Sugar.util.each(snakes, function (snake) {
      zone.push(`${snake.x},${snake.y}`)
    })
    return zone
  },

  // snake dead, game over
  gameOver () {
    const data = this.vm.$data
    this.pause(true)
    this.over = true

    const delayTime = 50
    let lastDelayTime = 0
    Sugar.util.each(data.snakes, (snake, index) => {
      lastDelayTime = delayTime * index

      setTimeout(() => {
        snake.life = TYPE.dead
      }, lastDelayTime)
    })

    soundControl.play('dead')

    setTimeout(() => {
      data.showResult = true
    }, lastDelayTime + delayTime * 5)

    if (!isMobile) {
      this.fire('onGameOver')
    }
  },

  // pause game
  pause (force) {
    const data = this.vm.$data
    if (this.timer || force) {
      window.clearTimeout(this.timer)
      this.timer = null

      if (!force) {
        data.isPause = true
      }
    } else if (!this.over) {
      this.start()
      data.isPause = false
    }
  },

  // update direction according to pressing key
  update (key) {
    if (isGoback(this.direct, key) || this.vm.$data.isPause) {
      return
    }

    if (this.direct !== key) {
      soundControl.play('turn')
    }

    this.direct = key
  },

  // reset state, be ready to restart
  reset () {
    this.pause(true)
    this.initState()
    this.vm.reset()
    this.bug.reset()
    this.addBug()
  }
})

export default Playground
