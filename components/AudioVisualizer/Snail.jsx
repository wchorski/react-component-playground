// credit - Franks Lab -  https://www.youtube.com/watch?v=Ub70TitG6_k&t=176s

import {useState, useRef, useEffect} from 'react'
import {chameleonSVG} from "@/public/svgs/cam.svg";
import styled from "styled-components";

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
    const sound = micInput * 500
    if(sound > this.height){
      this.height = sound
    } else {
      this.height -= this.height * 0.04
    }
  }

  draw(context, canvas){
    // ? shell body
    context.strokeStyle = this.color
    context.lineWidth = this.width
    context.save()
    // context.translate(canvas.width/2, canvas.height/2)
    context.rotate(this.index *.043)
    context.beginPath()
    context.bezierCurveTo(
      this.x/2, 
      this.y/2, 
      this.height * -0.5 - 150, 
      this.height + 50, 
      this.x, 
      this.y)
    // context.moveTo(0, 0)
    // context.lineTo(this.x, this.y + this.height)
    context.stroke()

    // ? cicles around shell
    if(this.index > 170) { //? limit how many line|circles surround shell
      context.beginPath()
      context.arc(
        this.x, 
        this.y + this.height/2 + 10 + this.height * 0.1, 
        this.height * 0.05, 
        0, 
        Math.PI * 2
      )
      context.stroke()

      //? lines connecting shell and outer circles
      context.beginPath()
      context.moveTo(this.x, this.y + 5)
      context.lineTo(this.x, this.y + this.height/2)
      context.stroke()
    }

    context.restore()
  }
}

export const StyledSVG = styled.div`

  position: relative;

  .cls-1{fill:none;stroke:url(#gradient);stroke-miterlimit:10;stroke-width:3;}

  canvas{
    border: solid 1px white;
  }

  svg{
    position: absolute;
    z-index: -1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;

    & path{
      stroke-dasharray: 1500;
      stroke-dashoffset: 100;
      animation: strokeAnim 20s infinite ease-in-out
    }
  } 

  @keyframes strokeAnim {
    0%{
      stroke-dashoffset: 1520;
    } 
    25%{
      stroke-dashoffset: -1000;
    } 
    50%{
      stroke-dashoffset: -0;
    } 
    75%{
      stroke-dashoffset: 1000;
    } 
    100%{
      stroke-dashoffset: 1520;
    } 
  }
`

export const Snail = ({audioCtx, selectedMicSource, fftSize}) => {

  const canvasRef = useRef(null);
  const isStopped = useRef(false)
  const svgRef = useRef(null)

  async function analyzeAudio(){
    if(!selectedMicSource) return console.warn('NO AUDIO in Osc');
    // console.log('selectedMicSource, ', selectedMicSource);
    await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedMicSource.deviceId } } })
      .then(stream => {
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        const analyzerNode = audioCtx.createAnalyser();
        sourceNode.connect(analyzerNode);
        analyzerNode.connect(audioCtx.destination);
        
        const frequencyData = new Uint8Array(analyzerNode.frequencyBinCount);
        const canvas = canvasRef.current;
        if(!canvas) return
        const canvasCtx = canvas?.getContext('2d');


        // ! NEWWW
        let bars = []
        let barWidth = canvas.width/(fftSize/2)
        
        function createBars(){
          for(let i = 1; i < (fftSize/2); i++){
            let color = `hsl(${ 250 + i * .3}, 100%, 60%)`
            if(!canvas) return
            bars.push(new Bar(0, i * 0.9, 1, 50, color, i))
          }
        }
        createBars()
        
        let angle = 0
        let rotSpeed = 0
        let softVol = 0
        let amplitude = .00001
        
        const draw = () => {

          canvasCtx?.clearRect(0,0, canvas.width, canvas.height)

          // get samples
          analyzerNode.getByteTimeDomainData(frequencyData)
          let normSamples = [...frequencyData].map(e => e / 128 - 1)
          const samples = normSamples

          // getvolume
          let sum = 0
          for(let i = 0; i < normSamples.length; i++){
            sum += normSamples[i] * normSamples[i]
          }
          const volume = Math.sqrt(sum / normSamples.length)
      
          angle += rotSpeed + (-volume * 0.05)
          canvasCtx?.save()

          canvasCtx.translate(canvas.width/2, canvas.height/2)
          bars.forEach(function(bar, i){
            bar.update(samples[i])
            bar.draw(canvasCtx, canvas)
          })
      
          canvasCtx?.restore()
          softVol = softVol * 0.9 + volume * 0.1 // todo work in a amp var?

          if(!svgRef.current) return console.log('u got no style')
          svgRef.current.style.transform = `translate(-50%, -50%) scale(${(1 + softVol), (1 + softVol)}`
        
          if(isStopped.current) return cancelAnimationFrame(draw)
          requestAnimationFrame(draw)
        }
        draw()

        // ? dynamically keep svg in center under shell
        window.addEventListener('resize', function(){
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
        })

      });
  }


  useEffect(() => {

    isStopped.current = false
    analyzeAudio()
  
    return () => isStopped.current = true
  
    // return () => 
  }, [audioCtx, selectedMicSource])
  

  return (

    <StyledSVG>

      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" id="snail" data-name="Layer 1" viewBox="0 0 496.07 269.85"><defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef82e3"/>
          <stop offset="20%" stopColor="#b851cf"/>
          <stop offset="40%" stopColor="#943394"/>
          <stop offset="60%" stopColor="#b658bb"/>
          <stop offset="80%" stopColor="#ad4488"/>
          <stop offset="100%" stopColor="#bd1677"/>
        </linearGradient>
        </defs><path className="cls-1" d="M416.48,101.23s-2.22-62.5,8.45-87.83c0,0-6.22-11.56,5.33-12.89,0,0,11.56,2.66,0,12.89,0,0-12.89,58.33,1.78,87.83,0,0,8-1.17,12.89,3.72,0,0,29.78-70.22,38.67-77.78,0,0-4-16,8.88-12.44,0,0,9.34,8-4.44,13.33,0,0-36,62.22-28.44,93.34,0,0,18.22,36.88-31.12,74.66s-25.27,54.22-12.19,59.56-14.92,19.55-36.69,11.11-34.67-10.22-62.67-5.78-39.11,2.22-63.11-3.11-23.56,7.56-44.45,7.56-43.55-4.45-56.89-10.67c0,0-19.11-2.22-41.33,6.67,0,0-25.33,0-43.11-9.34,0,0-15.56-1.78-29.33,6.22,0,0-30.23-.88-37.78-25.77,0,0-8.89-11.11,54.22-7.11,0,0,80-14.67,117.78-39.56s92.44-11.11,100.44-10.67S327.6,173,340,163.62s26.67-22.22,37.33-23.56S392.54,100.31,416.48,101.23Z"/><path className="cls-1" d="M432.63,157.45s-14.82,6.4-18.92,5.38-8.53-3.55-10,2.89,7.36,4.4,10.48,1.64,14.22-2.84,18.3.27"/><path className="cls-1" d="M456.72,164.49s15.1,1.78,19.3,5.41,7.73,8.15,11.57,3.66-1.76-7.57-7.4-6.83-18.74-6.83-19.43-10.62"/><path className="cls-1" d="M430.26,187s-4-15-29-3.86S368.93,221.62,343.6,235s-40.89,27.39-60.78,28"/>
      </svg>

      <canvas ref={canvasRef} width={'800'} height={'600'} style={{width: '100%'}} ></canvas>

    </StyledSVG>

  )
}
