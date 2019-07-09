import { iOS, isWxBrowser } from './util'

// game sound effect controll
class SoundControl {
    constructor () {
        this.audios = Object.create(null)
        this.audios.eats = document.querySelector('#eats')
        this.audios.turn = document.querySelector('#turn')
        this.audios.dead = document.querySelector('#dead')

        if (isWxBrowser && iOS) {
            this.wxjsb = null
            this.initWxBrowserEvent()
        }
    }

    initWxBrowserEvent () {
        document.addEventListener('WeixinJSBridgeReady', () => {
            this.wxjsb = window.WeixinJSBridge
        })
    }

    play (type) {
        const audio = this.audios[type]
        if (!audio) {
            return
        }

        if (this.wxjsb && type !== 'dead') {
            try {
                this.wxjsb.invoke('getNetworkType', {}, () => {
                    audio.play()
                })
            } catch (e) {
                audio.play()
            }
        } else {
            audio.play()
        }
    }
}

const soundControl = new SoundControl()

export default soundControl
