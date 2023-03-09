import React, { useState, useEffect, useRef } from 'react';
import { Spectrum } from "@/components/AudioVisualizer/Spectrum";
import { Oscilliscope } from "@/components/AudioVisualizer/Oscilliscope";
import Select from 'react-select';
import { useLocalStorage } from "@/libs/useLocalStorage";

export function GPT_AudioVis() {

  const [micSources, setMicSources] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicSource, setSelectedMicSource] = useLocalStorage('VIZ__SELECTED_MIC', {"deviceId":"default","kind":"audioinput","label":"Default - Microphone","groupId":"12345"});
  const audioContext = useRef<AudioContext|null>(null)

  const [presetArray, setPresetArray] = useState([{value: 'spectrum', label: 'Spectrum'}, {value: 'oscilliscope', label: 'Oscilliscope'}])
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

  return (
    <div>
      {micSources && selectedMicSource &&(
        <div className="mic-cont">
        <label> Select microphone: </label>
          <Select 
            defaultValue={selectedMicSource}
            onChange={setSelectedMicSource}
            options={micSources}
          />
        </div>
      )}
      <br />
      
      {presetArray && selectedPrestName && (
        <div className="preset-cont">
          <label htmlFor="preset">preset:</label>
          <Select 
            defaultValue={selectedPrestName}
            onChange={handlePresetChange}
            options={presetArray}
          />
        </div>
      )}

      {audioContext.current && selectedMicSource && currVizComp && selectedPrestName &&(
        <div className='viz-cont'>{currVizComp ? currVizComp : null}</div>
      )}

    </div>
  );
}