const Footer = () => {
    return (
        <footer
            role="contentinfo"
            aria-label="Site footer"
            className="w-full bg-psublue dark:bg-zinc-800 p-5 text-white relative bottom-0 flex flex-row items-center gap-2"
        >
            <p>&copy; 2025</p>
            <div aria-label="Brand name">
                <p className="font-bold text-lg text-lightblue text-center p-1">Schelper</p>
            </div>
        </footer>
    );
};

export default Footer;
