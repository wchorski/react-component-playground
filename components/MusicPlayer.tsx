// ported from
// credit https://www.youtube.com/watch?v=rkqqBA6ohc0&t=10s

import {useState, useEffect, useRef} from 'react'
import { StyledMusicPlayer } from "@/styles/MusicPlayer.styled";
import { BsFillPlayFill, BsPauseFill, BsFillSkipBackwardFill, BsFillSkipForwardFill, BsVolumeMuteFill, BsVolumeDownFill, BsVolumeOffFill, BsVolumeUpFill, BsQuestionDiamond} from "react-icons/bs";

export const MusicPlayer = ({src, title, artist, xorigin, isLoop, isPreload, isControls}: any) => {

  const [volumeState, setVolumeState] = useState(0.4)
  const [durationState, setDurationState] = useState(0)
  const [volumeIcon, setVolumeIcon] = useState(<BsVolumeDownFill />)
  const [volPrev, setVolPrev] = useState(volumeState)
  const [playIconState, setPlayIconState] = useState(<BsFillPlayFill />)
  const [audioCtx, setAudioCtx] = useState<AudioContext>()
  const [isPlaying, setIsPlaying] = useState(false)
  const isPlayingRef = useRef<boolean>(false)
  
  const audioElRef = useRef<HTMLAudioElement|null>(null)
  const rangeProgressBar = useRef<HTMLInputElement|null>(null)
  const rangeVolumeBar = useRef<HTMLInputElement|null>(null)
  const currentTimeElRef = useRef<HTMLSpanElement|null>(null)
  const durationTimeElRef = useRef<HTMLSpanElement|null>(null)

  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  // const canvasCtxRef = useRef<CanvasRenderingContext2D|null>(null)
  const [canvasCtxState, setCanvasCtxState] = useState<CanvasRenderingContext2D|null>()
  const [gainNodeState, setGainNodeState] = useState<GainNode>()
  const [analyzerNodeState, setAnalyzerNodeState] = useState<AnalyserNode>()
  const [dataArrayState, setDataArrayState] = useState<Uint8Array>()

  async function initializeAudio() {
    if(!audioElRef.current) return console.warn('-- No Audio Found --');
    
    try {
      const newAudioCtx = new AudioContext()
      const track = newAudioCtx.createMediaElementSource(audioElRef.current) //sets source
      const gainNode = newAudioCtx.createGain()
      setGainNodeState(gainNode)
      const analyzerNode = newAudioCtx.createAnalyser()
      setAnalyzerNodeState(analyzerNode)

      analyzerNode.fftSize = 2048
      const bufferLength = analyzerNode.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      setDataArrayState(dataArray)
      analyzerNode.getByteFrequencyData(dataArray)

      track
        .connect(gainNode)
        .connect(analyzerNode)
        .connect(newAudioCtx.destination) //TODO input different sources

      // fix blurry lines\
      if(!canvasRef.current) return console.warn('canvas not found');
      
      canvasRef.current.width = canvasRef.current.offsetWidth;
	    canvasRef.current.height = canvasRef.current.offsetHeight;

      setAudioCtx(newAudioCtx)
      const newCanvasCtx = canvasRef.current?.getContext('2d')
      setCanvasCtxState(newCanvasCtx)

    } catch (err) {
      console.warn(err);
    }
  }

  const updateFrequency = () =>{
    
    if(!isPlayingRef.current) return 
    
    // if(!canvasRef.current || !dataArrayState || !canvasCtxRef.current || !analyzerNodeState) return console.warn('updateFrequency ERROR');
    if(!canvasRef.current)  return console.warn('1 updateFrequency canvasRef.current ERROR');
    if(!dataArrayState) return console.warn('2 updateFrequency dataArrayState ERROR');
    if(!canvasCtxState) return console.warn('3 updateFrequency canvasCtxState ERROR');
    if(!analyzerNodeState) return console.warn('4 updateFrequency analyzerNodeState ERROR');
    
    analyzerNodeState.getByteFrequencyData(dataArrayState)

    canvasCtxState.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    canvasCtxState.fillStyle = '#78787817' //set in init
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

    requestAnimationFrame(updateFrequency)
  }

  function handleVolumeChange(vol: number) {

    if(!rangeVolumeBar.current || !gainNodeState) return console.warn('handleVolumeChange ERROR');
    // if(!gainNodeState) return console.warn('gainNodeState ERROR');
    // if(!rangeVolumeBar.current) return console.warn('rangeVolumeBar ERROR');
    
    setVolumeState(Number(vol))
    gainNodeState.gain.value = vol

    switch (true) {
      case (vol > 1.5):
        setVolumeIcon(<BsVolumeUpFill />); break;
      case (vol > 1):
        setVolumeIcon(<BsVolumeDownFill />); break;
      case (vol > 0):
        setVolumeIcon(<BsVolumeOffFill />); break;
      case (vol <= 0):
        setVolumeIcon(<BsVolumeMuteFill />); break;
      default:
        setVolumeIcon(<BsQuestionDiamond />); break;
    }
    
  }

  function toggleMute(){

    if(!rangeVolumeBar.current) return console.warn('toggleMute ERROR');
    
    setVolPrev(volumeState)
    const newVol = volumeState === 0 ? volPrev : 0 
    rangeVolumeBar.current.value = String(newVol)
    
    handleVolumeChange(newVol)
  }  

  async function togglePlay(){

    try {
      if(!audioElRef.current) return console.warn('togglePlay error');
      
      if(audioCtx?.state === 'suspended') await audioCtx.resume()
  
      if(isPlaying){
        await audioElRef.current.pause()
        setIsPlaying(false)
        isPlayingRef.current = false
        setPlayIconState(<BsFillPlayFill />)
      } else {
        await audioElRef.current.play()
        setIsPlaying(true)
        isPlayingRef.current = true
        setPlayIconState(<BsPauseFill />)
        // updateFrequency()
      }
      
    } catch (error) {
      console.warn(error)
      
    }

  }

  function handleSeekTo(value: number){
    if(!audioElRef.current) return console.warn('handleSeek ERROR');
    
    audioElRef.current.currentTime = value
  }

  
  const handleLoadedMetaData = () =>{

    if(!durationTimeElRef.current || !rangeProgressBar.current) return console.warn('handleLoadedMetaData ERROR');
    
    
    const durTime = audioElRef.current ? audioElRef.current.duration : 0
    rangeProgressBar.current.max = String(durTime);
    console.log('duration', durTime);

    const secs = `${parseInt( `${durTime % 60}`, 10)}`
    const mins =    parseInt(`${(durTime / 60) % 60}`, 10)

    durationTimeElRef.current.textContent = `${mins}:${secs}` 
  }


  function updateAudioTime(){

    if(!rangeProgressBar.current || !currentTimeElRef.current) return

    const currentTime = audioElRef.current ? audioElRef.current.currentTime : 0
    rangeProgressBar.current.value = String(currentTime)

    const secs = `${parseInt( `${currentTime % 60}`, 10)}`.padStart(2, '0')
    const mins =    parseInt(`${(currentTime / 60) % 60}`, 10)

    currentTimeElRef.current.textContent = `${mins}:${secs}`
  }

  useEffect(() => {
    console.log('isPlaying, ', isPlaying);
    
    if(!isPlaying) return console.log('is stopped');
    
    updateFrequency()
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])
  

  useEffect(() => {
    
    initializeAudio()

    
    
    if(!audioElRef.current) return console.warn('useEffect audioElRef.current ERROR')
    handleLoadedMetaData()

    // if(!canvasCtxRef.current) return console.warn('music player useeffect Error')
    // const newCanvCtx = canvasRef.current?.getContext('2d')
    // console.log('-----------------');
    // console.log('newCanvCtx', newCanvCtx);
    
    // canvasCtxRef.current = newCanvCtx

    // return () => 

  }, [])
  

  return (

    <StyledMusicPlayer className="audio-player">

      <figcaption className="audio-title"> {title} </figcaption>
      <figcaption className="audio-artist"> {artist} </figcaption>

      <audio 
        ref={audioElRef}
        id='audioElRef'
        controls
        onLoadedMetadata={event => handleLoadedMetaData}
        src={src} 
        style={{display: "none"}}
        crossOrigin={xorigin}
        loop={isLoop}
        onTimeUpdate={e => updateAudioTime()}
      ></audio>

      <canvas ref={canvasRef} className="visualizer" style={{width: "100%", height: "100px"}}></canvas>
      
      <div className='audio-controls'>
        <div className='audio-transport'>
          {/* <button 
            className="prev-btn" 
            type="button"
            // onClick={e => }
          > <BsFillSkipBackwardFill /> </button> */}
          <button 
            className="play-btn" 
            type="button"
            onClick={e => togglePlay()}
          > {playIconState} </button>
          {/* <button 
            className="next-btn" 
            type="button"
            // onClick={e => }
          > <BsFillSkipForwardFill /> </button> */}
        </div>
        
        <div className="progress-indicator">
          <span ref={currentTimeElRef} className="audio-time current-time">0:0</span>
          <input 
            ref={rangeProgressBar}
            className="progress-bar" 
            type="range" 
            max="100" 
            // value="0" 
            defaultValue={"0"}
            onChange={e => handleSeekTo(Number(e.target.value))}
          />
          <span ref={durationTimeElRef} className="audio-time duration">0:00</span>
        </div>

        <div className="volume-bar">
          <button 
            className="mute-btn" 
            type="button"
            onClick={e => toggleMute()}
          > {volumeIcon} </button>

          <input 
            ref={rangeVolumeBar}
            className="volume-field" 
            type="range" 
            min="0" 
            max="2" 
            step="0.01" 
            // value="${this.volume}" 
            defaultValue={volumeState}
            onChange={e => handleVolumeChange(Number(e.target.value))}
          />
        </div>
      </div>



    </StyledMusicPlayer>
  )
}
