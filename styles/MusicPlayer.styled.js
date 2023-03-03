
import styled from 'styled-components'


export const StyledMusicPlayer = styled.figure`
  background: #163532;
  color: #fff;
  border-radius: 5px;
  padding: 1em;
  align-items: center;
  // display: flex;
  position: relative;
  margin: 0;
  min-width: 25em;


  .audio-title{
    font-weight: bold;
  }

  .audio-artist{
    opacity: .7;
    font-weight: 100;
    font-size: .9rem;
    margin-bottom: 1em;
  }

  
  .progress-indicator{
    width: 100%;
    padding: 1em .5em 1em .5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  input[type="range"], .progress-bar{
    width: 70%;
    height: 100%;
    border-radius: 500px;
    appearance: none;
    background: none;
    overflow: hidden;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-runnable-track{
    background: grey;
    height: 30px;
    border-radius: 500px;
    appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb{
    width: 0;
    // border-radius: 50%;
    box-shadow: -300px 0 0 300px dimgrey; 
    appearance: none;
    background: dimgrey;
    width: 6px;
    height: 60px;
    margin: -7px 0 0 0;
    border-radius: 12px;
  }

  div:has(input[type="range"]):hover input[type="range"]::-webkit-slider-thumb{
    background: white;
  }
  
  .audio-time{
    opacity: .7;
    font-size: .7rem;
    font-weight: 100;
    margin: 0 .4em;
  }

  .audio-controls{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1em;
  }

  .volume-bar {
    position: relative;

    &:hover{
      .volume-field{
        opacity: 1;
        max-width: 5000px;
        width: 150px;
        pointer-events: all;
      }
    }
  }

  .volume-field{
    transform-origin: 0% 0%;
    transform: rotateZ(-90deg);
    opacity: 0;
    max-width: 0;
    height: 30px !important;
    position: absolute;
    top: 0px;
    left: 20%;
    /* padding: 0 2em ; */
    z-index: 3;
    pointer-events: none;
    transition: .1s ease-out;
  }


  button{
    padding: .3em;
    font-size: 2em;
    display: flex;
  }

  /* .play-btn{
    font-size: 1em;
  } */


`