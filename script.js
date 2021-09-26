console.log(mobileCheck() ? '[mobile]' : '[non-mobile]')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const uiCheckbox = document.getElementById('uiCheckbox')
const debugCheckbox = document.getElementById('debugCheckbox')
const bioDiv = document.getElementById('bio')
const contactDiv = document.getElementById('contact')
const changeButton = document.getElementById('changeButton')
let gifs = []
let gifsArray = []
let currentAnimationIndex = 0
let frameCount = 0
let switchAnimationIntervalId

const SWITCH_ANIMATION_INTERVAL_TIME = 5000
const COLOR_PALLETE = [
  'rgba(209, 152, 176, 1)',
  'rgba(30, 66, 124, 1)',
  'rgba(240, 195, 108, 1)',
  'rgba(48, 82, 72, 1)',
  'rgba(126, 51, 56, 1)',
  'rgba(117, 200, 147, 1)',
  'rgba(224, 142, 108, 1)',
]

const RESOLUTION = 180
const GLOBAL_SCALE = 360 / RESOLUTION
const DEFAULT_SCALE = 0.5 * GLOBAL_SCALE
const DEFAULT_SPEED = [
  { 'Y': 1.0, 'A': 1/3, 'B': 1.5, 'O': 1.0, 'I': 0.5 },
  { 'H': 1.0, 'A': 1.0, 'N': 1.0, 'O': 1.0, 'I': 1.0 },
  { 'Y': 1.0, 'A': 1/3, 'B': 1.5, 'O': 1.0, 'I': 0.5 },
  { 'H': 0.5, 'A': 1.0, 'N': 1.0, 'O': 1.0, 'I': 1.0 },
]
const NUM_OF_LETTERS = 5
const NUM_LETTER_SET = 4
const GIF_PATH = './assets/gifs/'
const YABOI_HANOI = 'Yaboi_Hanoi'
const WORDS = 'Yaboi'
const LANGS = ['Eng', 'Thai']

function randomizeBodyBackgroundColor() {
  const index = Math.floor(Math.random() * 4)
  document.body.style.backgroundColor = COLOR_PALLETE[index]
}

function getAllFileNamesForEveryAnimations() {
  return LANGS.map(lang => {
    const fs = []
    YABOI_HANOI.split('_').forEach((word, index) => {
      fs[index] = []
      const chars = word.toUpperCase().split('')
      chars.forEach(ch => {
        fs[index][ch] = `${GIF_PATH}${word}_${lang}_${ch}_delay_0_${RESOLUTION}.gif`
      })
    })
    return fs
  })
}

function getAllFileNames() {
  const fs = {}
  const lang = LANGS[0] // 'Eng'
  WORDS.split('_').forEach(word => {
    const chars = word.toUpperCase().split('')
    chars.forEach(ch => {
      fs[ch] = `${GIF_PATH}${word}_${lang}_${ch}_delay_0_${RESOLUTION}.gif`
    })
  })
  return fs
}

function getPosition(i) {

  const ratio = canvas.width / 1300

  const midX = canvas.width * 0.5
  const midY = canvas.height * 0.5
  const cols = 5
  const rows = Math.ceil(NUM_OF_LETTERS / cols)

  const col = i % cols
  const row = Math.floor(i / cols)

  const x = midX + 250 * (col - (cols - 1) * 0.5) * Math.min(1, ratio)
  const y = midY + 250 * (row - (rows - 1) * 0.5)

  return [x, y]
}

function getLetterScale() {
  const ratio = canvas.width / 1300
  return DEFAULT_SCALE * Math.min(1, ratio)
}

