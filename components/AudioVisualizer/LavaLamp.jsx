// tweaked by WilliaMusic - cred - Frank Lab - https://www.youtube.com/watch?v=PKQKIfv6yAw

import {useEffect, useState, useRef} from 'react'
import styled from "styled-components";

export const LavaLamp = ({audioCtx, selectedMicSource, fftSize}) => {

  const isStopped = useRef(false)
  const canvasRef = useRef(null)
  const canvasCtx = useRef(null)
  const effectRef = useRef(null)
  const imgRef = useRef(null)
  const radiusRef = useRef(2000)

  const [imgURLState, setImgURLState] = useState({value: '/img/kirby.png', label: 'Kirby'})
  const [imgURLs, setImgURLs] = useState([
    {value: '/img/split skream.png', label: 'Split Skream'}, 
    {value: '/img/kirby.png', label: 'Kirby'}, 
    {value: '/img/13amp.png', label: '13 Amp'}, 
  ])

  async function analyzeAudio(){
    if(!selectedMicSource) return console.warn('NO AUDIO in Osc')

    // const effect = new MetaballsEffect(canvas.width, canvas.height)
    // effect.init(20)

    // function animate(){
    //   ctx.clearRect(0,0, canvas.width, canvas.height)
    //   effect.update()
    //   effect.draw(ctx)
    //   requestAnimationFrame(animate)
    // }
    // animate()

    await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedMicSource.deviceId } } })
      .then(stream => {
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        const analyzerNode = audioCtx.createAnalyser();
        sourceNode.connect(analyzerNode);
        analyzerNode.connect(audioCtx.destination);
        const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
        const gainNode = audioCtx.createGain()
        const biquadFilter = audioCtx.createBiquadFilter();

        sourceNode.connect(biquadFilter)
        biquadFilter.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        biquadFilter.type = "bandpass";
        biquadFilter.frequency.value = 200;
        biquadFilter.gain.value = 30;

        if(!canvasRef) return
        const canvas = canvasRef.current
        canvasCtx.current = canvas.getContext('2d', { willReadFrequently: true })
        const ctx = canvasCtx.current 
        ctx.fillStyle = 'white'
        // const image1 = imgRef.current
    
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    
        const effect = new Effect(canvas.width, canvas.height, radiusRef.current, imgRef.current)
        effect.init(20)
        effectRef.current = effect

        let softVol = 0
        ctx.fillStyle = 'white'
        
        function animate(){
          ctx?.clearRect(0, 0, canvas.width, canvas.height)

          analyzerNode.getByteFrequencyData(frequencyData);
          let volume = frequencyData[0] * .1;
          
          
          softVol = (softVol * 0.9 + volume * 0.9) + 1

          effect.update()
          effect.draw(ctx, softVol)
    
          if(isStopped.current) return cancelAnimationFrame(animate)
          requestAnimationFrame(animate)
        }
        animate()

        window.addEventListener('resize', () =>{
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          // ctx.fillStyle = '#4cd3f8'
          effect.reset(canvas.width, canvas.height)
        })

      })
  }

  useEffect(() => {
    isStopped.current = false
    analyzeAudio()
  
    return () => isStopped.current = true
  }, [audioCtx, selectedMicSource])

  useEffect(() => {
    analyzeAudio()
  
    // return () => 
  }, [imgURLState])

  // if(!effectRef || !canvasRef || !canvasCtx || !imgRef) return <p> Loading...</p>
  
  return (<>

    <StyledCanvasCont>
      <canvas 
        ref={canvasRef} 
        style={{
          // backgroundColor: '#352f48', 
          display: 'block',
          filter: 'blur(60px) contrast(50)',
        }}
      ></canvas>
    </StyledCanvasCont>

    <img ref={imgRef} src={imgURLState.value} style={{display: 'none'}}/>
  </>
  )
}


class Ball{
  constructor(effect){
    this.effect = effect
    this.radius = Math.random()
    this.x = this.radius*2 + ( Math.random() * (this.effect.width - this.radius*4) )
    this.y = -this.radius
    this.speedX = Math.random() - .5 - .1
    this.speedY = Math.random() * 1.5 + .5
    this.angle = 0
    this.va = Math.random() * .1 - .05
    this.range = Math.random() * 10
    this.gravity = Math.random() * 0.001
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

  draw(context, volume){
    context.beginPath()
    context.arc(this.x, this.y, (volume) + this.radius, 0, Math.PI * 2)
    // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
  }

  reset(){
    // this.x = this.effect.width * .5
    // this.y = this.effect.height * .5
    // this.y = 0
  }
}

class Effect{
  constructor(width, height, radius, img){
    this.width = width
    this.height = height
    this.metaballsArray = []

  }

  init(numOfBalls){
    for (let i = 0; i < numOfBalls; i++) {
      this.metaballsArray.push(new Ball(this))
    }
  }

  update(volume){
    this.metaballsArray.forEach(metaball => metaball.update(volume))
  }

  draw(context, volume){
    this.metaballsArray.forEach(metaball => metaball.draw(context, volume))
  }

  reset(newWidth, newHeight){
    this.width = newWidth
    this.height = newHeight
    this.metaballsArray.forEach(metaball => metaball.reset())
  }
}

export const StyledCanvasCont = styled.div`
  background-color: #454658;

  canvas{
    background-color: #000084;
    animation: colorAnim 20s infinite
  }


  @keyframes colorAnim {
    0%{
      background-color: #000084;
    } 
    25%{
      background-color: #114551;
    } 
    50%{
      background-color: #008309;
    } 
    75%{
      background-color: #007e58;
    } 
    100%{
      background-color: #000084;
    } 
  }
`