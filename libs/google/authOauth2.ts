import { google } from 'googleapis';
import credentials from '../../private/credentials.json';

const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id, client_secret, redirect_uris[0]
);

export default async function authorize() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });

  console.log(`Authorize this app by visiting this URL: ${authUrl}`);

  const code = ''; // TODO: Enter the authorization code from the URL
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  return oAuth2Client;
}
