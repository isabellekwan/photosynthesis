import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LeafyHome from "./pages/LeafyHome";
import PlantCapture from "./pages/PlantCapture";
import LeafyChat from "./pages/LeafyChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeafyHome />} />
        <Route path="/capture" element={<PlantCapture />} />
        <Route path="/chat" element={<LeafyChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
