import React, { useState, useEffect, useRef } from 'react';
import { Spectrum } from "@/components/ChatGPT/Spectrum";
import { Oscilliscope } from "@/components/ChatGPT/Oscilliscope.jsx";
// import { useLocalStorage } from "@/libs/useLocalStorage";

export function GPT_AudioVis() {
  const [micSources, setMicSources] = useState<MediaDeviceInfo[]>([]);
  // const [selectedMicSource, setSelectedMicSource] = useState<MediaDeviceInfo|null|undefined>(null);
  const [selectedMicSource, setSelectedMicSource] = useLocalStorage('VIZ__SELECTED_MIC', {"deviceId":"default","kind":"audioinput","label":"Default - Microphone","groupId":"12345"});
  const [currComponent, setCurrComponent] = useState(null)
  const [presetArray, setPresetArray] = useState(['spectrum', 'oscilliscope'])
  const [selectedPrestName, setSelectedPrestName] = useLocalStorage('VIZ__CURRENT_PRESET', 'spectrum')
  const [currVizComp, setCurrVizComp] = useState<any |undefined>()

  const audioContext = useRef<AudioContext|null>(null)

  async function initAudio(){
    console.log('initAudio trig');
    

    document.addEventListener("click", async () => await resume());
    document.addEventListener("scroll", async () => await resume());

    try {
      audioContext.current = new AudioContext();
    
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          setMicSources(audioInputs);
          // setSelectedMicSource(audioInputs[0]);
        });

      // handlePresetChange('spectrum')
      
    } catch (error) {
      console.warn(error);
    }
  }

  async function resume(){
    if (audioContext.current?.state === "closed" || audioContext.current?.state === "suspended") {
      await audioContext.current.resume();
    }
  }

  function handlePresetChange(name: string) {
    // console.log(' ------ preset change to: ', selectedPrestName)
    // console.log('==== handlePresetChange selectedMicSource, ', selectedMicSource);

    switch (name) {
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

    setSelectedPrestName(name)

    // window.localStorage.setItem('VIZ__CURRENT_PRESET', name)
    
  }

  useEffect(() => {

    async function start(){
      await initAudio()
      handlePresetChange(selectedPrestName)

    }
    start()

  }, [])

  useEffect(() => {
    window.localStorage.setItem('VIZ__SELECTED_MIC', JSON.stringify(selectedMicSource))
    handlePresetChange(selectedPrestName)
    // initAudio()
    // return () => 
  }, [selectedMicSource])

  useEffect(() => {
    window.localStorage.setItem('VIZ__CURRENT_PRESET', JSON.stringify(selectedPrestName))
    handlePresetChange(selectedPrestName)
    // initAudio()
    // return () => 
  }, [selectedPrestName])
  
  
  


  return (
    <div>
      {micSources && selectedMicSource &&(
        <label>
          Select microphone:
          <select
            defaultValue={selectedMicSource ? selectedMicSource.deviceId : ''}
            onChange={e => {
              const deviceId = e.target.value;
              const selectedDevice = micSources.find(device => device.deviceId === deviceId);
              setSelectedMicSource(selectedDevice)
            }}
          >
            {micSources.map(device => (
              <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
            ))}
          </select>
        </label>

      )}
      
      {presetArray &&(
        <div className="preset-cont">
          <label htmlFor="preset">preset:</label>
          <select name="preset" id="preset" 
            onChange={e => handlePresetChange(e.target.value)}
            defaultValue={selectedPrestName ? selectedPrestName : 'error'}
          >
            {presetArray.map((name, i) => (
              <option key={i} value={name}> {name} </option>
            ))}
          </select>
        </div>
      )}

      {audioContext.current && selectedMicSource && currVizComp && selectedPrestName &&(

        <div className='viz-cont'>{currVizComp ? currVizComp : null}</div>
        
      )}
      
      {/* <canvas ref={canvasRef} width={400} height={200} /> */}
    </div>
  );
}


// Hook
function useLocalStorage(key: string, initialValue: any) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}