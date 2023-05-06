import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const scopes = ['https://www.googleapis.com/auth/calendar'];
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || 'no_google_api_key'
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || 'no-client-email'

let jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  // null,
  GOOGLE_PRIVATE_KEY,
  'https://www.googleapis.com/auth/calendar'
);
//authenticate request
jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!")
  }
})

// const client = new JWT({
//   email: GOOGLE_CLIENT_EMAIL,
//   key: GOOGLE_PRIVATE_KEY,
//   scopes,
// })

async function authorize() {
  await client.authorize();
  return google.calendar({ version: 'v3', auth: client });
}

module.exports = authorize;
