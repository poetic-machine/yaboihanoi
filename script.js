const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let gifs = []
let frameCount = 0

const RESOLUTION = 360
const GIF_PATH = './assets/gifs/'
const YABOI_HANOI = 'Yaboi_Hanoi'
const LANGS = ['Eng', 'Thai']
let GIF_FILENAMES

function getAllFileNames() {
  const fs = []
  const lang = LANGS[0] // 'Eng'
  YABOI_HANOI.split('_').forEach(word => {
    const chars = word.toUpperCase().split('')
    chars.forEach(ch => {
      fs.push(`${GIF_PATH}${word}_${lang}_${ch}_delay_0_${RESOLUTION}.gif`)
    })
  })
  return fs
}

function getPosition(i) {

  const midX = canvas.width * 0.5
  const midY = canvas.height * 0.5
  const cols = 5
  const rows = Math.ceil(GIF_FILENAMES.length / cols)

  const col = i % cols
  const row = Math.floor(i / cols)

  const x = midX + 180 * (col - (cols - 1) * 0.5)
  const y = midY + 250 * (row - (rows - 1) * 0.5)

  return [x, y]
}

function init() {

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  GIF_FILENAMES = getAllFileNames()


  // const midX = canvas.width * 0.5
  // const midY = canvas.height * 0.5
  // const cols = 5
  // const rows = Math.ceil(GIF_FILENAMES.length / cols)

  gifs = GIF_FILENAMES.map((f, i) => {

    // const col = i % cols
    // const row = Math.floor(i / cols)

    // const x = midX + 180 * (col - (cols - 1) * 0.5)
    // const y = midY + 220 * (row - (rows - 1) * 0.5)
    const [x, y] = getPosition(i)
    const scale = 0.3

    return new LetterAnimation(ctx, f, x, y, scale)
  })

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    gifs.forEach((gif, i) => {
      const [x, y] = getPosition(i)
      gif.updatePos(x, y)
    })
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

init()
draw(ctx)