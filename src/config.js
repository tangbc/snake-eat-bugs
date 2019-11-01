import { isMobile } from './util'

const UNIT = isMobile ? 16 : 20
const BORDER = UNIT / (isMobile ? 2 : 1)

const screenWidth = window.screen.width
// const screenHeight = screen.height
const mobileXNumbers = Math.floor(screenWidth / UNIT) - 1
const mobileYNumbers = mobileXNumbers

const WIDTH = (isMobile ? mobileXNumbers : 33) * UNIT
const HEIGHT = (isMobile ? mobileYNumbers : 20) * UNIT

// App base config
export default {
  // per grub piex
  UNIT,

  // playground width
  WIDTH,

  // playground height
  HEIGHT,

  // wraper and header borderwidth
  BORDER,

  // per bug could achive scores
  SCORE: 1,

  // init snake length, except head
  LENGTH: 1,

  // move speed
  SPEED: 178,

  // how many records remain, at least 2
  RECORDS: isMobile ? 4 : 5
}
