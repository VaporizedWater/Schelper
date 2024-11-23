const CalendarNav = () => {
    const listString: string = "px-4 py-1 opacity-70 hover:opacity-100 duration-50 bg-newblue rounded-lg text-white";

    return (
        <ul className="flex flex-row p-1 gap-2 border-2 border-rounded-lg pl-4">
            <li key={1} className={listString}>
                <button onClick={() => { console.log("hi") }}>New Class</button>
            </li>
            <li key={2} className={listString}>
                <button onClick={() => { console.log("hi") }}>New Tag</button>
            </li>
            <li key={3} className={listString}>
                <button onClick={() => { console.log("hi") }}>New Event</button>
            </li>
        </ul>
    );
}

export default CalendarNav;