import {useRef, useEffect, useState} from 'react'

class Bar {
  
  constructor(x, y, width, height, color, index){
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.index = index
  }

  update(micInput){
    const sound = micInput * 1000
    if (sound > this.height){
      this.height = sound
    } else {
      this.height -= this.height * 0.05
    }
  }

  draw(context, volume){
    context.fillStyle = this.color
    context.fillRect(this.x, this.y, this.width, this.height)
  }
}

export const Viz_w_Mic = ({mic}) => {
  const canvasRef = useRef(null)
  // const canvasCtxState = useRef()
  const [audioData, setaudioData] = useState(new Uint8Array(0))

  const isPlayingRef = useRef(true)
  const isMounted = useRef()

  useEffect(() => {

    if(!isMounted.current){
      
      isMounted.current = true // mount logic
    } else {
      
      draw() // update logic
    }
  
    return () => {
      cancelAnimationFrame(draw)
    }
  })
  


  // spectrum
  const ctx = canvasRef.current?.getContext('2d')
  let bars = []
  // let barWidth = canv.width/(fftSizeState/2)
  let barWidth = canvasRef.current.width/(fftSizeState/2)
  
  function createBars(){
  
    for(let i = 0; i < (fftSizeState/2); i++){
      let clr = `hsl(${ 300 + i * .3}, 100%, 40%)`
      // bars.push(new Bar(i * barWidth, canv.height/2, 10, 50, c, i))
      bars.push(new Bar(i * barWidth, canvasRef.current.height/2 , 5, 50, clr, i))
    }
  }
  createBars()
  
  let angle = 0
  let rotSpeed = -0.001
  let softVol = 0
  let amplitude = .1
  
  function handleAnimate(){
    if(mic.initalized){
      ctx.clearRect(0,0, canvasRef.current.width, canvasRef.current.height)
      const samples = mic.getSamplesFreq()
      const volume = mic.getVolume()
  
      // angle += rotSpeed + (-volume * 0.05)
      ctx.save()
      // ctx.translate(canv.width/2, canv.height/2)
      // ctx.rotate(angle)
      bars.forEach(function(bar, i){
        bar.update(samples[i])
        bar.draw(ctx, volume * amplitude)
      })
  
      ctx.restore()
      softVol = softVol * 0.9 + volume * 0.1
    } 
  
    requestAnimationFrame(handleAnimate)
  }
  handleAnimate()


  return <canvas width="300" height="300" ref={canvasRef} />
}

// export const bar_graph = (canv, ctx, fftSizeState, mic) =>{
  
  
// }
