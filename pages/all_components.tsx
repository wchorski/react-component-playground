import { AudioVisualizer } from '@/components/AudioVizParent'
import { MusicPlayer } from '@/components/MusicPlayer'
import Script from 'next/script'
import React from 'react'

const All_Components = () => {
  return (
    <main>
      <Script src={'/scripts/MusicPlayer.js'}/>

      <section>
        <h2>Music player | <a href={'https://www.youtube.com/watch?v=rkqqBA6ohc0&t=10s'}> Before Semicolon</a> </h2>
        
        {/* <music-player 
          src="/audio/sinsweeps.mp3" 
          title="Sick Track" 
          artist="WilliaMusic" 
          controls 
          // muted
          // loop
          preload
          crossorigin='anonymous'
        ></music-player> */}
      </section>

      <section>
        <h2>My Music player Port based off above | <a href={'https://www.youtube.com/watch?v=rkqqBA6ohc0&t=10s'}> Before Semicolon</a> </h2>
        
        <MusicPlayer
          src={'/audio/piano.mp3'}
          title={'React Song'}
          artist={'React Artst'}
          controls={true}
          isPreload={true}
          isLoop={false}
          xorigin={'anonymous'}
        />
      </section>

      <section>
        <h2>My Audio Visualizer </h2>
        
        <AudioVisualizer />
      </section>

    </main>
  )
}

export default All_Components