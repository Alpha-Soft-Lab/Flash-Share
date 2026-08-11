import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import appConfig from "../config/appConfig";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-20">
        <section className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-white/30">
            Peer-to-peer file sharing
          </p>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Share files.
            <br />
            <span className="text-white/30">Simply.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
            {appConfig.name} lets you send files directly between devices.
            Fast, private, and without cloud storage.
          </p>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-5 sm:grid-cols-2">
          <button
            onClick={() => navigate("/send")}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
              <ArrowUpFromLine size={23} />
            </div>

            <h2 className="mt-10 text-2xl font-semibold">
              Send Files
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Create a room and share files with another device.
            </p>

            <span className="mt-8 block text-sm text-white/30 transition group-hover:text-white">
              Start sending →
            </span>
          </button>

          <button
            onClick={() => navigate("/receive")}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-left transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
              <ArrowDownToLine size={23} />
            </div>

            <h2 className="mt-10 text-2xl font-semibold">
              Receive Files
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Enter a room code and receive files directly.
            </p>

            <span className="mt-8 block text-sm text-white/30 transition group-hover:text-white">
              Start receiving →
            </span>
          </button>
        </section>

        <div className="mx-auto mt-12 flex max-w-4xl justify-center gap-5 text-[10px] uppercase tracking-[0.25em] text-white/20">
          <span>WebRTC</span>
          <span>•</span>
          <span>Peer to Peer</span>
          <span>•</span>
          <span>No Cloud</span>
        </div>
      </main>
    </div>
  );
};

export default Home;