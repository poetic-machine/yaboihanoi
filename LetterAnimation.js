const LOADING_CIRCLE_SIZE = 0.1
const LOADING_CIRCLE_SPEED = 0.05
class LetterAnimation {
  constructor(ctx, url, x = 0, y = 0, options) {
    this.ctx = ctx
    this.url = url
    this.gif = GIF()
    this.gif.load(url)

    this.x = x
    this.y = y
    this.scale = (options && options.scale) ? options.scale : 0.2
    this.originalScale = null
    this.angle = (options && options.angle) ? options.angle : 0
    this.currentFrame = 0

    this.gif.shadowColor = 'rgba(0, 0, 0, 1)'

    // animation
    this.started = true
    this.speed = (options && options.speed) ? options.speed : 0
    this.originalSpeed = null
    this.buttons = null
    this.overlayDiv = null
    this.debug = false

    this.width = RESOLUTION * this.scale
    this.height = RESOLUTION * this.scale
    
    if (options) {
      if (options.debug) {
        this.debug = true
      }
      if (options.showUI) {
        this.attachUI()
      }
      if (options.interactive) {
        this.attachOverlayDiv()
      }
    }
  }

  info() {
    const lineHeight = 10
    const texts = [
      ['started', this.started],
      ['speed', this.speed],
      ['frameCount', this.currentFrame],
      ['index', this.currentFrame % this.gif.frames.length],
      ['frames length', this.gif.frames.length],
      ['[api]framesCount', this.gif.frameCount],
      ['[api]complete', this.gif.complete],
    ]

    
    this.fontStyle()
    texts.forEach((t, i) => {
      ctx.fillText(`${t[0]}:${t[1]}`, this.x - 30, this.y + 70 + lineHeight * i)
    })
    
  }

  fontStyle() {
    this.ctx.fillStyle = '#fff'
    this.ctx.font = "8px monospace";
  }

  startGif() {
    this.started = true
  }
  stopGif() {
    this.started = false
  }
  changeSpeed() {
    this.speed = (this.speed + 1) % 5
  }

  updatePos(x, y) {
    this.x = x
    this.y = y
    
    this.buttons && this.buttons.forEach((button, i) => {
      const [bx, by] = this.getButtonsPos(i)
      button.style.left = `${bx}px`
      button.style.top = `${by}px`
    })

    const [dx, dy] = this.getDivPosition()
    this.overlayDiv.style.left = `${dx}px`
    this.overlayDiv.style.top = `${dy}px`
  } 

  getButtonsPos(index) {
    return [
      this.x + (index - (this.buttons.length - 1) * 0.5) * 50,
      this.y - this.height * 0.5 - 30,
    ]
  }

  getDivPosition() {
    return [
      this.x - this.width * 0.5,
      this.y - this.height * 0.5,
    ]
  }


  draw() {
    const frameCount = Math.floor(this.currentFrame)
    const frameIndex = frameCount % this.gif.frames.length

    const { ctx, scale, angle, x, y } = this
    ctx.save()

    if (this.debug) {
      this.info()
    }

    if (this.gif.complete) {
      const image = this.gif.frames[frameIndex].image
      ctx.setTransform(scale, 0, 0, scale, x, y);
      ctx.rotate(angle);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
    } else {
      // this.fontStyle()
      // ctx.fillText(`loading`, x, y)
      ctx.beginPath()
      ctx.arc(x, y, this.width * LOADING_CIRCLE_SIZE * (1 + 0.1 * Math.sin(this.currentFrame * LOADING_CIRCLE_SPEED)), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()

    
    if (this.started) {
      this.currentFrame = this.currentFrame + this.speed
    }
  }


  attachOverlayDiv() {
    const div = document.createElement('DIV')
    div.style.position = 'absolute'

    const [dx, dy] = this.getDivPosition()

    div.style.left = `${dx}px`
    div.style.top = `${dy}px`
    div.style.width = `${this.width}px`
    div.style.height = `${this.height}px`
    document.body.appendChild(div)

    if (!this.debug) {
      div.style.opacity = 0;
    }
    div.style.color = 'rgba(255, 255, 255, 1)'
    div.textContent = '[interactive]'
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'

    div.addEventListener('mouseover', () => {
      this.originalScale = this.scale
      this.originalSpeed = this.speed
      this.scale = this.scale * 1.1
      this.speed = this.speed * 2.0
    })

    div.addEventListener('mouseleave', () => {
      this.scale = this.originalScale
      this.speed = this.originalSpeed
      this.originalScale = null
      this.originalSpeed = null
    })

    this.overlayDiv = div
  }

  attachUI() {

    const buttonsData = [
      { text: 'start', cb: () => this.startGif() },
      { text: 'stop', cb: () => this.stopGif() },
      { text: 'spd', cb: () => this.changeSpeed() },,
    ]
    
    this.buttons = buttonsData.map(() => {})

    buttonsData.forEach(({ text, cb }, i) => {
      const button = document.createElement('BUTTON')
      button.textContent = text
      button.style.position = 'absolute'
      
      const [bx, by] = this.getButtonsPos(i)

      button.style.left = `${bx}px`
      button.style.top = `${by}px`
      button.addEventListener('click', cb)
  
      document.body.appendChild(button)

      this.buttons[i] = button
    })

  }

  removeUI() {
    this.buttons.forEach(b => {
      b.remove()
    })
    this.buttons = null
  }

  toggleDebug(on = true) {
    if (on) {
      this.debug = true
      this.overlayDiv.style.opacity = 1
    } else {
      this.debug = false
      this.overlayDiv.style.opacity = 0
    }
  }
  
}