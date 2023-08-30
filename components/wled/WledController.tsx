// http://192.168.0.204/json
import React, { useState } from 'react';

type Fixture = {
  on:boolean
  bri:number,
  col:[[]],
}

type Color = {
  r?:number,
  g?:number,
  b?:number,
}

export function WledController() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [brightness, setBrightness] = useState(255)
  const [isOn, setIsOn] = useState(true)
  const [colorPrimary, setColorPrimary]     = useState<Color>({r: 255, g: 0, b: 0})
  const [colorSecondary, setColorSecondary] = useState([0,  255,    0])
  const [colorTertiary, setColorTertiary]   = useState([0,    0,  255])

  async function postData()  {
    setIsLoading(true);
    
    const url = 'http://192.168.0.204/json'; // wled API endpoint
    const payload = {
      on:isOn,
      bri:brightness, 
      seg: [
        {
          id: 0,
          col: [
            [
              colorPrimary.r,
              colorPrimary.g,
              colorPrimary.b,
            ],
            colorSecondary,
            colorTertiary
          ],
        }
      ]
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Add any other headers you might need
      },
      body: JSON.stringify(payload)
    };

    try {
      const response = await fetch(url, requestOptions);
      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function updateColor(color:Color) {
    setColorPrimary(prev => ({...prev, ...color}))
    const res = await postData()
  }


  return (
    <div>
      <button onClick={postData}>test</button>
      <label>
        <span> MASTER </span>
        <input id="fader-master" type='range' min={0} max={255}
          onChange={(e) => setBrightness(Number(e.target.value))}
        />
      </label>

      <label>
        <span> r </span>
        <input id="fader-blue" type='range' min={0} max={255}
          onChange={(e) => updateColor({r: Number(e.target.value)})}
        />
      </label>

      <label>
        <span> g </span>
        <input id="fader-green" type='range' min={0} max={255}
          onChange={(e) => updateColor({g: Number(e.target.value)})}
        />
      </label>

      <label>
        <span> b </span>
        <input id="fader-red" type='range' min={0} max={255}
          onChange={(e) => updateColor({b: Number(e.target.value)})}
        />
      </label>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}