import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import api from "../config/Security";

/* ─── Types ─────────────────────────────────────────────────────── */
type Mode = "signup" | "signin";

interface SignUpValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface SignInValues {
  email: string;
  password: string;
}

type FormValues = SignUpValues | SignInValues;
type FormErrors = Partial<Record<keyof SignUpValues, string>>;
type FormTouched = Partial<Record<keyof SignUpValues, boolean>>;

interface FormProps {
  mode: Mode;
}

/* ─── Component ─────────────────────────────────────────────────── */
function Form({ mode }: FormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>("auth/user/sign-up");
  const [token, setToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const navigate = useNavigate();

  const getInitialValues = (m: Mode): FormValues =>
    m === "signup"
      ? { name: "", email: "", password: "", confirm_password: "" }
      : { email: "", password: "" };

  const [values, setValues] = useState<FormValues>(getInitialValues(mode));
  const [error, setError] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  /* ─── Validation ─────────────────────────────────────────────── */
  const validateValues = (currentValues: FormValues = values): FormErrors => {
    const newErrors: FormErrors = {};

    if (mode === "signup") {
      const v = currentValues as SignUpValues;

      if (!v.name.trim()) {
        newErrors.name = "Required";
      } else if (!/^[A-Za-z\s]+$/.test(v.name)) {
        newErrors.name = "Only letters are allowed";
      }

      if (!v.email.trim()) {
        newErrors.email = "Required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.email)) {
        newErrors.email = "Invalid email address";
      }

      if (!v.password.trim()) {
        newErrors.password = "Required";
      } else if (v.password.length < 8) {
        newErrors.password = "Password should be at least 8 characters long";
      }

      if (v.confirm_password !== v.password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    } else {
      const v = currentValues as SignInValues;

      if (!v.email.trim()) {
        newErrors.email = "Required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.email)) {
        newErrors.email = "Invalid email address";
      }

      if (!v.password.trim()) {
        newErrors.password = "Required";
      } else if (v.password.length < 8) {
        newErrors.password = "Password should be at least 8 characters long";
      }
    }

    setError(newErrors);
    return newErrors;
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched = Object.keys(values).reduce<FormTouched>(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const currentErrors = validateValues();
    const hasError = Object.values(currentErrors).some(Boolean);
    if (hasError) return;

    try {
      setLoading(true);
      const response = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/${endpoint}`,
        { ...values, token },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          validateStatus: (status) => status > 0,
        }
      );

      if (response.status >= 200 && response.status <= 300) {
        navigate(mode === "signup" ? "/sign-in" : "/");
      } else {
        const msg: string = response.data?.message ?? "";
        const [type, text] = msg.split(",");
        if (type && text) {
          setError((prev) => ({ ...prev, [type]: text }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Effects ────────────────────────────────────────────────── */
  useEffect(() => {
    setValues(getInitialValues(mode));
    setError({});
    setTouched({});
    setEndpoint(mode === "signup" ? "auth/user/sign-up" : "auth/user/sign-in");
  }, [mode]);

  useEffect(() => {
    validateValues();
  }, [values]);

  /* ─── Field config ───────────────────────────────────────────── */
  const fields = Object.keys(values) as Array<keyof SignUpValues>;

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center justify-center w-full px-2">
      <form
        encType="application/json"
        className="flex flex-col items-center justify-center gap-y-4 min-[800px]:w-2/3 w-full rounded-lg bg-black/15 dark:bg-white/5 p-4 min-w-[300px] drop-shadow-lg"
        onSubmit={handleSubmit}
      >
        {fields.map((item, index) => (
          <div
            className="flex flex-col justify-start gap-y-1 w-full"
            key={index}
          >
            <label htmlFor={item} className="capitalize dark:text-white">
              {item === "confirm_password" ? "Confirm Password" : item}
            </label>
            <input
              id={item}
              type={
                item.includes("password")
                  ? "password"
                  : item === "email"
                  ? "email"
                  : "text"
              }
              placeholder={item}
              name={item}
              className={`w-full font-medium px-4 py-3 rounded-lg dark:text-white dark:bg-white/10 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 border ${
                error[item] && touched[item]
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onChange={handleOnChange}
              value={(values as unknown as Record<string, string>)[item] ?? ""}
            />
            {error[item] && touched[item] && (
              <span className="text-red-500 text-xs">{error[item]}</span>
            )}
          </div>
        ))}

        <HCaptcha
          sitekey="27886abc-deb0-4396-9004-19f20e6af368"
          onVerify={(t: string) => setToken(t)}
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
            ) : mode === "signup" ? (
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
          {mode === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <Link
            className="hover:underline underline-offset-4 text-primary hover:text-secondary cursor-pointer transition-all duration-300"
            to={mode === "signup" ? "/sign-in" : "/sign-up"}
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Form;
