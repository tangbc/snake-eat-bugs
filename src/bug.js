import { shuffle, isMobile } from './util'

const isTrappedArea = (area, array) => {
  const [p1, p2] = Object.values(area)
  return array.indexOf(p1) > -1 && array.indexOf(p2) > -1
}

export default class Bug {
  constructor (rows, lines) {
    this.x = 0
    this.y = 0
    this.rows = rows
    this.lines = lines
    this.leftovers = []
    this.availables = []
    this.initAvailables()
  }

  // init available zone
  initAvailables () {
    const minX = 1
    const minY = 1
    const dXValue = isMobile ? 4 : 2
    const dYValue = isMobile ? 3 : 2
    const maxX = this.rows - dXValue
    const maxY = this.lines - dYValue

    const availables = []
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        availables.push(`${x},${y}`)
      }
    }

    this.availables = shuffle(availables)
  }

  // return a available bug position with x and y
  // they shoudn't be included in preserve snake zone
  create (snakeZone) {
    const pos = this.getNext(snakeZone)

    if (!pos) {
      return null
    }

    this.x = pos.x
    this.y = pos.y
    this.remove(pos.x, pos.y)

    return {
      x: pos.x,
      y: pos.y,
      eaten: false
    }
  }

  // get next avaliable bug position
  getNext (snakeZone) {
    let xy = ''
    let valid = false
    // get from the rest of availables
    for (let i = 0; i < this.availables.length; i++) {
      xy = this.availables[i]
      if (snakeZone.indexOf(xy) === -1) {
        valid = true
        break
      }
    }

    if (valid && xy) {
      let [x, y] = xy.split(',')

      x = +x
      y = +y

      const isTrapped = this.isTrapped(x, y)
      // if will cause trapped, remove it and return a new one
      if (isTrapped) {
        this.remove(x, y)
        return this.getNext(snakeZone)
      } else {
        return { x, y }
      }
    }

    // if return null, it means available position is use up!
    return null
  }

  // judge is x y will cause trapped, otherwise snake absolutely die
  // all conditions see: https://tangbc.github.io/re-assets/snake-avoid-trapped.png
  isTrapped (x, y) {
    const A = {
      A2: `${x + 1},${y + 1}`,
      A3: `${x},${y + 2}`
    }
    const B = {
      B1: `${x - 1},${y - 1}`,
      B3: `${x - 1},${y + 1}`
    }
    const C = {
      C1: `${x},${y - 2}`,
      C2: `${x + 1},${y - 1}`
    }
    const D = {
      D2: `${x - 1},${y + 1}`,
      D3: `${x},${y + 2}`
    }
    const E = {
      E1: `${x + 1},${y - 1}`,
      E3: `${x + 1},${y + 1}`
    }
    const F = {
      F1: `${x},${y - 2}`,
      F2: `${x - 1},${y - 1}`
    }
    const G = {
      G2: `${x + 1},${y - 1}`,
      G3: `${x + 2},${y}`
    }
    const H = {
      H1: `${x - 1},${y + 1}`,
      H3: `${x + 1},${y + 1}`
    }
    const I = {
      I1: `${x - 2},${y}`,
      I2: `${x - 1},${y - 1}`
    }
    const J = {
      J2: `${x + 1},${y + 1}`,
      J3: `${x + 2},${y}`
    }
    const K = {
      K1: `${x - 1},${y - 1}`,
      K3: `${x + 1},${y - 1}`
    }
    const L = {
      L1: `${x - 2},${y}`,
      L2: `${x - 1},${y + 1}`
    }

    if (
      isTrappedArea(A, this.leftovers) ||
      isTrappedArea(B, this.leftovers) ||
      isTrappedArea(C, this.leftovers) ||
      isTrappedArea(D, this.leftovers) ||
      isTrappedArea(E, this.leftovers) ||
      isTrappedArea(F, this.leftovers) ||
      isTrappedArea(G, this.leftovers) ||
      isTrappedArea(H, this.leftovers) ||
      isTrappedArea(I, this.leftovers) ||
      isTrappedArea(J, this.leftovers) ||
      isTrappedArea(K, this.leftovers) ||
      isTrappedArea(L, this.leftovers)
    ) {
      return true
    } else {
      return false
    }
  }

  // remove a position from availables
  remove (x, y) {
    const index = this.availables.indexOf(`${x},${y}`)
    if (index !== -1) {
      this.availables.splice(index, 1)
    }
  }

  // check if giving position has a fresh/lelfover bug
  // 0 indicate fresh bug, 1 is leftover, otherwise nothing
  check (x, y) {
    if (this.x === x && this.y === y) {
      return 0
    } else if (this.leftovers.indexOf(`${x},${y}`) > -1) {
      return 1
    }
  }

  // add a eaten bug, helping to check if snake eat again
  // and remove this position from available zone
  addEaten (x, y) {
    this.leftovers.push(`${x},${y}`)
  }

  // reset data for next restart
  reset () {
    this.x = 0
    this.y = 0
    this.leftovers = []
    this.initAvailables()
  }
}
