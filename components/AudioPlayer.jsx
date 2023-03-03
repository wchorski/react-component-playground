import { useRef } from "react";
import  Actions  from "@/components/Actions";
import  Playlist  from "@/components/Playlist";
import {Controls}  from "@/components/Controls";
import PlayerState  from "@/libs/PlayerState";

export const AudioPlayer = () => {


  return (<>
    <PlayerState>
      <Actions /> 
      <Playlist />
      <Controls />

      {/* <div className="audioplayer">
        <label htmlFor="audiofile">audio</label>
        <input type='file' />
        <audio src='/audio/sinsweeps.mp3' controls></audio>
      </div> */}

    </PlayerState>
  </>)
}
