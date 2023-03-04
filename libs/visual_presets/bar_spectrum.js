export const bar_spectrum = (canv, ctx, fftSizeState, mic) =>{
  
  // if(!canvasRef.current || !dataArrayState || !canvasCtxRef.current || !analyzerNodeState) return console.warn('updateFrequency ERROR');
  // if(!canvasRef.current)  return console.warn('1 updateFrequency canvasRef.current ERROR');
  // if(!dataArrayState) return console.warn('2 updateFrequency dataArrayState ERROR');
  // if(!canvasCtxState) return console.warn('3 updateFrequency canvasCtxState ERROR');
  // if(!analyzerNodeState) return console.warn('4 updateFrequency analyzerNodeState ERROR');
  
  analyzerNodeState.getByteFrequencyData(dataArrayState)

  canvasCtxState.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  canvasCtxState.fillStyle = '#163532' //set in init
  canvasCtxState.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

  const barWidth = 3
  const gap = 2
  const bufferLength = analyzerNodeState ? analyzerNodeState?.frequencyBinCount : 0
  const barCount = bufferLength / ((barWidth + gap) - gap)
  
  function handleAnimate(){
    if(mic.initalized){
      // if(!isPlayingRef.current) return 
      
      let x = 0
    
      for(let i = 0; i < barCount; i++){
        const perc = (dataArrayState[i] * 100) / 255
        const h = (perc * canvasRef.current.height) / 100
    
        canvasCtxState.fillStyle = `rgba(${dataArrayState[i]}, 230, 200, 1)`
        canvasCtxState.fillRect(x, canvasRef.current.height - h, barWidth, h)
    
        x += barWidth + gap
      }
    } 
  
    requestAnimationFrame(handleAnimate)
  }
  handleAnimate()
}