import { ClassProvider } from "@/components/ClassContext/ClassContext"

export default function Layout({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <ClassProvider>
            <div>{modals}</div>
            <div>{children}</div>
        </ClassProvider>
    )
}