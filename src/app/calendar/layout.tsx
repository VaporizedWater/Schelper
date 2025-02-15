// import { CalendarProvider } from "@/components/CalendarContext/CalendarContext"

export default function Layout({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="w-full h-full">
            <div className="">{modals}</div>
            <div className="w-full h-full">{children}</div>
        </div>
    )
}