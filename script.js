const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const uiCheckbox = document.getElementById('uiCheckbox')
const debugCheckbox = document.getElementById('debugCheckbox')
const bioDiv = document.getElementById('bio')
const contactDiv = document.getElementById('contact')
let gifs = []
let frameCount = 0

const COLOR_PALLETE = [
  'rgba(209, 152, 176, 1)',
  'rgba(30, 66, 124, 1)',
  'rgba(240, 195, 108, 1)',
  'rgba(48, 82, 72, 1)',
  'rgba(126, 51, 56, 1)',
  'rgba(117, 200, 147, 1)',
  'rgba(224, 142, 108, 1)',
]
const DEFAULT_SCALE = 0.5
const DEFAULT_SPEED = {
  'A': 1/3, 'Y': 1.0, 'B': 1.5, 'O': 1.0, 'I': 0.5,
}
const RESOLUTION = 360
const GIF_PATH = './assets/gifs/'
const YABOI_HANOI = 'Yaboi_Hanoi'
const WORDS = 'Yaboi'
const LANGS = ['Eng', 'Thai']
let GIF_FILENAMES

function randomizeBodyBackgroundColor() {
  const index = Math.floor(Math.random() * 4)
  document.body.style.backgroundColor = COLOR_PALLETE[index]
}

function getAllFileNames() {
  const fs = {}
  const lang = LANGS[0] // 'Eng'
  WORDS.split('_').forEach(word => {
    const chars = word.toUpperCase().split('')
    chars.forEach(ch => {
      // fs.push(`${GIF_PATH}${word}_${lang}_${ch}_delay_0_${RESOLUTION}.gif`)
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
  const rows = Math.ceil(Object.keys(GIF_FILENAMES).length / cols)

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
  GIF_FILENAMES = getAllFileNames()

  gifs = Object.keys(GIF_FILENAMES).map((key, i) => {
    const f = GIF_FILENAMES[key]
    const [x, y] = getPosition(i)

    return new LetterAnimation(ctx, f, x, y, { 
      speed: DEFAULT_SPEED[key] || null,
      scale: DEFAULT_SCALE,
      interactive: true,
      showUI: false,
      debug: false,
    })
  })

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    gifs.forEach((gif, i) => {
      const [x, y] = getPosition(i)
      gif.updatePos(x, y)
      gif.scale = getLetterScale()
    })
  })
  uiCheckbox.addEventListener('change', e => {
    toggleButtons(e.target.checked)
  })

  debugCheckbox.addEventListener('change', e => {
    toggleDebug(e.target.checked)
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