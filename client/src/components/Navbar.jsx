import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import appConfig from "../config/appConfig";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-white/10 bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Zap size={18} />
          </div>

          <span className="text-sm font-semibold tracking-[0.2em]">
           {appConfig.name}
          </span>
        </button>

        <div className="flex items-center gap-6 text-sm text-white/50">
          <button
            onClick={() => navigate("/send")}
            className="transition hover:text-white"
          >
            Send
          </button>

          <button
            onClick={() => navigate("/receive")}
            className="transition hover:text-white"
          >
            Receive
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;