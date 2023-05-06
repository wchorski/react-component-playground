import {EventForm} from '../../components/google/EventForm'
import { AddToCalendarButton } from 'add-to-calendar-button-react'
import React from 'react'

export default function EventPage() {
  return (
    <div>
      <h1>Google Event Page</h1>
      <AddToCalendarButton
        name="Test-Event by meeeee"
        startDate="2023-05-22"
        options={['Apple','Google','Yahoo','iCal']}
      ></AddToCalendarButton>
    
      <EventForm />
    </div>
  )
}
