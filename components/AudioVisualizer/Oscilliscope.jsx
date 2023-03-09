import {useEffect, useRef} from 'react'

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

    this.height = sound
  }

  draw(context, volume){
    context.fillStyle = this.color
    context.fillRect(this.x, this.y, this.width, this.height)

  }
}

export const Oscilliscope = ({audioCtx, selectedMicSource, fftSize}) => {

  const canvasRef = useRef(null);
  const isStopped = useRef(false)

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
        
          for(let i = 0; i < (fftSize/2); i++){
            let clr = `hsl(${ 150 + i * .3}, 100%, 60%)`
            if(!canvas) return
            bars.push(new Bar(i * barWidth * 3, canvas.height/2, 1, 20, clr, i))
          }
        }
        createBars()
        
        let angle = 0
        let rotSpeed = 0
        let softVol = 0
        let amplitude = .0001
        
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
          let vol = Math.sqrt(sum / normSamples.length)
          const volume = vol
      
          angle += rotSpeed + (-volume * 0.05)
          canvasCtx?.save()

          bars.forEach(function(bar, i){
            bar.update(samples[i])
            bar.draw(canvasCtx, volume * amplitude)
          })
      
          canvasCtx?.restore()
          softVol = softVol * 0.9 + volume * 0.1
        
          if(isStopped.current) return cancelAnimationFrame(draw)
          requestAnimationFrame(draw)
        }
        draw()

      });
  }


  useEffect(() => {
    isStopped.current = false
    analyzeAudio()
  
    return () => isStopped.current = true
  
  }, [audioCtx, selectedMicSource])
  

  return (
    <div>
      <h2>Ocilliscope.jsx</h2>

      <canvas ref={canvasRef} width={'800'} height={'600'} style={{width: '100%'}} />
    </div>
  )
}
