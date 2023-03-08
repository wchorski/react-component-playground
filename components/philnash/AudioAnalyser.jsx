// credit - https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
// bout to be converted

import React, { Component } from 'react'
import AudioVisualiser from './AudioVisualiser'

class AudioAnalyser extends Component {
  constructor(props) {
    super(props)
    this.state = { audioData: new Uint8Array(0) }
    // this.tick = this.tick.bind(this)

    // ! trying
    this.initalized = false

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then( function(stream) {
      this.context =  new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = 0.7;
      this.analyser.fftSize = this.props.fftSize ? this.props.fftSize : 512;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.fftSize);
      document.addEventListener("click", async () => await this.resume());
      document.addEventListener("scroll", async () => await this.resume());

      this.initalized = true

    }.bind(this)).catch( err => {
      alert(err)
    })
  }

  componentDidMount() {
    // this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    // this.analyser = this.audioContext.createAnalyser();
    // this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    // this.source = this.audioContext.createMediaStreamSource(this.props.audio)
    // this.source.connect(this.analyser);
    // // this.rafId = requestAnimationFrame(this.tick);
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

    // console.log(this.audioContext);
    this.input = this.context.createMediaStreamSource(stream);
    this.input.connect(this.analyser);
    await this.resume();
  }

  async resume() {
    if(!this.audioContext) return console.warn('no audio ctx');
    
    if (this.audioContext.state === "closed" || this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  async getDataArray(){
    return this.freqData
  }
  async getAnalyzerNode(){
    return this.analyser
  }

  // tick() {
  //   this.analyser.getByteTimeDomainData(this.dataArray) //! for osciliscope?
  //   this.setState( {audioData: this.dataArray} )
  //   this.rafId = requestAnimationFrame(this.tick)
  // }

  // componentWillUnmount() {
  //   cancelAnimationFrame(this.rafId)
  //   this.analyser.disconnect()
  //   this.source.disconnect()
  // }

  // render() {
  //   return (
  //     <AudioVisualiser 
  //       analyzerNodeState={this.analyser}
  //       dataArrayState={this.dataArray}
  //     />

  //   )
  // }
}

export default AudioAnalyser