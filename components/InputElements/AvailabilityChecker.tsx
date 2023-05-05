import { useRef, useState } from "react";
import { dateCheckAvailable } from "../../libs/dateCheck";

type FormVals = {
  date: string,
  durationInHours: string,
}

const vacationDays = [
  {
    dateTime: "2023-05-01T05:00:00Z",
    durationInHours: "24"
  },
  {
    dateTime: "2023-05-02T05:00:00Z",
    durationInHours: "12"
  },
  {
    dateTime: "2023-06-01T05:00:00Z",
    durationInHours: "24"
  },
  {
    dateTime: "2023-06-02T05:00:00Z",
    durationInHours: "24"
  },
  {
    dateTime: "2023-06-03T05:00:00Z",
    durationInHours: "24"
  },
];

export function AvailabilityChecker() {

  const inputRangeRef = useRef<HTMLInputElement>(null)
  const [hoursSliderVal, setHoursSliderVal] = useState('.25')
  const [message, setMessage] = useState("");
  const [formValues, setformValues] = useState<FormVals>({
    date: '',
    durationInHours: '',
  });

  function handleSubmit(e:any) {
    e.preventDefault();
    const { date, durationInHours} = formValues
    // console.table(formValues)
    if(!durationInHours.match(/^[0-9]+(\.[0-9]+)?$/)) return setMessage('Hours must only contain numbers "0-9" and one decimal "." ')
    
    dateCheckAvailable(date, durationInHours, vacationDays)
      ? setMessage('Date is Available')
      : setMessage('CONFLICT was found');
  }

  const handleChange = (event:any) => {
    setformValues({ ...formValues, [event.target.name]: event.target.value });
  }


  return (
    <div className="App">
      <h1> Does date picked overlap vacation date? </h1>

      <section>
        <h2>Vacation Days</h2>
        <ul className="vacation-days">
          {vacationDays.map((day) => (
            <li key={day.dateTime}>
              {prettyDate(day.dateTime)} <br />
              {day.durationInHours} hours 
            </li>
          ))}
        </ul>
      </section>

      <section>
        <form onSubmit={handleSubmit} className="date-picker">
          <label>
            Date Picked
            <input type="datetime-local" name="date" value={formValues.date} onChange={handleChange} required/>
          </label>
          <br />

          <label>
            Duration in Hours
            <input type="range" min={.25} max={24} step={.25} name="durationInHours" value={formValues.durationInHours} required ref={inputRangeRef} 
              onChange={(e) => {
                handleChange(e)
                setHoursSliderVal(String(e.target.value))
              }}
            />
            <span>{hoursSliderVal} hours </span>
          </label>
          <br />

          <button type="submit">check date</button>
        </form>
      </section>

      <p>Message: {message}</p>
    </div>
  );
}


function prettyDate(dateISO:string){

  const realDate = new Date(dateISO)

  return realDate.toLocaleDateString('en-US', 
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
      // daySuffix: 'ordinal'
    }
  )
}