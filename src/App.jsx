import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import useApi from "./Hooks/useApi";
import { useState } from "react";
import BackToTop from "./Components/ToTop";
import { BeforeUpload } from "./Components/Upload";
import { HomePage } from "./Pages/Home";
import Auth from "./Pages/Auth";
import { ToastContainer } from "react-toastify";
import Dashboard from "./Components/Dashboard";
import EditProfile from "./Components/EditProfile";

const App = () => {
  const [logout, setLogout] = useState(false);

  const { response: data } = useApi(
    `${import.meta.env.VITE_BACKEND_URL}/user/images`
  );

  return (
    <div className="dark:bg-[#111111]">
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Navbar setLogout={setLogout} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
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
        </Routes>
        <BackToTop />
      </Router>
    </div>
  );
};

export default App;
