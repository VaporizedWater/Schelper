// type TimeSlot = {
//     timeSlot: string
// }

// export function TimeBlock(props: TimeSlot) {
//     return (
//         <div className="flex flex-col items-center">
//             <div className="min-h-10 border-x border-b border-gray w-full text-center">{props.timeSlot}</div>
//             <div className="min-h-10 border-dashed border-x border-b border-gray w-full"></div>
//         </div>
//     );
// }

// const TimeDisplay = () => {
//     return (
//         <ul className="flex flex-col min-w-14">
//             {Array.from({ length: 24 }, (_, i) => (
//                 <li key={i}>
//                     <TimeBlock timeSlot={`${i % 12 || 12} ${i < 12 ? "AM" : "PM"}`} />
//                 </li>
//             ))}
//         </ul>
//     )
// }

// export default TimeDisplay;