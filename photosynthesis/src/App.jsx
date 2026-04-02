import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LeafyHome from "./pages/LeafyHome";
import PlantCapture from "./pages/PlantCapture";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeafyHome />} />
        <Route path="/capture" element={<PlantCapture />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
