import {useState, useEffect, useRef} from 'react'
import { Microphone } from "@/libs/microphone";
import {bar_spectrum} from "@/libs/visual_presets/bar_spectrum";
import  AudioAnalyser  from "@/components/philnash/AudioAnalyser";

export const AudioVisualizer = () => {

  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const [canvasCtxState, setCanvasCtxState]       = useState<CanvasRenderingContext2D|null>()
  const [presetArray, setPresetArray] = useState<string[]>(['spiral', 'bar_graph', 'donut', 'bar_spectrum'])
  const [currentPreset, setCurrentPreset] = useState<string>('bar_spectrum')

  const [audioCtx, setAudioCtx] = useState<AudioContext>()
  const [audioDevicesState, setAudioDevicesState] = useState<MediaDeviceInfo[]>()
  const [mediaStreamState, setMediaStreamState] = useState<MediaStream>()
  const audioSourcesRef = useRef(null)
  const [activeMic, setActiveMic] = useState<Microphone>()
  const [fftSizeState, setFftSizeState] = useState(512) //2^5 and 2^15, (32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768)
  const [gainNodeState, setGainNodeState]         = useState<GainNode>()
  const [analyzerNodeState, setAnalyzerNodeState] = useState<AnalyserNode>()
  const [dataArrayState, setDataArrayState]       = useState<Uint8Array>()
  const isPlayingRef = useRef<boolean>(true)

  async function getAudioDevice(id: string) {

    try {

      const newAudioDevices = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      setMediaStreamState(newAudioDevices)

      const audioDevices =  (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
      const theID = (id !== 'none') ? id : audioDevices[4].deviceId
      listenTo(theID);

      
    } catch (err) {
      console.warn(err);
    }
  }

  async function listenTo(deviceId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    await registerStream(stream);
  }

  async function registerStream(stream: any) {

    if(!audioCtx) return
    let input = undefined
    // if (input) input.disconnect(this.analyser);
    
    input = audioCtx.createMediaStreamSource(stream)
    input.connect(this.analyser)
    await resume()
  }

  async function resume() {
    if(!audioCtx) return console.warn('no audio ctx');
    
    if (audioCtx.state === "closed" || audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
  }

  function stopMicrophone() {
    if(!mediaStreamState) return console.warn('no media stream found');
    
    mediaStreamState.getTracks().forEach((track: any) => track.stop());
    setMediaStreamState(null)
  }

  function toggleMicrophone() {
    if (mediaStreamState) {
      stopMicrophone();
    } else {
      getAudioDevice('none');
    }
  }


  async function handleRender(mic: Microphone){

    if(!canvasRef.current) return console.warn('no canvas found error');
    
    // const canv = canvasRef.current
    // canvasRef.current.width = window.innerWidth
    // canvasRef.current.height = window.innerHeight
    const canv = canvasRef.current
    const ctx = canvasRef.current.getContext('2d')

    // todo add other presets
    switch (currentPreset) {
      case 'spiral':
        return bar_spectrum(canv, ctx, fftSizeState, mic)
      
      case 'bar_graph':
        return bar_spectrum(canv, ctx, fftSizeState, mic)

      case 'bar_spectrum':
        return bar_spectrum(canv, ctx, fftSizeState, mic)
        
      default:
        return console.log(`NO PRESET SELECTED.`);
    }
  
  }

  async function initializeAudio() {
    // if(!audioElRef.current) return console.warn('-- No Audio Found --');
    
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

  // const updateFrequency = () =>{
    
  //   if(!isPlayingRef.current) return 
    
  //   // if(!canvasRef.current || !dataArrayState || !canvasCtxRef.current || !analyzerNodeState) return console.warn('updateFrequency ERROR');
  //   if(!canvasRef.current)  return console.warn('1 updateFrequency canvasRef.current ERROR');
  //   if(!dataArrayState) return console.warn('2 updateFrequency dataArrayState ERROR');
  //   if(!canvasCtxState) return console.warn('3 updateFrequency canvasCtxState ERROR');
  //   if(!analyzerNodeState) return console.warn('4 updateFrequency analyzerNodeState ERROR');
    
  //   analyzerNodeState.getByteFrequencyData(dataArrayState)

  //   canvasCtxState.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  //   canvasCtxState.fillStyle = '#163532' //set in init
  //   canvasCtxState.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)

  //   const barWidth = 3
  //   const gap = 2
  //   const bufferLength = analyzerNodeState ? analyzerNodeState?.frequencyBinCount : 0
  //   const barCount = bufferLength / ((barWidth + gap) - gap)
  //   let x = 0

  //   for(let i = 0; i < barCount; i++){
  //     const perc = (dataArrayState[i] * 100) / 255
  //     const h = (perc * canvasRef.current.height) / 100

  //     canvasCtxState.fillStyle = `rgba(${dataArrayState[i]}, 230, 200, 1)`
  //     canvasCtxState.fillRect(x, canvasRef.current.height - h, barWidth, h)

  //     x += barWidth + gap
  //   }

  //   requestAnimationFrame(updateFrequency)
  // }

  // useEffect(() => {
  //   updateFrequency()
  
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isPlayingRef.current])
  

  useEffect(() => {
    
    // initializeAudio()
    getAudioDevice('none')
    // if(!audioElRef.current) return console.warn('useEffect audioElRef.current ERROR')
    // handleLoadedMetaData()

    // return () => 
  }, [])

  return (
    <div>
      <button onClick={e => toggleMicrophone()}> 
        {mediaStreamState ? 'Stop microphone' : 'Get microphone input'}
      </button>

      {mediaStreamState ? <AudioAnalyser audio={mediaStreamState} /> : ''}

      {audioDevicesState && presetArray && (
        <div className="options">
          <div className="audio-sources-cont">
            <label htmlFor="audio-sources">input:</label>
            <select name="audio-source" id="audio-sources" ref={audioSourcesRef} onChange={e => getAudioDevice(e.target.value)}>
              {audioDevicesState.map((device, i) => (
                <option key={i} value={device.deviceId}> {device.label} </option>
              ))}
            </select>
          </div>

          <div className="preset-cont">
            <label htmlFor="preset">preset:</label>
            <select name="preset" id="preset" onChange={e => setCurrentPreset(e.target.value)}>
              {presetArray.map((name, i) => (
                <option key={i} value={name}> {name} </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="visualizer" style={{width: "100%", height: "100px"}}></canvas>
    </div>
  )
}
