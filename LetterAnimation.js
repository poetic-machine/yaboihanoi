class LetterAnimation {
  constructor(ctx, url, x = 0, y = 0, scale = 0.2, angle = 0) {
    this.ctx = ctx
    this.url = url
    this.gif = GIF()
    this.gif.load(url)

    this.x = x
    this.y = y
    this.scale = scale
    this.angle = angle
    this.currentFrame = 0

    this.gif.shadowColor = 'rgba(0, 0, 0, 1)'
    this.width = RESOLUTION * scale
    this.height = RESOLUTION * scale

    // animation
    this.started = true
    this.speed = 1
    this.buttons = []
    
    this.attachUI()
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
    this.buttons.forEach((button, i) => {
      const [bx, by] = this.getButtonsPos(i)

      button.style.left = `${bx}px`
      button.style.top = `${by}px`
    })
  } 

  getButtonsPos(index) {
    return [
      this.x + (index - (this.buttons.length - 1) * 0.5) * 50,
      this.y - this.height * 0.5 - 30,
    ]
  }

  draw() {
    const frameCount = this.currentFrame
    const frameIndex = frameCount % this.gif.frames.length

    const { ctx, scale, angle, x, y } = this
    ctx.save()
    this.info()

    if (this.gif.complete) {
      const image = this.gif.frames[frameIndex].image
      ctx.setTransform(scale, 0, 0, scale, x, y);
      ctx.rotate(angle);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
    } else {
      this.fontStyle()
      ctx.fillText(`loading`, x, y)
    }

    ctx.restore()

    
    if (this.started) {
      this.currentFrame = this.currentFrame + this.speed
    }
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

  
}