// cred - https://dev.to/pedrohase/create-google-calender-events-using-the-google-api-and-service-accounts-in-nodejs-22m8#:~:text=Setup%201%20Go%20to%20the%20Google%20Cloud%20Console,permissions%20to%20%22Make%20changes%20to%20events%22%29%20More%20items
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import creds from "../../private/cutefruit-project.json";
// const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || 'NO_KEY_SET'
// const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || 'NO_EMAIL_SET'
const GOOGLE_PRIVATE_KEY = creds.private_key|| 'NO_KEY_SET'
const GOOGLE_CLIENT_EMAIL = creds.client_email || 'NO_EMAIL_SET'
const CAL_ID = 'primary'
// const CAL_ID = '9d65e7818e35deef745491be0f97859a6c0139ced057742ce4e8fe2118d7faf4@group.calendar.google.com'

type GEvent = {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders: {
    useDefault: boolean;
    overrides: [{ method: 'popup' | 'email'; minutes: number }] ;
  };
  attendees: [{ email: string; comment: string }];
  sendUpdates: 'all' | 'externalOnly' | 'none';
}

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  console.log('----- whut is up fam ---- ')

  createGEvent({
    summary: 'my summary',
    description: 'my desc',
    start: {
      dateTime: '2023-05-26T00:00:00',
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: '2023-05-26T12:00:00',
      timeZone: 'America/Chicago'
    },
    // @ts-ignore
    reminders: {
      useDefault: true,
      // overrides: [
      //   {
      //     method: 'popup',
      //     minutes: 1,
      //   }
      // ]
    },
    // attendees: [
    //   { email: 'cutefruit88@gmail.com', comment: 'my comment'},
    // ],
    sendUpdates: 'all',
  })
  
  res.status(200).json({ name: 'google cal ' })
}

// const createGEvent = async (gEvent: GEvent) => {
//   // create client that we can use to communicate with Google 
//   const client = new JWT({
//     email: GOOGLE_CLIENT_EMAIL,
//     key: GOOGLE_PRIVATE_KEY,
//     scopes: [ // set the right scope
//       'https://www.googleapis.com/auth/calendar',
//       'https://www.googleapis.com/auth/calendar.events',
//     ],
//   });

//   const calendar = google.calendar({ version: 'v3' });

//   // We make a request to Google Calendar API.

//   try {
//     const res = await calendar.events.insert({
//       calendarId: CAL_ID,
//       auth: client,
//       requestBody: gEvent,
//     });
//     return res.data.htmlLink;
//   } catch (error) {
//     throw new Error(`Could not create Google event: ${error}`)
//   }
// }


const createGEvent = async (gEvent: GEvent) => {

  // configure a JWT auth client
  const jwtClient = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ]
  });
  
  // authenticate request
  jwtClient.authorize(async function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }
  
    // make an authorized request to the Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: jwtClient });

    calendar.events.insert({
      auth: jwtClient,
      calendarId: CAL_ID,
      requestBody: gEvent,
    }, (err:any, res:any) => {
      if (err) return console.log('Error creating event: ' + err);
      console.log('Google Event created: %s', res?.data);
    });

    // calendar.events.list({
    //   calendarId: CAL_ID,
    //   timeMin: (new Date()).toISOString(),
    //   maxResults: 10,
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // }, (err, res) => {
    //   if (err) return console.log('The API returned an error: ' + err);
    //   const events = res?.data.items;
  
    //   if (events?.length) {
    //     console.log('Upcoming 10 events:');
    //     events.map((event, i) => {
    //       const start = event?.start?.dateTime || event?.start?.date;
    //       console.log(`${start} - ${event.summary}`);
    //     });
    //   } else {
    //     console.log('No upcoming events found.');
    //   }
    // });
  });
}
