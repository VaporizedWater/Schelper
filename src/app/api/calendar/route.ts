//the calendar data just needs to store the date of the Monday that the first week starts for a particular semester.
//This will be the Monday that is the date that the FullCalendar component uses as a "base" date, with subsequent days
//being Monday +1, +2, +3, +4, till you get to Friday.

//With this, you could technically even go to previous semesters without navigating through a menu, just by using the calendar controls

export async function GET(request: Request) {
    console.log(request);
}

export async function POST(request: Request) {
    console.log(request);
}