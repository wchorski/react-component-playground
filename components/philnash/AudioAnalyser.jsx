// credit - https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
// bout to be converted
// import React, { Component, useRef, useEffect, useState } from 'react';
// import AudioVisualiser from './AudioVisualiser';

// export const AudioAnalyser = ( { audio } ) => {
//   // constructor(props) {
//   //   super(props);
//   //   this.state = { audioData: new Uint8Array(0) };
//   //   this.tick = this.tick.bind(this);
//   // }
//   const isMounted = useRef()

//   const [audioData, setAudioData] = useState(new Uint8Array(0))
//   // const [audioContext, setaudioContext] = useState()
//   // const [analyser, setAnalyser] = useState()
//   // usest
//   const audioContext = useRef(null)
//   const analyser = useRef(new Uint8Array(0))
//   const dataArray = useRef(null)
//   const source = useRef(null)
//   let rafId = useRef(null)

//   useEffect(() => {
//     if(!isMounted.current){
//       handleMount() // mount logic
//       isMounted.current = true 

//     } else {
//       if(!analyser.current) return 
//       tick() // update logic
//     }
  
//     // return () => {
//     //   cancelAnimationFrame(rafId.current);
//     //   analyser.current.disconnect();
//     //   source.current.disconnect();
//     // }
//   })
  

//   async function handleMount() {
//     try {
//       // this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const newAudCtx = new (window.AudioContext || window.webkitAudioContext)()
//       audioContext.current = newAudCtx

//       const newAnlyzer = newAudCtx.createAnalyser()
//       analyser.current = newAnlyzer

//       const newDtArr = new Uint8Array(newAnlyzer.current.frequencyBinCount)
//       dataArray.current = newDtArr

//       const newSrc = audioContext.current.createMediaStreamSource(audio);
//       source.current = newSrc

//       newSrc.connect(newAnlyzer)
//       const newRafId = requestAnimationFrame(tick())
//       rafId.current = newRafId
      
//     } catch (error) {
//       console.warn('audio analyser mount fail');
//     }
//   }

//   function tick() {
//     if(!analyser.current) return 
//     analyser.current.getByteTimeDomainData(dataArray.current);
//     // setState({ audioData: this.dataArray });
//     setAudioData(dataArray.current)
//     rafId.current = requestAnimationFrame(tick());
//   }



//   return <AudioVisualiser audioData={audioData} />
// }

// export default AudioAnalyser;


// class comopnent before conversion
// class comopnent before conversion
// class comopnent before conversion
import React, { Component } from 'react'
import AudioVisualiser from './AudioVisualiser'

class AudioAnalyser extends Component {
  constructor(props) {
    super(props)
    this.state = { audioData: new Uint8Array(0) }
    this.tick = this.tick.bind(this)
  }

  componentDidMount() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = this.audioContext.createMediaStreamSource(this.props.audio)
    this.source.connect(this.analyser);
    this.rafId = requestAnimationFrame(this.tick);
  }

  async getInputDevices() {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === "audioinput"
    );
  }

  async listenTo(deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    await this.#registerStream(stream);
  }
  async #registerStream(stream) {
    if (this.input) {
      this.input.disconnect(this.analyser);
    }
    this.input = this.context.createMediaStreamSource(stream);
    this.input.connect(this.analyser);
    await this.resume();
  }

  tick() {
    this.analyser.getByteTimeDomainData(this.dataArray)
    this.setState( {audioData: this.dataArray} )
    this.rafId = requestAnimationFrame(this.tick)
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId)
    this.analyser.disconnect()
    this.source.disconnect()
  }

  render() {
    return <AudioVisualiser audioData={this.state.audioData} />
  }
}

export default AudioAnalyser