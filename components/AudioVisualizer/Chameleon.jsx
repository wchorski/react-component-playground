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
    context.rotate(this.index *.1 + -.0001)
    context.beginPath()
    context.bezierCurveTo(
      this.x/1, 
      this.y/1, 
      this.height * .5 + 1, 
      this.height + 10, 
      this.x, 
      this.y)
    // context.moveTo(0, 0)
    // context.lineTo(this.x, this.y + this.height)
    context.stroke()

    // ? cicles around shell
    if(this.index > 1) { //? limit how many line|circles surround shell
      context.beginPath()
      context.arc(
        this.x * .1, 
        this.y + this.height/1 + this.height * .1, 
        this.height * .1, 
        0, 
        Math.PI * 1.9
      )
      context.stroke()

      //? lines connecting shell and outer circles
      context.beginPath()
      context.moveTo(this.x, this.y + 5)
      context.lineTo(this.x, this.y + this.height/3 + 5)
      context.stroke()
    }

    context.restore()
  }
}

export const StyledSVG = styled.div`

  position: relative;

  .cls-1{fill:none;stroke:url(#gradient);stroke-miterlimit:10;stroke-width:3;}

  canvas{
    background-color: #2c2c2c;
    border: solid 1px white;
    z-index: -1;
  }

  svg{
    position: absolute;
    z-index: 1;
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

export const Chameleon = ({audioCtx, selectedMicSource, fftSize}) => {

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
        let barWidth = canvas.width/(fftSize/2) + 30
        
        function createBars(){
          for(let i = 1; i < (fftSize/2); i++){
            let color = `hsl(${ 50 + i * .3}, 100%, 60%)`
            if(!canvas) return
            bars.push(new Bar(0, i * 0.9 + barWidth, barWidth - 2, 50, color, i))
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
          const volume = Math.sqrt(sum / normSamples.length) * .1
      
          angle += rotSpeed + (-volume * 0.05)
          canvasCtx?.save()

          canvasCtx.translate(canvas.width/2, canvas.height/2)
          bars.forEach(function(bar, i){
            bar.update(samples[i])
            bar.draw(canvasCtx, canvas)
          })
      
          canvasCtx?.restore()
          softVol = softVol * 0.9 + volume * 0.1 // todo work in a amp var?

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

      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" id="chameleon" data-name="Layer 1" viewBox="0 0 568.03 426.24"><defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2c2c2c"/>
          <stop offset="20%" stop-color="#575757"/>
          <stop offset="40%" stop-color="#2c2c2c"/>
          <stop offset="60%" stop-color="#3d6f49"/>
          <stop offset="80%" stop-color="#464646"/>
          <stop offset="100%" stop-color="#2c2c2c"/>
        </linearGradient></defs><path class="cls-1" d="M301.53,36.79s8.33-2,16.17,0l9.83-12,6,14a51.3,51.3,0,0,1,10,1l13-11,3,15s10,2,12,4l13-11,4,17s6,2,7,3l11-9,2,15s6,4,7,5l16-5-3,13,5,5,13-4-2,13,5,5,14-1-5,11s4,5,4,6h10l-5,7s5,6,5,8h8l-3,7s3,6,3,8h7l-3,6s48,88-35,208-174,55-188,39-78-85,23-126c0,0,36-13,70,41,0,0,18,56-42,73,0,0-14,4-32-10-17-10-24-42-5-54s41-9,49,7-13,39-28,22c0,0-4-14,14-15,0,0-30-11-29,11s46,31,52,7,5-47-37-54-52,44-39,65c12.65,20.45,43,62,114,27s56.4-122.91,46-140c-9.85-16.18-15-15-26-19,0,0,9-21,10-21s23,15,29,19c0,0-16.84-15.91-24-20-7-4-7-4-8-2s-23,54-29,51-23-4-29-2-28,8-6-13c0,0,3-4,18-6s22-37,22-37,9-39,21-34,17,10,40,26c0,0-24-23-32-27s-13-5-18-1c-6.63,5.3-20,53-20,57,0,0-59-14-62-18,0,0,30-19,35-41,2.48-10.9-7-30-52-41,0,0,41,10,49,35,0,0,2,7-6,18s-47,46-58,42-42,0-42,4-15.33,10-16.17,7.47-3.83-17.47,10.17-20.47,33-8,37-10,39-31,51-27c0,0-47-14-44-33,0,0-10,14,34,32,0,0-14,4-30,16,0,0-14-7-20-31s-39,0-64-8-41-14-56-58c0,0-5-12,15,1s40,30,57,23,22-21,22-21-24,23-57-10c0,0-33-19-33-24s3-2,3-2,1-7,4-8a32.17,32.17,0,0,0,7-4s45-34,73-17C222.53,23.79,319.53-21.21,301.53,36.79Z"/><path class="cls-1" d="M190.53,40.79s-9,5.34,0,12.17,11.78-3,11.39-6.08S200.53,36.79,190.53,40.79Z"/><path class="cls-1" d="M210.53,32.79c13.34,6.32,10,24-7,37s-33-11-31-17S172.53,14.79,210.53,32.79Z"/><path class="cls-1" d="M156.46,10.79s-9.43,5.94,0,12.17c8.61,5.69,10.91-5.57,11.39-6.08C170,14.59,166.46,6.79,156.46,10.79Z"/><path class="cls-1" d="M148.53,36.79s25-16.66,38-18c0,0-1-21-28-18S142.53,41.79,148.53,36.79Z"/><path class="cls-1" d="M322.53,53.79s0,8,5,6,7.67-10.62,3.83-9.31S322.53,53.79,322.53,53.79Z"/><path class="cls-1" d="M348.53,71.79c2,6,4,7,7,7s9-4,8.5-7-.5-10.93-5-8.46-10.5,1.11-10.5,4.78Z"/><path class="cls-1" d="M371.53,92.79c6.4-6.4,15,1,10,8S366.53,97.79,371.53,92.79Z"/><path class="cls-1" d="M406.53,87.79c9.05,0,15,0,9,8s-15,2-13.5,0S401.53,87.79,406.53,87.79Z"/><path class="cls-1" d="M444.53,124.79c-1.48,5.18,1,9,5,10s6,3,7-3,2.67-10.91-1.17-10.95S446.53,117.79,444.53,124.79Z"/><path class="cls-1" d="M468.1,179.13c-1.48,5.17,1,9,5,10s6,3,7-3,2.67-10.92-1.16-11S470.1,172.13,468.1,179.13Z"/><path class="cls-1" d="M381.1,70.13c-1.48,5.17,1,9,5,10s6,3,7-3,2.67-10.92-1.16-11S383.1,63.13,381.1,70.13Z"/><path class="cls-1" d="M412.68,107c3.07-4.46,7.19.69,4.8,5.56S410.29,110.47,412.68,107Z"/><path class="cls-1" d="M428.7,105.22c6.4-7.43,15,1.16,10,9.28S423.7,111,428.7,105.22Z"/><path class="cls-1" d="M464.47,152.83c5.32-6.4,12.47,1,8.31,8S460.31,157.83,464.47,152.83Z"/><path class="cls-1" d="M447.33,143.81c-3.88.88-5.79,3.49-5.39,6s-.42,4.28,3.89,2.87,8.05-2.1,7.06-4.23S452.57,142.62,447.33,143.81Z"/><path class="cls-1" d="M249.53,159.79s9,18,13.72,21.5c0,0-34.72,15.5-40.72,11.5,0,0-32,21-35,7a14.64,14.64,0,0,1,5-8l-13-4s-4-13,34-12C213.53,175.79,242.53,167.79,249.53,159.79Z"/><path class="cls-1" d="M188.53,192.79s-64-23-73-19c0,0-3,1,16,10s33,15,33,15-79.78,6-98.39,0-1.61,9,20.39,10,105,4.34,109,2.17,14.81,5.48,14.81,5.48,1.77-12.31,11-13.48l-6.8-2.17s-14,6-16,6S177.53,207.79,188.53,192.79Z"/><path class="cls-1" d="M483.53,305.79l-10,19s76,51,94,65V342.74S487.34,303.52,483.53,305.79Z"/><path class="cls-1" d="M421.53,278.79s1,16-1,19l-193-75s5-1,5-4,26.44-3.69,30.72-2.35,41.28,16.35,41.28,16.35l-5,7s-2,7,5,7h18s-7,15,15,11,38,1,38,1Z"/><path class="cls-1" d="M329.53,211.79l21,6s-23,30-32,26c0,0-17,1-16-3s8-8,8-8l-15-6s7.25-4.89,19.12-4.94S329.53,211.79,329.53,211.79Z"/><path class="cls-1" d="M102.53,154.79s1-8-2-11,7,4,5,13l6.83,6.5s1.84-12.16,0-14.33c0,0,5.17,12.83,3.17,16.83l5,5s8-21-17-34-42,5-42,5,12,5,22,25,31,11,31,11l-1.83-4.46.83-2.54-3-3s-14,3-18-2c0,0,16,2,16,0s-8-8-8-8-11,2-12,0c0,0,9.67-.69,10.33-1.84s-9.33-7.16-9.33-7.16l-12-1,8-1-11-6,13,5,1-5,3.11,5.67Z"/><path class="cls-1" d="M37,198.56s-5.46-5.94-9.68-5.59,7.57-2.75,13.15,4.59l9.37-1s-8.09-9.26-10.93-9.26c0,0,13.13,4.35,14.89,8.47l7-.59s-10.84-19.68-36.92-9S.58,221.43.58,221.43s11.58-5.92,33.3-.62,28.43-16.53,28.43-16.53l-4.59-1.49-1.39-2.28-4.23.35s-6.76,12.62-13.16,12.44c0,0,11.87-10.91,10.34-12.2S38,202,38,202s-5.59,9.69-7.76,9.16c0,0,5.72-7.83,5.27-9.08S24,204.6,24,204.6l-8.52,8.5,4.41-6.75L8.23,210.87l12.22-6.69-3.17-4,6.33,1.29Z"/><path class="cls-1" d="M228.41,251.53s-10.17-2.52-14.5.57,6.24-7.71,17.54-3.82l9.44-7.09s-15.42-4.22-18.49-2.38c0,0,17.35-4.05,22.2-1l4.93-4s-24-10-44.19,13.56c-22.49,26.24,0,51,0,51s8.29-13.52,35.63-22.16,19-35.24,19-35.24l-2.4-3.21-5-2-6.12,8.34s1.72,17.23-5.35,21.19c0,0,5-18.8,2.46-19.13S232,254.42,232,254.42s.89,13.49-1.85,14.35c0,0,.59-11.67-.79-12.66s-10.66,10-10.66,10l-3.14,14.18-.06-9.73L206,282.69,214.49,268l-6.3-2,7.79-2.78Z"/>
      </svg>

      <canvas ref={canvasRef} width={'800'} height={'600'} style={{width: '100%'}} ></canvas>

    </StyledSVG>

  )
}
