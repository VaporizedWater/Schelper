const Layout = ({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-white text-black dark:text-black">
            <div className="">{modals}</div>
            <div className="w-full h-full">{children}</div>
        </div>
    )
}

export default Layout;