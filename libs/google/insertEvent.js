import { google } from 'googleapis';
// import auth from './auth';
import authorize from './authJWT';

const GOOGLE_CAL_ID = process.env.GOOGLE_CAL_ID || 'primary'

const event3 = {
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

export async function insertEvent(event) {
  console.log('heyyyyyy')
  const calendar = await authorize();
  // console.log({event})

  try {
    const response = await calendar.events.insert({
      calendarId: GOOGLE_CAL_ID, 
      requestBody: event3,
    });
    
    console.log({response})

  } catch (error) {
    console.log('insertEvent Error, ', error);
  }

}
