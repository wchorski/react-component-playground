import React, { useState, useEffect, useRef } from 'react';
import { Spectrum } from "@/components/AudioVisualizer/Spectrum";
import { Oscilliscope } from "@/components/AudioVisualizer/Oscilliscope";
import { Spiral } from "@/components/AudioVisualizer/Spiral";
import { Chameleon } from "@/components/AudioVisualizer/Chameleon";
import { Snail } from "@/components/AudioVisualizer/Snail";
import Select from 'react-select';
import { useLocalStorage } from "@/libs/useLocalStorage";
import { StyledOverlayMenu } from "@/styles/OverlayMenu.styled";

export function AudioVisualizer() {

  const [micSources, setMicSources] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicSource, setSelectedMicSource] = useLocalStorage('VIZ__SELECTED_MIC', {"deviceId":"default","kind":"audioinput","label":"Default - Microphone","groupId":"12345"});
  const audioContext = useRef<AudioContext|null>(null)

  const [presetArray, setPresetArray] = useState([
    {value: 'spiral', label: 'Spiral'}, 
    {value: 'spectrum', label: 'Spectrum'}, 
    {value: 'oscilliscope', label: 'Oscilliscope'},
    {value: 'chameleon', label: 'Chameleon'},
    {value: 'snail', label: 'Snail'},
  ])
  const [selectedPrestName, setSelectedPrestName] = useLocalStorage('VIZ__CURRENT_PRESET', {value: 'spectrum', label: 'Spectrum'})
  const [currVizComp, setCurrVizComp] = useState<any |undefined>()

  const [isLoaded, setIsLoaded] = useState(false)


  async function initAudio(){

    document.addEventListener("click", async () => await resume()); // helps init audio because browser wants human interaction first
    document.addEventListener("scroll", async () => await resume());

    try {
      audioContext.current = new AudioContext();
    
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          setMicSources(audioInputs);
        });

      
    } catch (error) {
      console.warn(error);
    }
  }

  async function resume(){
    if (audioContext.current?.state === "closed" || audioContext.current?.state === "suspended") {
      await audioContext.current.resume();
    }
  }

  function handlePresetChange(obj: any) {

    switch (obj.value) {
      case 'oscilliscope':
        setCurrVizComp(<Oscilliscope 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
          fftSize={512}
        />)
        break;
      
      case 'spectrum':
        setCurrVizComp(<Spectrum 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
        />)
        break;

      case 'spiral':
        setCurrVizComp(<Spiral 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
          fftSize={512}
        />)
        break;

      case 'chameleon':
        setCurrVizComp(<Chameleon 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
          fftSize={512}
        />)
        break;

      case 'snail':
        setCurrVizComp(<Snail 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
          fftSize={512}
        />)
        break;

      default:
        setCurrVizComp(<Spectrum 
          audioCtx={audioContext.current} 
          selectedMicSource={selectedMicSource}
        />)
        break;
    }

    setSelectedPrestName(obj)
  }

  useEffect(() => {

    async function start(){
      await initAudio()
      handlePresetChange(selectedPrestName)
      setIsLoaded(true)
      setTimeout(() => {
        resume()
      }, 2000);

    }
    start()

  }, [])

  useEffect(() => {
    window.localStorage.setItem('VIZ__SELECTED_MIC', JSON.stringify(selectedMicSource))
    handlePresetChange(selectedPrestName)

    // return () => 
  }, [selectedMicSource])

  useEffect(() => {
    window.localStorage.setItem('VIZ__CURRENT_PRESET', JSON.stringify(selectedPrestName))
    handlePresetChange(selectedPrestName)

    // return () => 
  }, [selectedPrestName])
  
  
  
  if(!isLoaded) return <p>Loading...</p>

  return (<>
    <StyledOverlayMenu>
      <button className='handle'> {'<'} </button>

      {micSources && selectedMicSource &&(
        <div className="mic-cont">
        <label> Select microphone: </label>
          <Select 
            className='select-input'
            defaultValue={selectedMicSource}
            onChange={setSelectedMicSource}
            options={micSources}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'grey' : 'red',
              }),
            }}
          />
        </div>
      )}
      <br />
      
      {presetArray && selectedPrestName && (
        <div className="preset-cont">
          <label htmlFor="preset">preset:</label>
          <Select 
            className='select-input'
            defaultValue={selectedPrestName}
            onChange={handlePresetChange}
            options={presetArray}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? 'grey' : 'red',
              }),
            }}
          />
        </div>
      )}
    </StyledOverlayMenu>

    {audioContext.current && selectedMicSource && currVizComp && selectedPrestName &&(
      <div className='viz-cont'>{currVizComp ? currVizComp : null}</div>
    )}

  </>);
}