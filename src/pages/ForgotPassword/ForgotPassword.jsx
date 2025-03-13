import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";
import ActionButton from "../../components/Buttons/ActionButton";
import Logo from "../../assets/logo.png";
import "../../firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(false);
  const auth = getAuth();

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  useEffect(() => {
    setActive(isValidEmail(email));
  }, [email]);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      toast.error("Invalid Email Address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:5173/reset-password", // Custom reset link
        handleCodeInApp: true, // Ensures the action is handled in your app
      });
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  return (
    <div>
      <div className="flex bg-white py-3 justify-center">
        <img src={Logo} alt="Learnify AI" className="h-6" />
        <span className="font-montserrat bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-xl font-semibold">
          LEARNIFY AI
        </span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[#041822]">
            Forgot Password?
          </h2>
          <p className="text-[#696F79] text-sm mt-2">
            Type your authorized email address to receive a reset link
          </p>

          {/* Input Field */}
          <div className="mt-3 mb-4 text-left">
            <label htmlFor="email" className="text-[#696F79] text-sm font-medium">
              Your email*
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#E5E7EA] focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <ActionButton active={active} className="py-3" onClick={handleSubmit} text="Reset" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
