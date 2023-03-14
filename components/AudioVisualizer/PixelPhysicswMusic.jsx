// cred -Franks Lab - https://www.youtube.com/watch?v=vAJEHf92tV0

import {useRef, useState, useEffect} from 'react'
import Select from 'react-select';

export const PixelPhysicswMusic = ({audioCtx, selectedMicSource, fftSize}) => {

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

    if(!selectedMicSource) return console.warn('NO AUDIO in Osc');

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
        biquadFilter.gain.value = 1;

        if(!canvasRef) return
        const canvas = canvasRef.current
        canvasCtx.current = canvas.getContext('2d', { willReadFrequently: true })
        const ctx = canvasCtx.current 
        // const image1 = imgRef.current
    
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    
        const effect = new Effect(canvas.width, canvas.height, radiusRef.current, imgRef.current)
        effect.init(ctx)
        effectRef.current = effect

        let softVol = 0
        
        function animate(){
          ctx?.clearRect(0, 0, canvas.width, canvas.height)

          analyzerNode.getByteFrequencyData(frequencyData);
          let volume = frequencyData[0] * 200;


          effect.draw(ctx)
          softVol = (volume > 26200) ? volume : volume * 0.01 //? expand volume. cut off anything below that's too quiet
          // console.log('softVol, ', softVol);
          effect.update(softVol)
    
          if(isStopped.current) return cancelAnimationFrame(animate)
          requestAnimationFrame(animate)
        }
        animate()

      })
  }
  function handleWarp(){
    // effectState.warp()
    effectRef.current.warp()
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
  


  
  if(!effectRef || !canvasRef || !canvasCtx || !imgRef) return <p> Loading...</p>

  return (<>
    <div>
      <button
        onClick={e => handleWarp()}
      >Warp</button>

      <input type={'text'} defaultValue={imgURLState.value}
        onChange={e => setImgURLState(e.target.value)}
      />

      {imgURLs && imgURLState &&(
        <div className="mic-cont">
        <label> Select Image: </label>
          <Select 
            className='select-input'
            defaultValue={imgURLState}
            onChange={setImgURLState}
            options={imgURLs}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'grey' : 'red',
              }),
            }}
          />
        </div>
      )}

      {/* <label>Radius</label>
      <input type={'range'} min={10} max={50000} 
        onChange={e => radiusRef.current = e.target.value}
      /> */}
    </div>

    <canvas ref={canvasRef}></canvas>
    <img ref={imgRef} src={imgURLState.value} style={{display: 'none'}}/>

  </>)
}


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
    this.force = 0.00001
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
  constructor(width, height, radius, img){
    this.width = width
    this.height = height
    this.radius = radius
    this.particlesArray = []
    this.image = img
    this.centerX = this.width * 0.5
    this.centerY = this.height * 0.5
    this.x = this.centerX - this.image.width/2
    this.y = this.centerY - this.image.height/2
    this.gap = 6 //? integer only
    this.mousePos = {
      // radius: 8000,
      radius: radius,
      x: undefined,
      y: undefined,
    }

    // window.addEventListener('mousemove', (e) => {
    //   this.mousePos.x = e.x
    //   this.mousePos.y = e.y
    // })

    this.mousePos.x = this.width/2
    this.mousePos.y = this.height/2
    // this.mousePos.radius = radiusRef.current
  }

  init(context){
    var hRatio = this.width  / this.image.width    ;
    var vRatio =  this.height / this.image.height  ;
    var ratio  = Math.min ( hRatio, vRatio );
    var centerShift_x = ( this.width - this.image.width*ratio ) / 2;
    var centerShift_y = ( this.height - this.image.height*ratio ) / 2;

    context.clearRect(0,0, this.width, this.height);
    context.drawImage(
      this.image, 0,0, 
      this.image.width, this.image.height, 
      centerShift_x, centerShift_y, 
      this.image.width*ratio, this.image.height*ratio
    )

    // context.drawImage(this.image, this.x, this.y)
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
    // context.fillStyle = 'red' //? visual on force circle
    // context.fillRect(this.x, this.y, 50, 50) //? visual on force circle
  }

  update(r){
    this.particlesArray.forEach(part => part.update())
    this.mousePos.radius = r
    
    this.x = this.mousePos.x - this.x * 0.08
    this.y = this.mousePos.y - this.y * 0.08

    this.mousePos.x = ((Math.tan(this.centerX * .3) * 100) + this.width/2) + ((Math.sin(this.centerX * 5) * 100) )
    this.mousePos.y = ((Math.sin(this.centerY * 5) * 150) + this.height/2) + (Math.cos(this.centerY * 1) * 80) 

    this.centerX += 0.01
    this.centerY += 0.01
  }

  warp(){
    this.particlesArray.forEach(part => part.warp())
  }
}