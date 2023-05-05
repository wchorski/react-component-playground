import React from 'react'
import { google } from "googleapis";
import { oauth2 } from "googleapis/build/src/apis/oauth2";
import Link from 'next/link';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'NOCLIENTID'
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'NOCLIENTSECRET'
const REDIRECT_URI = 'http://localhost:3000/google/redirect'


// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
)

// const scopes = [
//   'https://www.googleapis.com/auth/calendar',
//   'https://www.googleapis.com/auth/calendar.events',
// ]

export default function calendar() {

  // const url = oAuth2Client.generateAuthUrl({
  //   access_type: 'offline',
  //   scope: scopes,
  // })
  const url = '/'
  
  return (<>
    <h1>calendar</h1>
    <Link href={url}/>
  </>)
}
