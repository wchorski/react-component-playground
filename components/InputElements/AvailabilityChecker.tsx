import { useState } from "react";

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
    

    const inputDate = new Date(date)
    const durationMs = Number(durationInHours) * 60 * 60 * 1000
    const endDate = new Date(inputDate.getTime() + durationMs)

    for (let i = 0; i < vacationDays.length; i++) {
      const vacationStart = new Date(vacationDays[i].dateTime)
      const vacationDurationMs = Number(vacationDays[i].durationInHours) * 60 * 60 * 1000;
      const vacationEnd = new Date( vacationStart.getTime() + vacationDurationMs)

      // console.table({
      //   inputDate,
      //   endDate,
      //   vacationStart,
      //   vacationEnd,
      // })

      switch (true) {
        case (inputDate < vacationEnd):
          setMessage("Selected date period OVERLAPS with an existing vacation day")
          break;
        case (endDate > vacationStart):
          setMessage("Selected vacation period is available")
          break;
        default:
          setMessage("DEFAULT: Selected date period OVERLAPS with an existing vacation day");
          break;
      }
    }
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
            <input type="text" name="durationInHours" value={formValues.durationInHours} onChange={handleChange} required/>
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