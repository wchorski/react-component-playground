import {useEffect, useState, useRef} from 'react'

export const Spectrum = ({audioCtx, selectedMicSource}: any) => {

  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const isStopped = useRef<boolean>(false)

  async function analyzeAudio(){
    if(!selectedMicSource) return console.warn('NO AUDIO in Spectrum');
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

        const draw: any = () => {
          analyzerNode.getByteFrequencyData(frequencyData);
          canvasCtx?.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / frequencyData.length) * 2.5;
          let x = 0;

          for (let i = 0; i < frequencyData.length; i++) {
            const barHeight = frequencyData[i] * 2;
            if(!canvasCtx) return
            canvasCtx.fillStyle = `rgb(${barHeight + 100},200,200)`;
            canvasCtx?.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
          }

          if(isStopped.current) return cancelAnimationFrame(draw)
          requestAnimationFrame(draw);
        };

        draw();
      });
  }


  useEffect(():any => {

    isStopped.current = false
    analyzeAudio()
  
    return () => isStopped.current = true
  
    // return () => 
  }, [audioCtx, selectedMicSource])
  

  return (
    <div>
      <h2>Spectrum.jsx</h2>

      <canvas ref={canvasRef} width={'800'} height={'600'} style={{width: '100%'}} />
    </div>
  )
}
