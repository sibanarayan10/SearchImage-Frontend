import React, {
  useRef,
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Link, useNavigate } from "react-router-dom";
import {
  LoaderCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
        newErrors.name = "Full name is required";
      } else if (!/^[A-Za-z\s]+$/.test(v.name)) {
        newErrors.name = "Only letters and spaces are allowed";
      }

      if (!v.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!v.password.trim()) {
        newErrors.password = "Password is required";
      } else if (v.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      }

      if (v.confirm_password !== v.password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    } else {
      const v = currentValues as SignInValues;

      if (!v.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!v.password.trim()) {
        newErrors.password = "Password is required";
      } else if (v.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
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
        if (mode === "signin") {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data || { authenticated: true })
          );
          toast.success("Signed in successfully!");
          navigate("/");
        } else {
          toast.success("Account created successfully! Please sign in.");
          navigate("/sign-in");
        }
      } else {
        const msg: string = response.data?.message ?? "";
        const [type, text] = msg.split(",");
        if (type && text) {
          setError((prev) => ({ ...prev, [type]: text }));
        } else {
          toast.error(msg || "Authentication failed. Please check your credentials.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
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

  /* ─── Field Helpers ─────────────────────────────────────────── */
  const getFieldIcon = (field: string) => {
    switch (field) {
      case "name":
        return <User size={18} className="text-black/40 dark:text-white/40" />;
      case "email":
        return <Mail size={18} className="text-black/40 dark:text-white/40" />;
      case "password":
      case "confirm_password":
        return <Lock size={18} className="text-black/40 dark:text-white/40" />;
      default:
        return null;
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case "name":
        return "Full Name";
      case "email":
        return "Email Address";
      case "password":
        return "Password";
      case "confirm_password":
        return "Confirm Password";
      default:
        return field;
    }
  };

  const getFieldPlaceholder = (field: string) => {
    switch (field) {
      case "name":
        return "Jane Doe";
      case "email":
        return "jane@example.com";
      case "password":
        return "Minimum 8 characters";
      case "confirm_password":
        return "Re-enter your password";
      default:
        return "";
    }
  };

  const fields = Object.keys(values) as Array<keyof SignUpValues>;

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((item) => {
          const isPasswordField = item.includes("password");
          const isConfirm = item === "confirm_password";
          const isVisible = isConfirm ? showConfirmPassword : showPassword;
          const toggleVisibility = isConfirm
            ? () => setShowConfirmPassword((v) => !v)
            : () => setShowPassword((v) => !v);

          const hasFieldError = Boolean(error[item] && touched[item]);

          return (
            <div key={item} className="space-y-1.5">
              <label
                htmlFor={item}
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {getFieldLabel(item)}
              </label>

              <div
                className={`relative flex items-center rounded-xl bg-black/5 dark:bg-white/5 border transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 ${
                  hasFieldError
                    ? "border-red-500/80 bg-red-500/5 dark:bg-red-500/5"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                <div className="pl-3.5 flex items-center pointer-events-none">
                  {getFieldIcon(item)}
                </div>

                <input
                  id={item}
                  name={item}
                  type={
                    isPasswordField
                      ? isVisible
                        ? "text"
                        : "password"
                      : item === "email"
                      ? "email"
                      : "text"
                  }
                  placeholder={getFieldPlaceholder(item)}
                  value={(values as unknown as Record<string, string>)[item] ?? ""}
                  onChange={handleOnChange}
                  className="w-full py-2.5 px-3 text-xs sm:text-sm bg-transparent text-zinc-900 dark:text-white placeholder-black/30 dark:placeholder-white/30 outline-none"
                />

                {isPasswordField && (
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="pr-3.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition"
                    tabIndex={-1}
                  >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>

              {hasFieldError && (
                <p className="text-[11px] text-red-500 dark:text-red-400 pl-1">
                  {error[item]}
                </p>
              )}
            </div>
          );
        })}

        {/* HCaptcha Centered */}
        <div className="flex justify-center pt-2 overflow-hidden">
          <HCaptcha
            sitekey="27886abc-deb0-4396-9004-19f20e6af368"
            onVerify={(t: string) => setToken(t)}
            onExpire={() => setToken(null)}
            ref={captchaRef}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01]"
        >
          {loading ? (
            <LoaderCircle className="animate-spin h-5 w-5 text-black" />
          ) : (
            <>
              <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4 w-full">
          <div className="flex-1 border-t border-black/10 dark:border-white/10" />
          <span className="px-3 text-[11px] font-medium tracking-wider text-black/40 dark:text-white/40 uppercase">
            OR
          </span>
          <div className="flex-1 border-t border-black/10 dark:border-white/10" />
        </div>

        {/* Switch Link */}
        <div className="text-center pt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {mode === "signup" ? (
            <span>
              Already have an account?{" "}
              <Link
                to="/sign-in"
                className="font-semibold text-emerald-500 hover:text-emerald-600 hover:underline transition"
              >
                Sign In
              </Link>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{" "}
              <Link
                to="/sign-up"
                className="font-semibold text-emerald-500 hover:text-emerald-600 hover:underline transition"
              >
                Sign Up for free
              </Link>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default Form;
