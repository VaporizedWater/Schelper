import Link from 'next/link'

export default function Layout({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <>
            <div>{modals}</div>
            <div>{children}</div>
        </>
    )
}