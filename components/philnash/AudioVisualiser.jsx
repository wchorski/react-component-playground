// cred - https://github.com/philnash/react-web-audio/blob/master/src/AudioVisualiser.js
// ported to use hooks

import React, { Component, useEffect, useState, useRef } from 'react';

export const AudioVisualiser = ({audioData}) => {
  const canvasRef = useRef(null)
  const isMounted = useRef()

  useEffect(() => {

    (!isMounted.current) 
      ? isMounted.current = true // mount logic
      : draw() // update logic
  
    // return () => {
  })
  


  // Oscilloscope

  function draw() {
    const canvas = canvasRef.current;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    for (const item of audioData) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();

  }


  return <canvas width="300" height="300" ref={canvasRef} />
  
}

export default AudioVisualiser;