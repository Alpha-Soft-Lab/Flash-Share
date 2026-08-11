import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/send" element={<Send />} />
          <Route path="/receive" element={<Receive />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;