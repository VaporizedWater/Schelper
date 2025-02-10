import { CalendarProvider } from "@/components/CalendarContext/CalendarContext"

export default function Layout({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <CalendarProvider>
            <div>{modals}</div>
            <div>{children}</div>
        </CalendarProvider>
    )
}