// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
// import { oauth2 } from "googleapis/build/src/apis/oauth2";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'NOCLIENTID'
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'NOCLIENTSECRET'
const REDIRECT_URI = process.env.REDIRECT_URI || "no_redirect_uri"
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'no-google-api-key'


type Data = {
  name: string,
  message: string,
}

const credentials = {

}

const oAuth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
)

const calendar = google.calendar({
  version: 'v3',
  auth: oAuth2Client,
})


const event = {
  'summary': 'Google I/O 2015',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2023-05-28T09:00:00-07:00',
    'timeZone': 'America/Chicago',
  },
  'end': {
    'dateTime': '2023-05-28T17:00:00-07:00',
    'timeZone': 'America/Chicago',
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  // 'attendees': [
  //   {'email': 'lpage@example.com'},
  //   {'email': 'sbrin@example.com'},
  // ],
  // 'reminders': {
  //   'useDefault': false,
  //   'overrides': [
  //     {'method': 'email', 'minutes': 24 * 60},
  //     {'method': 'popup', 'minutes': 10},
  //   ],
  // },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const code = req.query.code
  // console.log({code})
  
  // @ts-ignore
  const {tokens} = await oAuth2Client.getToken(code)
  // console.log({tokens})

  console.log({oAuth2Client});
  

  await calendar.events.insert({
    auth: oAuth2Client,
    calendarId: 'primary',
    // resource: event,
    requestBody: {
      summary: 'summary of event',
      description: 'description of event', 
      start: {
        dateTime: '2023-05-28T09:00:00-07:00',
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: '2023-05-28T17:00:00-07:00',
        timeZone: 'America/Chicago',
      },
    }
  }, function(err:any, event:any) {
    if (err) {
      console.log(':<<<<< There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event?.htmlLink);
  })
  

  
  res.status(200).json({ 
    name: 'google redirect worked success', 
    message: 'lol',
  })
  // res.redirect(200, '/google/redirect')
}
