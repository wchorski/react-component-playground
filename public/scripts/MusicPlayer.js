// credit https://www.youtube.com/watch?v=rkqqBA6ohc0&t=10s

{
  class MusicPlayer extends HTMLElement {

    isPlaying = false
    currentTime = 0
    duration = 0
    volume = 0.4
    prevVolume = 0.4
    initialized = false
    title = 'untitled'
    artist = 'uknown'

    constructor(){
      super()

      this.attachShadow( {mode: 'open'} )
      this.render()
      this.initializeAudio()
      this.attachEvents()
    }

    static get observedAttributes(){
      return ['src', 'title', 'artist', 'muted', 'crossorigin', 'loop', 'preload']
    }

    async attributeChangedCallback(name, oldValue, newValue){
      if(name === 'src'){

        if(this.isPlaying){
          await this.togglePLay() 
        }

        this.initialized = false
        this.render()
      }
      else if(name === 'title'){
        this.title = newValue

        if(this.titleElement){
          this.titleElement.textContent = this.title
        }
      }
      else if(name === 'artist'){
        this.artist = newValue

        if(this.artistElement){
          this.artistElement.textContent = this.artist
        }
      }
      else if(name === 'muted'){
        this.volumeBar.value = 0
        this.volume = 0

        if(this.artistElement){
          this.artistElement.textContent = this.artist
        }
      }

      for (let i = 0; i < this.attributes.length; i++) {
        const attr = this.attributes[i]

        if(attr.specified && attr.name !== 'title'){
          this.audio.setAttribute(attr.name, attr.value)
        }
        if(attr.specified && attr.name !== 'artist'){
          this.audio.setAttribute(attr.name, attr.value)
        }
        
      }

      if(!this.initialized){
        this.initializeAudio()
      }
      // console.log('--- ', name, oldValue, newValue);
    }

    initializeAudio(){
      if(this.initialized) return
      // console.log('-- initializeAudio')

      this.initialized = true

      this.audioCtx = new AudioContext()

      this.track = this.audioCtx.createMediaElementSource(this.audio)
      this.gainNode = this.audioCtx.createGain()
      this.analyzerNode = this.audioCtx.createAnalyser()

      this.analyzerNode.fftSize = 2048
      this.bufferLength = this.analyzerNode.frequencyBinCount
      this.dataArray = new Uint8Array(this.bufferLength)
      this.analyzerNode.getByteFrequencyData(this.dataArray)

      this.track
      .connect(this.gainNode)
      .connect(this.analyzerNode)
      .connect(this.audioCtx.destination) //TODO input different sources

      this.attachEvents()
    }

    updateFrequency(){
      if(!this.isPlaying) return

      this.analyzerNode.getByteFrequencyData(this.dataArray)

      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.canvasCtx.fillStyle = 'rgba(255,255,255, 0.1)'
      this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      const barWidth = 3
      const gap = 2
      const barCount = this.bufferLength / ((barWidth + gap) - gap)
      let x = 0

      for(let i = 0; i < barCount; i++){
        const perc = (this.dataArray[i] * 100) / 255
        const h = (perc * this.canvas.height) / 100

        this.canvasCtx.fillStyle = `rgba(${this.dataArray[i]}, 230, 200, 1)`
        this.canvasCtx.fillRect(x, this.canvas.height - h, barWidth, h)

        x += barWidth + gap
      }

      requestAnimationFrame(this.updateFrequency.bind(this))
    }

    attachEvents(){
      this.playPauseBtn.addEventListener('click', this.togglePLay.bind(this), false)

      this.muteButtonEl.addEventListener( 'click', e => {
        this.toggleMute()
      })

      this.volumeBar.addEventListener( 'input', this.changeVolume.bind(this), false)
      this.progressBar.addEventListener('input', () => {
        this.seekTo(this.progressBar.value)
      }, false )

      this.audio.addEventListener('loadedmetadata', () => {
        this.duration = this.audio.duration
        this.progressBar.max = this.duration

        // this.durationEl.textContent = `${mins}:${secs}`
        // console.log('duration', this.audio.duration );
        // console.log('currentTime', this.audio.currentTime );
      })

      this.audio.addEventListener('timeupdate', () => {
        this.updateAudioTime(this.audio.currentTime)
      })

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false
        this.playPauseBtn.textContent = '🔄'
      })
    }

    async togglePLay(){
      
      if(this.audioCtx.state === 'suspended') await this.audioCtx.resume()

      if(this.isPlaying){
        await this.audio.pause()
        this.isPlaying = false
        this.playPauseBtn.textContent = '▶️'
      } else {
        await this.audio.play()
        this.isPlaying = true
        this.playPauseBtn.textContent = '⏸️'
        this.updateFrequency()
      }
    }

    seekTo(value){
      this.audio.currentTime = value
    }

    updateAudioTime(time){
      this.currentTime = time
      this.progressBar.value = this.currentTime

      const secs = `${parseInt( `${time % 60}`, 10)}`.padStart(2, '0')
      const mins =    parseInt(`${(time / 60) % 60}`, 10)

      this.currentTimeEl.textContent = `${mins}:${secs}`
    }

    changeVolume(){
      this.prevVolume = this.volume
      this.volume = Number(this.volumeBar.value)
      this.gainNode.gain.value = this.volume

      if(Number(this.volume) > 1.5){
        this.volumeBar.parentNode.className = 'volume-bar high'
        this.muteButtonEl.textContent = '🔊'
      } 
      else if (Number(this.volume) > 1){
        this.volumeBar.parentNode.className = 'volume-bar over'
        this.muteButtonEl.textContent = '🔉'
      }
      else if (Number(this.volume) > 0){
        this.volumeBar.parentNode.className = 'volume-bar half'
        this.muteButtonEl.textContent = '🔈'
      }
      else{
        this.volumeBar.parentNode.className = 'volume-bar'
        this.muteButtonEl.textContent = '🔇'
      }
    }

    toggleMute(){
      console.log('mute toggled')

      this.volumeBar.value = this.volume === 0
        ? this.prevVolume
        : 0 
      this.changeVolume()
    }

    style(){
      return `
        <style>
          :host{
            width: 100%;
            max-width: 400px;
            font-family: sans-serif;
          }

          :host * {
            box-sizing: border-box
          }

          .audio-player{
            background: #163532;
            color: #fff;
            border-radius: 5px;
            padding: 1em;
            align-items: center;
            // display: flex;
            position: relative;
            margin: 0;
          }

          .audio-title{
            font-weight: bold;
          }

          .audio-artist{
            opacity: .7;
            font-weight: 100;
            font-size: .9rem;
            margin-bottom: 1em;
          }

          
          .progress-indicator{
            width: 100%;
            padding: 1em .5em 1em .5em;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          input[type="range"], .progress-bar{
            width: 70%;
            height: 100%;
            border-radius: 500px;
            appearance: none;
            background: none;
            overflow: hidden;
            cursor: pointer;
          }

          input[type="range"]::-webkit-slider-runnable-track{
            background: grey;
            height: 10px;
            border-radius: 500px;
            appearance: none;
          }

          input[type="range"]::-webkit-slider-thumb{
            width: 0;
            // border-radius: 50%;
            box-shadow: -300px 0 0 300px dimgrey; 
            appearance: none;
            background: dimgrey;
            width: 6px;
            height: 20px;
            margin: -7px 0 0 0;
            border-radius: 12px;
          }

          div:has(input[type="range"]):hover input[type="range"]::-webkit-slider-thumb{
            background: white;
          }
          
          .audio-time{
            opacity: .7;
            font-size: .7rem;
            font-weight: 100;
            margin: 0 .4em;
          }

          .audio-controls{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1em;
          }

          .volume-bar {
            position: relative;
          }
          
          .volume-bar.half button{
            color: blue;
          }
          .volume-bar.over button{
            color: red;
          }
        </style>
      `
    }

    render() {
      this.shadowRoot.innerHTML = `
        ${this.style()}
        <figure class="audio-player">
          <figcaption class="audio-title"></figcaption>
          <figcaption class="audio-artist"></figcaption>

          <audio style="display: none"></audio>

          <canvas class="visualizer" style="width: 100%; height: 60px"></canvas>
          
          <div class='audio-controls'>
            <div class='audio-transport'>
              <button class="prev-btn" type="button"> ⏮️ </button>
              <button class="play-btn" type="button"> ▶️ </button>
              <button class="next-btn" type="button"> ⏭️ </button>
            </div>

            <div class="volume-bar">
              <button class="mute-btn" type="button"> 🔈 </button>
              <input type="range" min="0" max="2" step="0.01" value="${this.volume}" class="volume-field">
            </div>
          </div>


          <div class="progress-indicator">
            <span class="audio-time current-time">0:0</span>
            <input type="range" max="100" value="0" class="progress-bar">
            <span class="audio-time duration">0:00</span>
          </div>

        </figure>

      `

      this.canvas             = this.shadowRoot.querySelector('canvas')
      this.canvasCtx          = this.canvas.getContext('2d')

      this.audio              = this.shadowRoot.querySelector('audio')
      this.playPauseBtn       = this.shadowRoot.querySelector('.play-btn')
      this.titleElement       = this.shadowRoot.querySelector('.audio-title');
      this.artistElement       = this.shadowRoot.querySelector('.audio-artist');
      this.volumeBar          = this.shadowRoot.querySelector('.volume-field');
      this.muteButtonEl        = this.shadowRoot.querySelector('.mute-btn');
      this.progressIndicator  = this.shadowRoot.querySelector('.progress-indicator');
      this.currentTimeEl      = this.progressIndicator.children[0];
      this.progressBar        = this.progressIndicator.children[1];
      this.durationEl         = this.progressIndicator.children[2];
    }
  }

  customElements.define( 'music-player', MusicPlayer)
}