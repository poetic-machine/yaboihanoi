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
    this.originalScale = this.scale
    this.interactiveScale = null


    this.angle = (options && options.angle) ? options.angle : 0
    this.currentFrame = 0

    this.gif.shadowColor = 'rgba(0, 0, 0, 1)'

    // animation
    this.started = true
    this.speed = (options && options.speed) ? options.speed : 0
    this.interactiveSpeed = null
    this.buttons = null
    this.overlayDiv = null
    this.debug = false

    this.width = RESOLUTION * this.scale
    this.height = RESOLUTION * this.scale

    // show & disappear
    this.appearing = false
    this.disappearing = false
    
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

      if (options.hide) {
        // reset scale to disappeared
        this.originalScale = this.scale
        this.scale = 0    
        this.overlayDiv.style.display = 'none'
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
      ['scale', this.scale],
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
      this.x + (index - (this.buttons.length - 1) * 0.5) * 40,
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
    this.update()
    const frameCount = Math.floor(this.currentFrame)
    const frameIndex = frameCount % this.gif.frames.length

    const { ctx, scale, angle, x, y } = this
    ctx.save()

    if (this.debug) {
      this.info()
    }

    if (this.gif.complete) {
      const image = this.gif.frames[frameIndex].image
      ctx.save()
      ctx.setTransform(scale, 0, 0, scale, x, y);
      ctx.rotate(angle);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      ctx.restore()
    }
    if (!this.gif.complete) {
      ctx.beginPath()
      ctx.arc(x, y, this.width * LOADING_CIRCLE_SIZE * (1 + 0.1 * Math.sin(this.currentFrame * LOADING_CIRCLE_SPEED)), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()

    
    if (this.started) {
      this.currentFrame = this.currentFrame + this.speed
    }
  }

  update() {
    this.updateAppear()
    this.updateDisappear()
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
      if (this.appearing || this.disappearing) return
      this.interactiveScale = this.scale
      this.interactiveSpeed = this.speed
      this.scale = this.scale * 1.1
      this.speed = this.speed * 2.0
    })

    div.addEventListener('mouseleave', () => {
      if (this.appearing || this.disappearing || this.interactiveScale === null || this.interactiveSpeed === null) return
      this.scale = this.interactiveScale
      this.speed = this.interactiveSpeed
      this.interactiveScale = null
      this.interactiveSpeed = null
    })

    this.overlayDiv = div
  }

  attachUI() {

    const buttonsData = [
      { text: 'start', cb: () => this.startGif() },
      { text: 'stop', cb: () => this.stopGif() },
      { text: 'spd', cb: () => this.changeSpeed() },
      { text: 'show', cb: () => this.appear() },
      { text: 'hide', cb: () => this.disappear() },
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

  appear() {
    this.appearing = true
    this.overlayDiv.style.display = 'block'
  }

  updateAppear() {
    if (this.appearing) {
      this.scale += Math.pow((this.originalScale - this.scale), 2) * 0.8
      if (this.originalScale - this.scale < 2e-2) {
        this.scale = this.originalScale
        this.appearing = false
      }
    }
  }

  disappear() {
    this.disappearing = true
    this.originalScale = this.scale
    this.overlayDiv.style.display = 'none'
  }

  updateDisappear() {
    if (this.disappearing) {
      this.scale -= Math.pow(1 - this.scale, 1.0) * 0.07
      if (this.scale < 2e-2) {
        this.scale = 0
        this.disappearing = false
      }
    }
  }
}