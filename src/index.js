import App from './app'
import { isMobile, getAnimationEndName } from './util'

const createApp = () => {
    window.app = window.Sugar.core.create('app', App)
}

const gameNameEl = document.querySelector('#game-name')
gameNameEl.classList.add('bounceInDown')
gameNameEl.style.visibility = 'visible'

if (isMobile) {
    gameNameEl.addEventListener(getAnimationEndName(), () => {
        setTimeout(() => {
            gameNameEl.parentNode.removeChild(gameNameEl)
            createApp()
        }, 500)
    })

    window.addEventListener('orientationchange', () => {
        if (screen.orientation && screen.orientation.angle) {
            alert('Not support horizontal screen!')
        }
    })
} else {
    window.addEventListener('load', createApp)
}
