import { useState } from 'react';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

export const  EventForm = () => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreateEvent = async (event:any) => {
    event.preventDefault();

    const eventDetails = {
      title,
      location,
      description,
      startDate,
      endDate,
    };

    // console.log({eventDetails})

    try{
      const res = await fetch(`/api/google/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
  
        body: JSON.stringify(eventDetails)
      })
      const data = await res.json()
      console.log('event insert patch res, ', data);
 
      // routerPush(`/planner/${query.id}`) 

    } catch (err){
      console.warn('event form error ',err);
    }
    
    

    // try {
    //   const response = await insertEvent(eventDetails);
    //   console.log('Event created:', response);
    // } catch (error) {
    //   console.error('Error creating event:', error);
    // }
  };

  return (<>
      
    <form onSubmit={handleCreateEvent}>
      <label>
        Title:
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <br />
      <label>
        Location:
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </label>
      <br />
      <label>
        Description:
        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <br />
      <label>
        Start date:
        <input
          type="datetime-local"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </label>
      <br />
      <label>
        End date:
        <input
          type="datetime-local"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </label>
      <br />
      <button type="submit">Create Event</button>
    </form>
  </>)
}