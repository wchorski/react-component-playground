// export const bar_spectrum = (canvas, ctx, fftSizeState, mic, dataArrayState, analyzerNodeState) =>{
export const bar_spectrum = (canvas, analyzerNodeState, dataArrayState) =>{

  if(!canvas)  return console.warn('1 updateFrequency canvas ERROR');
  const canvasCtxState = canvas.getContext('2d');
  if(!dataArrayState) return console.warn('2 updateFrequency dataArrayState ERROR', dataArrayState);
  // if(!canvasCtxState) return console.warn('3 updateFrequency canvasCtxState ERROR');
  // if(!analyzerNodeState) return console.warn('4 updateFrequency analyzerNodeState ERROR');
  
  // analyzerNodeState.getByteFrequencyData(dataArrayState)

  canvasCtxState.clearRect(0, 0, canvas.width, canvas.height)
  canvasCtxState.fillStyle = '#163532' //set in init
  canvasCtxState.fillRect(0, 0, canvas.width, canvas.height)

  const barWidth = 3
  const gap = 2
  const bufferLength = analyzerNodeState ? analyzerNodeState?.frequencyBinCount : 0
  const barCount = bufferLength / ((barWidth + gap) - gap)

  const handleAnimate = () => {
    analyzerNodeState.getByteFrequencyData(dataArrayState)
    let x = 0
  
    for(let i = 0; i < barCount; i++){
      const perc = (dataArrayState[i] * 100) / 255
      const h = (perc * canvas.height) / 100
  
      canvasCtxState.fillStyle = `rgba(${dataArrayState[i]}, 230, 200, 1)`
      canvasCtxState.fillRect(x, canvas.height - h, barWidth, h)
  
      x += barWidth + gap
    }

    requestAnimationFrame(handleAnimate)
  }  
  handleAnimate()
}