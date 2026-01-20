import React, { useRef } from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

function Form({ mode }) {
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState("auth/user/sign-up");
  const [token, setToken] = useState(null);
  const captchaRef = useRef(null);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.keys(touched).map((item) => {
      touched[item] = true;
    });
    validateValues();

    const hasError = Object.values(error).some((item) => Boolean(item));
    if (hasError) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`,
        { ...values, token },
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status > 0,
        }
      );

      if (response.status >= 200 && response.status <= 300) {
        setLoading(false);

        if (mode == "signup") {
          navigate("auth/sign-in");
        } else {
          localStorage.setItem("profileImg", response.data?.user?.imgUrl || "");
          localStorage.setItem("user", response?.data?.user?.name || "");
          navigate("/");
        }
      } else if (response.status > 300) {
        setLoading(false);
        const msg = response.data.message;

        const type = msg.split(",")[0];
        const text = msg.split(",")[1];
        setError((prev) => ({ ...prev, [type]: text }));
      }
    } catch (error) {
      setLoading(false);

      console.error(error);
    }
  };
  const validateValues = () => {
    let newErrors = {};
    if (mode == "signup") {
      if (!values.name.trim()) {
        newErrors.name = "Required";
      } else if (!/^[A-Za-z\s]+$/.test(values.fullname)) {
        newErrors.name = "Only letters are allowed";
      }

      if (!values.email.trim()) {
        newErrors.email = "Required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        newErrors.email = "Invalid email address";
      }

      if (!values.password.trim()) {
        newErrors.password = "Required";
      } else if (values.password.length < 8) {
        newErrors.password = "Password should be at least 8 characters long";
      }

      if (values["confirm_password"] !== values.password) {
        newErrors["confirm_password"] = "Passwords do not match";
      }
    } else {
      if (!values.email.trim()) {
        newErrors.email = "Required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        newErrors.email = "Invalid email address";
      }
      if (!values.password.trim()) {
        newErrors.password = "Required";
      } else if (values.password.length < 8) {
        newErrors.password = "Password should be at least 8 characters long";
      }
    }
    setError(newErrors);
  };

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState(values);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm_password: "",
  });
  const handleOnChange = (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;

    setValues((prev) => ({ ...prev, [inputName]: inputValue }));
    setTouched((prev) => ({ ...prev, [inputName]: true }));
  };
  useEffect(() => {
    const initialValues =
      mode == "signup"
        ? {
            name: "",
            email: "",
            password: "",
            confirm_password: "",
          }
        : {
            email: "",
            password: "",
          };
    setValues(initialValues);
    setError(initialValues);
    setTouched((prev) => ({
      name: false,
      email: false,

      password: false,
      confirm_password: "",
    }));
    if (mode === "signup") {
      setEndpoint("auth/user/sign-up");
    } else {
      setEndpoint("auth/user/sign-in");
    }
  }, [mode]);

  useEffect(() => {
    validateValues();
  }, [values]);
  return (
    <div className="flex flex-col items-center justify-center w-full px-2">
      <form
        action=""
        encType="application/json"
        className="flex flex-col items-center justify-center gap-y-4 min-[800px]:w-2/3 w-full rounded-lg bg-black/15 dark:bg-white/5 p-4 min-w-[300px] drop-shadow-lg "
        onSubmit={handleSubmit}
      >
        {Object.keys(values).map((item, index) => (
          <div
            className="flex flex-col justify-start gap-y-1 w-full "
            key={index}
          >
            <label htmlFor={item} className="capitalize dark:text-white">
              {item == "confirm_password" ? "Confirm Password" : item}
            </label>
            <input
              type={item.includes("password") ? "password" : item}
              placeholder={item}
              name={item}
              className={`w-full font-medium px-4 py-3 rounded-lg dark:text-white dark:bg-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 border ${
                error[item] && touched[item]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onChange={handleOnChange}
              value={values[item]}
            />
            {error[item] && touched[item] && (
              <span className="text-red-500 text-xs">{error[item]}</span>
            )}
          </div>
        ))}

        <HCaptcha
          sitekey="27886abc-deb0-4396-9004-19f20e6af368"
          onVerify={(token) => setToken(token)}
          onExpire={() => setToken(null)}
          ref={captchaRef}
        />

        <div className="relative p-[3px] bg-gradient-to-r from-blue-500 to-green-500 rounded-lg transition-all duration-300">
          <button
            type="submit"
            className="bg-white py-2 px-4 rounded-lg cursor-pointer text-center flex justify-center hover:bg-white/80 transition-all duration-300"
          >
            {loading ? (
              <LoaderCircle className="animate-spin h-6 w-6 text-secondary" />
            ) : mode == "signup" ? (
              "Explore More"
            ) : (
              "Welcome Back"
            )}
          </button>
        </div>

        <p className="w-full text-center dark:text-white">
          ------- Or --------
        </p>
        <p className="text-[15px] dark:text-white">
          {mode == "signup"
            ? "Already have an account ?"
            : "Don't have an account ?"}{" "}
          <Link
            className="hover:underline underline-offset-4 text-primary hover:text-secondary cursor-pointer transition-all duration-300"
            to={mode == "signup" ? "/sign-in" : "/sign-up"}
          >
            {mode == "signup" ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Form;
