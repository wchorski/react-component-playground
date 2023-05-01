export function dateCheckAvail(inputDateTime, inputDuration, vacayDateTime, vacayDuration){

  const vacationStart = new Date(vacayDateTime)
  const vacationDurationMs = Number(vacayDuration) * 60 * 60 * 1000;
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
