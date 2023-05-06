import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { useEffect } from 'react';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'NOCLIENTID'
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'NOCLIENTSECRET'
const REDIRECT_URI = process.env.REDIRECT_URI || "no_redirect_uri"

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

const event = {
  summary: 'test',
  location: '800 Howard St., San Francisco, CA 94103',
  description: 'A chance to hear more about Google\'s developer products.',
  start: {
    dateTime: '2023-05-28T09:00:00-07:00',
    timeZone: 'America/Chicago',
  },
  end: {
    dateTime: '2023-05-28T17:00:00-07:00',
    timeZone: 'America/Chicago',
  },
}


// async function createEvent(event) {
//   const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//   const calendarEvent = {
//     summary: event.summary,
//     location: event.location,
//     description: event.description,
//     start: {
//       dateTime: event.startDateTime,
//       timeZone: event.timeZone,
//     },
//     end: {
//       dateTime: event.endDateTime,
//       timeZone: event.timeZone,
//     },
//   };

//   try {
//     const response = await calendar.events.insert({
//       calendarId: 'primary',
//       resource: calendarEvent,
//     });

//     console.log(response.data);

//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// }

export default function MyComponent() {
  // async function handleCreateEvent() {
  //   const event = {
  //     summary: 'My Event',
  //     location: '123 Main St, Anytown, USA',
  //     description: 'This is my event',
  //     startDateTime: '2023-05-07T10:00:00-07:00',
  //     endDateTime: '2023-05-07T11:00:00-07:00',
  //     timeZone: 'America/Los_Angeles',
  //   };

  //   const response = await createEvent(event);

  //   console.log(response);
  // }

  return (<>
    <p>hey</p>
    {/* <button onClick={handleCreateEvent}>Create Event</button> */}
  </>
  );
}