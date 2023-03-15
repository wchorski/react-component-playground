// cred - Frank Lab - https://www.youtube.com/watch?v=PKQKIfv6yAw

import {useEffect, useState, useRef} from 'react'

export const LavaLamp = () => {

  const canvasRef = useRef(null)

  


  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx.fillStyle = '#8ec8d8'

    const effect = new MetaballsEffect(canvas.width, canvas.height)
    effect.init(20)

    function animate(){
      ctx.clearRect(0,0, canvas.width, canvas.height)
      effect.update()
      effect.draw(ctx)
      requestAnimationFrame(animate)
    }
    animate()

    window.addEventListener('resize', () =>{
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.fillStyle = 'white'
      effect.reset(canvas.width, canvas.height)
    })
  
    // return () => 
  }, [])
  
  return (<>
    <canvas 
      ref={canvasRef} 
      style={{
        backgroundColor: '#352f48', 
        display: 'block',
        filter: 'blur(30px) contrast(50)',
      }}
    ></canvas>
  </>
  )
}


class Ball{
  constructor(effect){
    this.effect = effect
    this.radius = Math.random() * 150 + 10
    this.x = this.radius*2 + ( Math.random() * (this.effect.width - this.radius*4) )
    this.y = -this.radius
    this.speedX = Math.random() - .5 - .1
    this.speedY = Math.random() * 1.5 + .5
    this.angle = 0
    this.va = Math.random() * .1 - .05
    this.range = Math.random() * 10
    this.gravity = Math.random() * 0.005
    this.vy = 0
  }

  update(){
    if(this.x < this.radius || this.x > this.effect.width - this.radius) this.speedX *= -1
    if(this.y > this.effect.height + this.radius){
      this.radius = Math.random() * 150 + 10
      this.y = -this.radius
      this.vy = 0
      this.speedY = Math.random() * 1.5 + .5
      this.x = this.radius*2 + ( Math.random() * (this.effect.width - this.radius*4) )
    }
    if(this.y > this.radius){
      this.vy += this.gravity
      this.speedY += this.vy
    }
    // this.angle += this.va
    this.x += this.speedX 
    this.y += this.speedY 
  }

  draw(context){
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }

  reset(){
    // this.x = this.effect.width * .5
    // this.y = this.effect.height * .5
    // this.y = 0
  }
}

class MetaballsEffect{
  constructor(width, height){
    this.width = width
    this.height = height
    this.metaballsArray = []

  }

  init(numOfBalls){
    for (let i = 0; i < numOfBalls; i++) {
      this.metaballsArray.push(new Ball(this))
    }
  }

  update(){
    this.metaballsArray.forEach(metaball => metaball.update())
  }

  draw(context){
    this.metaballsArray.forEach(metaball => metaball.draw(context))
  }

  reset(newWidth, newHeight){
    this.width = newWidth
    this.height = newHeight
    this.metaballsArray.forEach(metaball => metaball.reset())
  }
}

