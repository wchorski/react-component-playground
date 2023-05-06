import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import creds from "../../../private/cutefruit-project.json";

const scopes = ['https://www.googleapis.com/auth/calendar'];
const GOOGLE_PRIVATE_KEY = creds.private_key|| 'NO_KEY_SET'
const GOOGLE_CLIENT_EMAIL = creds.client_email || 'NO_EMAIL_SET'
const GOOGLE_CAL_ID = process.env.GOOGLE_CAL_ID || 'primary'


let jwtClient = new JWT({
  email: GOOGLE_CLIENT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes,
})

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return
  } else {
    console.log("Successfully connected to googleapi via JWT!")
  }
})

type Data = {
  id: string|undefined|null,
  htmlLink: string|undefined|null,
  kind: string|undefined|null,
  status: string|undefined|null,
  message: any,
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // console.log(req.method)
  if(req.method === 'POST'){
    const event = req.body
    // console.log({event})
    
    let calendar = google.calendar('v3')
    
    try {
      const response = await calendar.events.insert({
        auth: jwtClient,
        calendarId: GOOGLE_CAL_ID,
        requestBody: event,
      })
      res.status(response.status).json({ 
        id: response.data.id,
        htmlLink: response.data.htmlLink, 
        kind: response.data.kind,
        status: response.data.status,
        message: response.statusText, 
      })
      
    } catch (err:any) {
      console.log('Google Cal API Error: ' + err)

      res.status(201).json({ 
        id: undefined,
        htmlLink: undefined, 
        kind: undefined,
        status: undefined,
        message: err.errors.map((err:any) =>  err.message).join(', ') 
      })
      
    }
  
    // calendar.events.list({
    //   auth: jwtClient,
    //   calendarId: GOOGLE_CAL_ID
    // }, function (err, response) {
  
    //   if(response) {
    //     console.log('----- here is a list of events in this calendar ---- ');
        
    //     return console.log(response.data.items)
    //   };
    //   if(err) return console.log(err);
      
    // })

    // res.status(200).json({ message: 'default response' })
  }
}
