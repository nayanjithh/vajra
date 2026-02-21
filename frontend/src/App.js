import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import HomePage from "./components/Homepage/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;