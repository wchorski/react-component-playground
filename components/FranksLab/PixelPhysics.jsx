// cred -Franks Lab - https://www.youtube.com/watch?v=vAJEHf92tV0

import { Grenze } from '@next/font/google'
import {useRef, useState, useEffect} from 'react'

export const PixelPhysics = () => {

  const isStopped = useRef(null)
  const canvasRef = useRef(null)
  const canvasCtx = useRef(null)
  const effectRef = useRef(null)
  const imgRef = useRef(null)
  const radiusRef = useRef(2000)

  const [effectState, setEffectState] = useState()

  useEffect(() => {
    isStopped.current = false

    if(!canvasRef) return
    const canvas = canvasRef.current
    canvasCtx.current = canvas.getContext('2d')
    const ctx = canvasCtx.current 
    const image1 = imgRef.current

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    class Particle{
      constructor(effect, x, y, color){
        this.effect = effect
        this.x = Math.random() * this.effect.width
        this.y =  Math.random() * this.effect.height
        this.originX = Math.floor(x)
        this.originY = Math.floor(y)
        this.color = color
        this.pixMargin = 1
        this.size = this.effect.gap - this.pixMargin
        this.vx = 0
        this.vy = 0
        this.ease = 0.5
        this.friction = 0.95
        this.dx = 0
        this.dy = 0
        this.distance = 0
        this.force = 0
        this.angle = 0
      }

      draw(context){
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, this.size, this.size)
      }

      update(){
        this.dx = this.effect.mousePos.x - this.x
        this.dy = this.effect.mousePos.y - this.y
        this.distance = this.dx * this.dx + this.dy * this.dy
        this.force = -this.effect.mousePos.radius / this.distance 

        if(this.distance < this.effect.mousePos.radius){
          this.angle = Math.atan2(this.dy, this.dx)
          this.vx += this.force * Math.cos(this.angle)
          this.vy += this.force * Math.sin(this.angle)
        }

        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
      }

      warp(){
        this.x = Math.random() * this.effect.width
        this.y = Math.random() * this.effect.height
        this.ease = 0.3
      }
    }
    
    class Effect{
      constructor(width, height){
        this.width = width
        this.height = height
        this.particlesArray = []
        this.image = imgRef.current
        this.centerX = this.width * 0.5
        this.centerY = this.height * 0.5
        this.x = this.centerX - this.image.width/2
        this.y = this.centerY - this.image.height/2
        this.gap = 6 //? integer only
        this.mousePos = {
          // radius: 8000,
          radius: radiusRef.current,
          x: undefined,
          y: undefined,
        }

        window.addEventListener('mousemove', (e) => {
          this.mousePos.x = e.x
          this.mousePos.y = e.y
        })
      }

      init(context){
        context.drawImage(this.image, this.x, this.y)
        const pixels = context.getImageData(0, 0, this.width, this.height).data
        for(let y=0; y < this.height; y += this.gap){
          for(let x=0; x < this.width; x += this.gap){
            const index = (y * this.width + x) * 4
            // const [red, green, blue, alpha] = [pixels[index], pixels[index+1], pixels[index+2], pixels[index+3]] //? create multi vars on one line
            const red = pixels[index]
            const green = pixels[index+1]
            const blue = pixels[index+2]
            const alpha = pixels[index+3]
            // const color = `rgb(${red, green, blue})`
            const color = `rgb(`+ red +','+ green +','+ blue +')'
            // console.log('color', color);

            if(alpha > 0) this.particlesArray.push(new Particle(this, x, y, color))
          }
        }
      }

      draw(context){
        this.particlesArray.forEach(part => part.draw(context))
      }

      update(){
        this.particlesArray.forEach(part => part.update())
      }

      warp(){
        this.particlesArray.forEach(part => part.warp())
      }
    }

    const effect = new Effect(canvas.width, canvas.height)
    effect.init(ctx)
    effectRef.current = effect
    
    function animate(){
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      effect.draw(ctx)
      effect.update()

      if(isStopped.current) return cancelAnimationFrame(animate)
      requestAnimationFrame(animate)
    }
    animate()

    // ctx.fillRect(120, 150, 100, 200)
    // ctx.drawImage(image1, 100, 200, 300, 400)
    // return () => 
  
    return () => isStopped.current = true
  }, [])

  function handleWarp(){
    // effectState.warp()
    effectRef.current.warp()
  }
  
  return (<>
    <div>
      <p>controls</p>
      <button
        onClick={e => handleWarp()}
      >Warp</button>

      <label>Radius</label>
      <input type={'range'} min={10} max={8000} 
        onChange={e => radiusRef.current = e.target.value}
      />
    </div>

    <canvas ref={canvasRef}></canvas>
    <img ref={imgRef} src={'/img/13amp.png'} style={{display: 'none'}}/>

  </>)
}
