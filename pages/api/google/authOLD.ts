// cred - https://www.youtube.com/watch?v=kNwCT5PN93k
import type { NextApiRequest, NextApiResponse } from 'next'
import { google } from "googleapis";
import { oauth2 } from "googleapis/build/src/apis/oauth2";

type Data = {
  name: string
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'NOCLIENTID'
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'NOCLIENTSECRET'
const REDIRECT_URI = process.env.REDIRECT_URI || "no_redirect_uri"


// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI,
)

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  res.redirect(url)
  
  res.status(200).json({ name: 'googleCaliThink' })
}
