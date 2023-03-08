import {useState, useEffect, useRef} from 'react'
import { Microphone } from "@/libs/microphone";
import {bar_spectrum} from "@/libs/visual_presets/bar_spectrum";
import  AudioAnalyser  from "@/components/philnash/AudioAnalyser";
import AudioVisualiser from './philnash/AudioVisualiser';

export const AudioVisualizer = () => {

  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const [canvasCtxState, setCanvasCtxState]       = useState<CanvasRenderingContext2D|null>()
  const [presetArray, setPresetArray] = useState<string[]>(['spiral', 'bar_graph', 'donut', 'bar_spectrum'])
  const [currentPreset, setCurrentPreset] = useState<string>('bar_spectrum')

  const [audioCtx, setAudioCtx] = useState<AudioContext>()
  const [audioDevicesState, setAudioDevicesState] = useState<MediaDeviceInfo[]>()
  const [mediaStreamState, setMediaStreamState] = useState<MediaStream>()
  const audioSourcesRef = useRef(null)
  const [activeMic, setActiveMic] = useState<AudioAnalyser>()
  const [fftSizeState, setFftSizeState] = useState(512) //2^5 and 2^15, (32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768)
  const [gainNodeState, setGainNodeState]         = useState<GainNode>()
  const [analyzerNodeState, setAnalyzerNodeState] = useState<AnalyserNode>()
  const [dataArrayState, setDataArrayState]       = useState<Uint8Array>()
  const isPlayingRef = useRef<boolean>(true)

  async function getAudioDevice(id: string) {

    try {

      // const newAudioDevices = await navigator.mediaDevices.getUserMedia({
      //   audio: true,
      //   video: false
      // });
      // setMediaStreamState(newAudioDevices)

      // const audioDevices =  (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
      // setAudioDevicesState(audioDevices)

      // const theID = (id !== 'none') ? id : audioDevices[4].deviceId
      // const stream = await navigator.mediaDevices.getUserMedia({
      //   audio: { deviceId: { exact: theID } },
      // });

      const mic = new AudioAnalyser(fftSizeState)
      const audioDevices =  await mic.getInputDevices()
      setAudioDevicesState(audioDevices)

      const theID = (id !== 'none') ? id : audioDevices[4].deviceId
      mic.listenTo(theID);
      setActiveMic(mic)
      
    } catch (err) {
      console.warn(err);
    }
  }

  

  // function stopMicrophone() {
  //   if(!mediaStreamState) return console.warn('no media stream found');
    
  //   mediaStreamState.getTracks().forEach((track: any) => track.stop());
  //   setMediaStreamState(null)
  // }

  // function toggleMicrophone() {
  //   if (mediaStreamState) {
  //     stopMicrophone();
  //   } else {
  //     getAudioDevice('none');
  //   }
  // }
  

  useEffect(() => {
    
    // initializeAudio()
    getAudioDevice('none')
    // if(!audioElRef.current) return console.warn('useEffect audioElRef.current ERROR')
    // handleLoadedMetaData()

    // return () => 
  }, [])

  return (
    <div>
      {/* <button onClick={e => toggleMicrophone()}> 
        {mediaStreamState ? 'Stop microphone' : 'Get microphone input'}
      </button> */}

      {/* {mediaStreamState ? <AudioAnalyser audio={mediaStreamState} /> : ''} */}
      
      {activeMic && (
        <AudioVisualiser 
          mic={activeMic}
        />
      )}

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
    
    </div>
  )
}
