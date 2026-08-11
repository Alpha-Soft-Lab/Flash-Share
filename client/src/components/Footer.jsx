import appConfig from "../config/appConfig";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
                <p className="text-xs text-white/30">
                    © {year}  {appConfig.name}
                </p>

                <p className="text-xs font-medium tracking-wide text-white/30">
                     Powered by : {appConfig.Poweredby}
                </p>
            </div>
        </footer>
    );
};

export default Footer;

