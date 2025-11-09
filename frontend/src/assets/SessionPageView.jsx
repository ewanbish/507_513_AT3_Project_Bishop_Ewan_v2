import { Fragment, useCallback, useEffect, useState } from "react";
import { fetchAPI } from "../api.mjs";
import { IoMdPersonAdd } from "react-icons/io";
function SessionPageView() {
  const [sessionsByDay, setSessionsByDay] = useState({
    Monday: [
      { id: 1, activity: "Math" },
      { id: 2, activity: "Math" },
    ],
    Tuesday: [{ id: 1, activity: "Math" }],
    Wednesday: [{ id: 1, activity: "Math" }],
    Thursday: [{ id: 1, activity: "Math" }],
    Friday: [{ id: 1, activity: "Math" }],
    Saturday: [{ id: 1, activity: "Math" }],
    Sunday: [{ id: 1, activity: "Math" }],
  });
  const [error, setError] = useState(null);

  // const getSessions = useCallback(() => {
  //   const today = new Date();

  //   const mondayOfThisWeek = new Date();
  //   mondayOfThisWeek.setDate(today.getDate() - (today.getDay() - 1));
  //   const startDate = toLocaleDateString(mondayOfThisWeek);
  //   const sundayOfThisWeek = new Date(mondayOfThisWeek);
  //   sundayOfThisWeek.setDate(sundayOfThisWeek.getDate() + 6);
  //   const endDate = toLocaleDateString(sundayOfThisWeek);

  //   fetchAPI("GET", `/session?start_date=${startDate}&end_date=${endDate}`)
  //     .then((response) => {
  //       if (response.status == 200) {
  //         if (response.body.length > 0) {
  //           setSessionsByDay(partitionByDay(response.body));
  //           setError(null);
  //         } else {
  //           setSessionsByDay({});
  //           setError("No sessions found...");
  //         }
  //       } else {
  //         setError(response.body.message);
  //       }
  //     })
  //     .catch((error) => {
  //       setError(error);
  //     });
  // }, [setSessionsByDay]);

  // // Fetch sales on first render
  // useEffect(() => {
  //   getSessions();
  // }, [getSessions]);

  return (
    <section className="flex flex-col items-center">
      {error && <span className="p-4 self-center">{error}</span>}
      {!error && Object.entries(sessionsByDay).length == 0 ? (
        <span className="loading loading-spinner loading-xl block m-4"></span>
      ) : (
        <ul className="list bg-base-100 self-stretch flex items-center justify-center">
          {Object.entries(sessionsByDay).map(([day, sessions]) => (
            <Fragment key={day}>
              <ul className="list bg-base-100 rounded-box shadow-md w-96 my-4">
                <li className="p-4 pb-2 text-s opacity-60 tracking-wide font-bold">
                  {day}
                </li>

                {sessions.map((session) => (
                  <li className="list-row" key={session.id}>
                    <div>
                      <div>{session.activity}</div>
                      <div className="text-xs uppercase font-semibold opacity-60">
                        test
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold opacity-60">
                        test
                      </div>
                    </div>
                    <button className="btn btn-square btn-primary">
                      <IoMdPersonAdd />
                    </button>
                  </li>
                ))}
              </ul>
              {/* <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                {day}
              </li>
              {sessions.map((session) => (
                <li key={session.id} className="list-row">
                  <div>
                    <MdFace className="size-10" />
                  </div>
                  <div>
                    <div>{session.activity}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">
                      test
                    </div>
                  </div>
                  <button className="btn btn-ghost text-xl">Buy</button>
                </li>
              ))} */}
            </Fragment>
          ))}
        </ul>
      )}
      <div className="mb-18"></div>
    </section>
  );
}

function toLocaleDateString(date) {
  const year = date.toLocaleString("en-AU", { year: "numeric" });
  const month = date.toLocaleString("en-AU", { month: "2-digit" });
  const day = date.toLocaleString("en-AU", { day: "2-digit" });

  return [year, month, day].join("-");
}

function partitionByDay(sessions) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayPartitions = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  for (const session of sessions) {
    const dayOfSession = daysOfWeek[new Date(session.date).getDay()];
    dayPartitions[dayOfSession].push(session);
  }

  return dayPartitions;
}

export default SessionPageView;
