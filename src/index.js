import App from './app'
import { isMobile, getAnimationEndName } from './util'

const titleEl = document.querySelector('#game-name')

const showTitle = () => {
  titleEl.classList.add('bounceInDown')
  titleEl.style.visibility = 'visible'
}

const createApp = () => {
  window.app = window.Sugar.core.create('app', App)
}

if (isMobile) {
  showTitle()

  titleEl.addEventListener(getAnimationEndName(), () => {
    setTimeout(() => {
      titleEl.parentNode.removeChild(titleEl)
      createApp()
    }, 500)
  })

  window.addEventListener('orientationchange', () => {
    if (window.screen.orientation && window.screen.orientation.angle) {
      window.alert('Not support horizontal screen!')
    }
  })
} else {
  window.addEventListener('load', () => {
    showTitle()
    createApp()
  })
}
