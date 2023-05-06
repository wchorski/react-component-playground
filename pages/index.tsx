
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import { AudioPlayer } from "@/components/AudioPlayer";
import Script from 'next/script';
import { MusicPlayer } from '@/components/MusicPlayer';
// import { AudioVisualizer } from '@/components/AudioVizParent';
import { Audio_w_Mic } from '@/components/Audio_w_Mic.jsx';
import { AudioVisualizer } from '@/components/AudioVisualizer/AudioVisualizer';
import { PixelPhysics } from "@/components/FranksLab/PixelPhysics";
import { SlimeBlobs } from "@/components/FranksLab/SlimeBlobs";
import { SmokeMonster } from "@/components/FranksLab/SmokeMonster";
import { LavaLamp } from "@/components/FranksLab/LavaLamp";
import { PixelPhysicswMusic } from "@/components/AudioVisualizer/PixelPhysicswMusic";
import { AvailabilityChecker } from '@/components/InputElements/AvailabilityChecker';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* <AvailabilityChecker /> */}


        {/* <PixelPhysicswMusic 
          audioCtx={null} 
          selectedMicSource={null}
          fftSize={512}
        /> */}
        {/* <AudioVisualizer /> */}
        {/* <LavaLamp /> */}


        
      </main>
      
      <footer>
        <span>williamusic</span>
      </footer>
    </>
  )
}