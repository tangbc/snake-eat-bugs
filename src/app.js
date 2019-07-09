import Keymap from './keymap'
import Config from './config'
import Header from './header'
import Wheel from './wheel'
import Playground from './playground'
import { isMobile } from './util'

// App component definition
const Sugar = window.Sugar
const App = Sugar.Component.extend({
    init (config) {
        this.Super('init', config, {
            target: '#app',
            css: {
                width: Config.WIDTH + Config.UNIT + 'px'
            },
            model: {
                isMobile,
                loading: true
            },
            childs: {
                'app-header': Header,
                'app-playground': Playground
            }
        })
    },

    afterRender () {
        this.isOver = false
        this.isBegin = false
        this.vm.$data.loading = false
        this.on(document, 'keydown', this.documentKeyDown)

        if (isMobile) {
            this.create('app-wheel', Wheel, {
                target: this.query('.ready')
            })
        }
    },

    // listen to document keydown event
    documentKeyDown (e) {
        const key = Keymap[e.keyCode]
        const playground = this.getChild('app-playground')

        if (key === 'SPACE') {
            this.interrupt()
        } else if (key === 'ESC') {
            this.reset()
        } else if (this.isBegin && key) {
            playground.update(key)
        }
    },

    // game over message from app-playground
    onGameOver () {
        this.isOver = true
        this.getChild('app-header').end()
        if (isMobile) {
            this.getChild('app-wheel').over()
        }
    },

    // snake eat a bug, message from app-playground
    onEatBug () {
        this.getChild('app-header').addScore()
    },

    // app-playground touch event
    onMobilePlaygroundTouch () {
        if (this.isOver) {
            this.reset()
        } else {
            this.interrupt()
        }
    },

    // update direct from app-wheel on mobile side
    onUpdateDirectFromWheel (param) {
        const key = param && param.param
        if (this.isBegin && !this.isOver && key) {
            this.getChild('app-playground').update(key)
        }
    },

    // interrupt game, start or pause
    interrupt () {
        const header = this.getChild('app-header')
        const playground = this.getChild('app-playground')
        const wheel = this.getChild('app-wheel')

        // first press, just to start game
        if (!this.isBegin) {
            this.isBegin = true
            header.startTime()
            playground.start()
            if (isMobile && wheel) {
                wheel.start()
            }
        } else {
            header.pauseTime()
            playground.pause()
            if (isMobile && wheel) {
                wheel.pause()
            }
        }
    },

    reset () {
        this.isOver = false
        this.isBegin = false
        this.getChild('app-header').reset()
        this.getChild('app-playground').reset()

        if (isMobile) {
            this.getChild('app-wheel').reset()
        }
    }
})

export default App
