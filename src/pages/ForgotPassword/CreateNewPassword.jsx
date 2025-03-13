import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { useSearchParams, useNavigate } from "react-router-dom";
import ActionButton from "../../components/Buttons/ActionButton";
import Logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [active, setActive] = useState(false);
  
  const [searchParams] = useSearchParams(); // Get query params from URL
  const navigate = useNavigate();
  const auth = getAuth();
  const oobCode = searchParams.get("oobCode"); // Get the reset token from URL

  useEffect(() => {
    if (password.length >= 6 && confirmPassword.length >= 6) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async () => {
    if (!oobCode) {
      toast.error("Invalid or expired reset link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000); // Redirect after success
    } catch (error) {
      toast.error(error.message || "Failed to reset password.");
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
        {/* Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-[#041822]">Create New Password</h2>
          <p className="text-[#696F79] text-sm mt-2">
            Type in a new password for your account
          </p>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">New password*</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#E5E7EA] focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700">Confirm password*</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#E5E7EA] focus:ring-indigo-500"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <ActionButton active={active} className="py-3" onClick={handleSubmit} text="Reset Password" />
        </div>
      </div>
    </div>
  );
}
