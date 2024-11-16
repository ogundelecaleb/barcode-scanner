import { Sms, User } from "iconsax-react";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import PasswordField from "./components/PasswordField";
import InputField from "./components/InputField";
import AuthButton from "./components/AuthButton";
import { ClipLoader } from "react-spinners";
import api from "./api";
import { setUserData } from "./utils/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  // const btnDisabled = !email || !password;
  async function login(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.signIn({
        email,
        password,
      });

       setUserData(response?.ACCESS_TOKEN);
      //  console.log("decrypt form login",decryptaValue(response?.data) )
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log("error", error);
      // enqueueSnackbar(error.msg, { variant: "error" });
      // enqueueSnackbar("errooor", { variant: "error" });
      setLoading(false);
    }
  }

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true)
  //   setErrorMessage("");
  //   try {
  //     const res = await instance.post("/pharmacy/auth/login", {
  //       email,
  //       password,
  //     });
  //     saveToken(res.data.ACCESS_TOKEN);
  //     navigate("/dashboard/overview");

  //     // setSuccess(true);
  //     // setLoading(false);
  //   } catch (error) {
  //     setErrorMessage(error.response.data.message);
  //     setLoading(false);
  //   }
  // };
  return (
    <div className="h-[100vh] bg-[#f1f1f1] flex flex-col justify-center items-center">
      <div className="bg-white flex flex-col justify-center items-center py-12 px-10 shadow-lg rounded-[10px]">
        <img src="/logo.png" alt="" className=" w-[48px]   h-[48px] mb-2" />

        {success ? (
          <div className="text-gray-500">
            A link has been sent to your email address. Click on it to sign in
          </div>
        ) : (
          <>
            <div className="text-gray-500">Sign in to an existing account.</div>
            <form
              onSubmit={login}
              className="mt-8 space-y-4 flex flex-col min-w-[300px]"
            >
              <InputField
                icon={<Sms size={16} variant="Bold" />}
                type="text"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordField
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <Link
                  className="font-medium hover:underline text-[12px]"
                  to="/auth/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                className="bg-[#00B0AD] py-3 disabled:cursor-not-allowed disabled:bg-primary-light disabled:text-primary shadow-md font-semibold flex items-center justify-center text-white rounded-[8px] text-[14px]"
                type={"submit"}
                disabled={loading}
              >
                {loading ? <ClipLoader color="white" size={16}/> : "Sign In"}
              </button>
              <div className="font-semibold text-sm text-red-500">
                {errorMessage}
              </div>
              <div className="text-gray-500">
                Don't have an account?
                <Link
                  //to="/auth/register"
                  className="font-semibold text-[14px] ml-1 text-[#00B0AD]"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
