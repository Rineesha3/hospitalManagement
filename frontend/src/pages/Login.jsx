import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config.js";
import { toast } from "react-toastify";
import { authContext } from "../context/authContext.jsx";
import HashLoader from "react-spinners/HashLoader.js";
import { FiEye, FiEyeOff } from "react-icons/fi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useContext(authContext);
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: result.data,
          token: result.token,
          role: result.role,
        },
      });
      console.log(result,'login data')
      setLoading(false);
      toast.success(result.message);
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };
  return (
    <section
     className="px-5 lg:px-0">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
          Hello! <span className="text-primaryColor">Welcome</span> Back 🎉
        </h3>
        <form className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-2 py-3 border-b border-solid ${errors.email ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
            />
            {errors.email && <p className="text-red-500 text-[13px] mt-1">{errors.email}</p>}
          </div>
          <div className="mb-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-2 pr-10 py-3 border-b border-solid ${errors.password ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-textColor"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[13px] mt-1">{errors.password}</p>}
          </div>
          <div className="mt-7">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3 flex items-center justify-center"
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : "Login"}
            </button>
          </div>
          <p className="mt-5 text-textColor text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primaryColor font-medium ml-1">
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
