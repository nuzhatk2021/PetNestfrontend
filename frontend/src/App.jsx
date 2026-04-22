import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Pets from "./pages/Pets";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;