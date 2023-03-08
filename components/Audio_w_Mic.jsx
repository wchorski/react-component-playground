import {useEffect, useState, useRef} from 'react'
import { Viz_w_Mic } from './Viz_w_Mic'
import { Microphone } from "@/libs/microphone";

export const Audio_w_Mic = () => {

  const [presetArray, setPresetArray] = useState(['spiral', 'bar_graph', 'donut', 'bars'])
  const [currentPreset, setCurrentPreset] = useState('bars')
  const [currVizComp, setCurrVizComp] = useState()
  const [fftSizeState, setFftSizeState] = useState(512) //2^5 and 2^15, (32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768)

  async function handleRender(mic){

    // const canv = document.getElementById('myCanvas')
    // const ctx = canv.getContext('2d')
    // canv.width = window.innerWidth
    // canv.height = window.innerHeight

    switch (currentPreset) {
      case 'spiral':
        return setCurrVizComp(<Viz_w_Mic mic={mic}/>)
      
      case 'bar_graph':
        return setCurrVizComp(<Viz_w_Mic mic={mic}/>)

      case 'bars':
        return setCurrVizComp(<Viz_w_Mic mic={mic}/>)
        
      default:
        return setCurrVizComp(<Viz_w_Mic mic={mic}/>)
    }
  
  }

  async function getAudioDevice(id) {

    try {
      const mic = new Microphone(fftSizeState)
      
      const audioDevices = await mic.getInputDevices();
      
      // TODO auto pics my Virtual Cable. figure out how to save this to local storage
      const theID = (id !== 'none') ? id : audioDevices[4].deviceId
      mic.listenTo(theID);

      handleRender(mic)
      
    } catch (err) {
      console.warn(err);
    }
  }

  async function handlePresetChange(name){
    console.log(name);
    setCurrentPreset(name)
  }


  useEffect(() => {

    getAudioDevice("none")

  }, [])
  return (
    <div className='viz-cont'>{currVizComp ? currVizComp : null}</div>
  )
}
