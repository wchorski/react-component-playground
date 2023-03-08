// cred - https://github.com/philnash/react-web-audio/blob/master/src/AudioVisualiser.js
// ported to use hooks
import { bar_spectrum } from "@/libs/visual_presets/bar_spectrum";

import React, { Component, useEffect, useState, useRef } from 'react';

export const AudioVisualiser = ({ 
  // analyzerNodeState, dataArrayState,
  mic,
}) => {

  const canvasRef = useRef(null)
  const [dataArrayState, setDataArrayState] = useState(mic.freqData)
  const [analyzerNodeState, setanalyzerNodeState] = useState(mic.analyser)
  // const canvasCtxState = useRef()

  const isPlayingRef = useRef(true)
  const isMounted = useRef()

  useEffect(() => {

    if(!isMounted.current){
      console.log('mic, ', mic.freqData);
      isMounted.current = true // mount logic
    } else {
      
      draw() // update logic
    }
  
    return () => {
      cancelAnimationFrame(draw())
    }
  })
  


  // Oscilloscope

  const draw = () => {

    // ! my implanted code
    // if(!isPlayingRef.current) return 
    
    // if(!canvasRef.current || !dataArrayState || !canvasCtxRef.current || !analyzerNodeState) return console.warn('updateFrequency ERROR');
    if(!canvasRef.current)  return console.warn('1 updateFrequency canvasRef.current ERROR');
    const canvasCtxState = canvasRef.current.getContext('2d');
    // if(!dataArrayState) return console.warn('2 updateFrequency dataArrayState ERROR', dataArrayState);
    if(!mic.freqData) return console.warn('2 updateFrequency dataArrayState ERROR', mic.freqData);
    if(!canvasCtxState) return console.warn('3 updateFrequency canvasCtxState ERROR');
    if(!analyzerNodeState) return console.warn('4 updateFrequency analyzerNodeState ERROR');
    
    analyzerNodeState.getByteFrequencyData(dataArrayState)

    canvasCtxState.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    canvasCtxState.fillStyle = '#163532' //set in init
    canvasCtxState.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    const barWidth = 3
    const gap = 2
    const bufferLength = analyzerNodeState ? analyzerNodeState?.frequencyBinCount : 0
    const barCount = bufferLength / ((barWidth + gap) - gap)
    let x = 0

    for(let i = 0; i < barCount; i++){
      const perc = (dataArrayState[i] * 100) / 255
      const h = (perc * canvasRef.current.height) / 100

      canvasCtxState.fillStyle = `rgba(${dataArrayState[i]}, 230, 200, 1)`
      canvasCtxState.fillRect(x, canvasRef.current.height - h, barWidth, h)

      x += barWidth + gap
    }

    requestAnimationFrame(draw)

  }


  return <canvas width="300" height="300" ref={canvasRef} />
  
}

export default AudioVisualiser;