function init() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const allGifFileNames = getAllFileNamesForEveryAnimations()
  gifsArray = allGifFileNames.flat().map((gifFileNames, animationIndex) => {
    return Object.keys(gifFileNames).map((key, i) => {
      const f = gifFileNames[key]
      const [x, y] = getPosition(i)
  
      return new LetterAnimation(ctx, f, x, y, { 
        speed: DEFAULT_SPEED[animationIndex][key] || null,
        scale: getLetterScale(),
        interactive: true,
        showUI: false,
        debug: false,
        hide: animationIndex !== 0,
      })
    })
  })

  gifs = gifsArray[currentAnimationIndex]

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    updateGifPositionAndScale()
  })
  uiCheckbox.addEventListener('change', e => {
    toggleButtons(e.target.checked)
  })

  debugCheckbox.addEventListener('change', e => {
    toggleDebug(e.target.checked)
  })

  changeButton.addEventListener('click', () => {
    switchAnimationSet()
  })

  switchAnimationIntervalId = setInterval(() => {
    switchAnimationSet()
  }, SWITCH_ANIMATION_INTERVAL_TIME)

}

async function switchAnimationSet() {
  for (let i = 0; i < NUM_OF_LETTERS; i++) {
    if (gifs[i].appearing || !gifs[i].complete()) return
  }

  await Promise.all(Array(NUM_OF_LETTERS).fill(null).map((_, i) => {
    return promiseTimeout(() => {
      gifs[i].disappear()
    }, 100 * i)
  }))

  currentAnimationIndex = (currentAnimationIndex + 1) % NUM_LETTER_SET
  gifs = gifsArray[currentAnimationIndex]
  updateGifPositionAndScale(true)

  await Promise.all(Array(NUM_OF_LETTERS).fill(null).map((_, i) => {
    return promiseTimeout(() => {
      gifs[i].appear()
    }, 100 * i)
  }))
}

function promiseTimeout(cb, time) {
  return new Promise(res => {
    setTimeout(() => {
      cb()
      res()
    }, time)
  })
}

function updateGifPositionAndScale(setOriginalScale = false) {
  gifs.forEach((gif, i) => {
    const [x, y] = getPosition(i)
    gif.updatePos(x, y)
    if (!setOriginalScale) {
      gif.scale = getLetterScale()
    } else {
      gif.originalScale = getLetterScale()
    }
  })
}

function draw(ctx) {
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.globalCompositeOperation = "source-over"

  const midX = canvas.width * 0.5
  const midY = canvas.height * 0.5
  const cols = 5
  const rows = Math.ceil(gifs.length / cols)

  gifs.forEach((gif, i) => {
    gif.draw()
  })

  gifsArray.forEach((otherGifs, i)=> {
    if (i === currentAnimationIndex) return
    otherGifs.forEach(g => g.update())
  })

  ctx.globalCompositeOperation = "source-in"
  
  ctx.fillStyle = 'rgba(255, 255, 255, 1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  frameCount += 1

  requestAnimationFrame(() => {
    draw(ctx)
  })
}

function toggleButtons(on = true) {
  gifs.forEach(g => {
    if (!on) g.removeUI()
    else g.attachUI()
  })
}

function toggleDebug(on = true) {
  gifs.forEach(g => {
    g.toggleDebug(on)
  })
}

function createGradient(ctx) {
  const colors = [
    ['#ff9966', '#ff5e62'],
    ['#00F260', '#0575E6'],
    ['#e1eec3', '#f05053']
  ]
  const id = 1

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0.3, colors[id][0])
  gradient.addColorStop(0.7, colors[id][1])
  
  return gradient
}

function addNavEvents() {
  const navButtons = document.getElementById('navbar').children
  for (let i = 0; i < 3; i++) {
    navButtons[i].addEventListener('click', () => {
      canvas.style.display = 'none'
      bioDiv.style.display = 'none'
      contactDiv.style.display = 'none'

      if (i === 0) {
        canvas.style.display = 'block'
      } else if (i === 1) {
        bioDiv.style.display = 'flex'
      } else if (i === 2) {
        contactDiv.style.display = 'flex'
      }
    })
  }

}

randomizeBodyBackgroundColor()
addNavEvents()
init()
draw(ctx)


