import { useEffect, useState } from "react"

type Osc = {
  note:number,
  velocity:number,
}

export function MidiController() {

  const [midiInputs, setMidiInputs] = useState({})
  const [ctx, setCtx] = useState<AudioContext|null>(null)
  const [oscillators, setOscillators] = useState<any[]>([])

  const handleInit = async () => {
    if (!ctx) {
      const newAudioContext = new AudioContext();
      newAudioContext.resume().then(() => {
        setCtx(newAudioContext);
        setupMidiAccess(newAudioContext);
      });
    }
  };

  const setupMidiAccess = (audioContext: AudioContext) => {
    navigator.requestMIDIAccess().then(success, failure);
  };

  function success(midiAccess:MIDIAccess){
    // console.log(midiAccess);
    // midiAccess.onstatechange = updateDevices
    const inputs = midiAccess.inputs
    // console.log(inputs);

    inputs.forEach((input) => {
      input.onmidimessage = handleInput
    })
    
    // setMidiInputs(inputs) 
  }


  function failure(){
    console.warn('Can not connect MIDI navigator');
  }

  function updateDevices(e:any){
    // console.log(e);
    console.table({
      Name: e.port.name,
      Brand: e.port.manufacture,
      State: e.port.state,
      Type: e.port.type,
    });
    
  }

  function handleInput(input:any) {
    const command   = input.data[0]
    const note      = input.data[1]
    const velocity  = input.data[2]

    // console.table({
    //   command,
    //   note,
    //   velocity,
    // })

    switch (command) {

      case 144: // note on
        (velocity > 0)
          ? noteOn(note, velocity)
          : noteOff(note, velocity)
        break;

      case 128: // note off
        noteOff(note, velocity)
        break;
    
      default:
        break;
    }
    
  }

  function noteOn(note:number, velocity:number) {
    console.log('NOTE ON')
    console.log(ctx);
    
    if(!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    gain.gain.value = 0.33;
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(note)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()

    setOscillators(prev => [...prev, osc])
    console.log('note on end');
    
  }
  function noteOff(note:number, velocity:number) {
    console.log('NOTE OFF')
    
    const updatedOscillators = oscillators.filter((oscillator) => {
      const freq = oscillator.frequency.value;
      if (freqToMidi(freq) === note) {
        oscillator.stop();
        return false;
      }
      return true;
    });
  
    setOscillators(updatedOscillators);

  }

  function midiToFreq(num:number){
    const a = 440
    return (a / 32) * (2 ** ((num - 9) / 12))
  }

  function freqToMidi(frequency: number): number {
    const midiNote = 12 * Math.log2(frequency / 440) + 69;
    return Math.round(midiNote);
  }


  // TODO why do i have to press 'start' twice to get ctx noticed by midi input?

  return (
    <div>

      <input type='range' min={0} max={127}/>

      <button onClick={handleInit}> Double Click to Start </button>

      <button 
        disabled={!ctx}
        onPointerDown={() => noteOn(57, 127)} 
        onPointerUp={() => noteOff(57, 127)} 
      >
        Play Sound
      </button>

    </div>
  )
}