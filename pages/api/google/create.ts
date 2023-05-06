// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
// import {insertEvent} from '../../../libs/google/insertEvent';

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import creds from "../../../private/cutefruit-project.json";

const scopes = ['https://www.googleapis.com/auth/calendar'];
// const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || 'NO_KEY_SET'
// const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || 'NO_EMAIL_SET'
const GOOGLE_PRIVATE_KEY = creds.private_key|| 'NO_KEY_SET'
const GOOGLE_CLIENT_EMAIL = creds.client_email || 'NO_EMAIL_SET'
// const GOOGLE_CAL_ID = process.env.GOOGLE_CAL_ID || 'primary'
const GOOGLE_CAL_ID = 'primary'

let jwtClient = new JWT({
  email: GOOGLE_CLIENT_EMAIL,
  key: GOOGLE_PRIVATE_KEY,
  scopes,
})

//authenticate request
jwtClient.authorize(function (err, tokens) {
  console.log('JWT AUTHORIZATION');
  
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!")
  }
})

type Data = {
  name: string,
  data: any,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  console.log(req.method)

  // console.log(req.body)

  const event = req.body

 
  // const response = await insertEvent(event)
  let calendar = google.calendar('v3')
  calendar.events.insert({
    auth: jwtClient,
    calendarId: 'primary',
    requestBody: {
      'summary': 'Event 3',
      'description': 'Sample description',
      'start': {
        'dateTime': '2023-05-03T00:00:00',
        'timeZone': 'America/Chicago',
      },
      'end': {
        'dateTime': '2023-05-03T01:00:00',
        'timeZone': 'America/Chicago',
      },
    },
  }, function(err, res) {
    if (err) {
      console.log('Error: ' + err);
      return;
    }
    console.log(res?.status);
  })

  calendar.events.list({
    auth: jwtClient,
    calendarId: GOOGLE_CAL_ID
  }, function (err, response) {

    if(response) {
      console.log('----- here is responses ---- ');
      
      return console.log(response.data.items)
    };
    if(err) return console.log(err);
    
  });

  // const response = await insertEvent(event)
    

  
  
  res.status(200).json({ name: 'cal event created', data: 'heyyy' })
}
