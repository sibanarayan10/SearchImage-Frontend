import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { useState } from "react";
import BackToTop from "./Components/ToTop";
import { BeforeUpload } from "./Components/Upload";
import { HomePage } from "./Pages/Home";
import Auth from "./Pages/Auth";
import { ToastContainer } from "react-toastify";
import UserProfile from "./Components/UserProfile";

const App = () => {
  const [logout, setLogout] = useState(false);

  return (
    <div className="dark:bg-[#111111]">
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Navbar setLogout={setLogout} />
        <Routes>
          <Route path="/sign-up" element={<Auth mode="signup" />} />
          <Route path="/sign-in" element={<Auth mode="signin" />} />
          <Route
            path="/user"
            element={
              <HomePage
                key="search"
                backendApi={`${import.meta.env.VITE_BACKEND_URL}/images`}
              />
            }
          />

          <Route
            path="/"
            element={
              <HomePage
                key="home-root"
                backendApi={`${import.meta.env.VITE_BACKEND_URL}/images`}
              />
            }
          />
          <Route path="/user/upload" element={<BeforeUpload />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Routes>
        <BackToTop />
      </Router>
    </div>
  );
};

export default App;
