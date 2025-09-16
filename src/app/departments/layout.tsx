const Layout = ({
    modals,
    children,
}: {
    modals: React.ReactNode
    children: React.ReactNode
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-dark text-gray-800 dark:text-gray-300">
            {/* Modal container with backdrop blur effect */}
            <div className="relative z-50">{modals}</div>

            {/* Main content with subtle gradient and border effects */}
            <div className="w-full h-full bg-white
                dark:bg-dark shadow-inner">
                {children}
            </div>
        </div>
    )
}

export default Layout;