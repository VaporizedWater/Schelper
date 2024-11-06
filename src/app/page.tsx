// page.tsx
import React from 'react';
import { format, startOfWeek, addMinutes, addDays } from 'date-fns';

// Define a type for each time slot
interface TimeSlot {
  day: string;
  time: string;
  intervalId: string;
}

// Define types for the days and intervals
type DaySlot = {
  [key: string]: string[]; // Each day has an array of intervals
};

// Function to generate the week data
function generateWeek(): DaySlot {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Week starts on Monday
  const days: DaySlot = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  };

  Object.keys(days).forEach((day, i) => {
    const currentDay = addDays(start, i);
    for (let minute = 0; minute < 24 * 60; minute += 15) {
      const time = addMinutes(currentDay, minute);
      days[day].push(format(time, 'HH:mm'));
    }
  });

  return days;
}

// React functional component to render the calendar
export default function CalendarPage() {
  const days = generateWeek();

  // Get the first day's intervals to establish row count
  const intervals = days[Object.keys(days)[0]];

  return (
    <div>
      <h1>Weekly Calendar</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {Object.keys(days).map(day => (
              <th key={day} style={{ border: '1px solid black', padding: '8px', backgroundColor: '#f3f3f3' }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intervals.map((time, index) => (
            <tr key={index}>
              {Object.keys(days).map(day => (
                <td key={day + time} style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>
                  {time}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
