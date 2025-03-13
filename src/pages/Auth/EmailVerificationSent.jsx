import { useState } from "react";
import { toast } from "react-toastify";
import { getAuth, sendEmailVerification } from "firebase/auth";
import "react-toastify/dist/ReactToastify.css";
import ActionButton from "../../components/Buttons/ActionButton";
import Logo from "../../assets/logo.png";
import "../../firebase";

const EmailVerificationSent = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const maskedEmail = user?.email.replace(/(.{2}).*(@.*)/, "$1****$2") || "your email";
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!user) {
      toast.error("No user is signed in");
      return;
    }

    setLoading(true);
    try {
      const sendVerificationEmail = async () => {
        if (user) {
          await sendEmailVerification(user, {
            url: "https://localhost:5173/email-verification-success?uid=" + user.uid,
            handleCodeInApp: true, // Ensures the app handles the link
          });
        }
      };
      await sendVerificationEmail();
      toast.success("Verification email resent! Check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email");
    }
    setLoading(false);
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
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-[#041822]">Verify Your Email</h2>
          <p className="text-[#696F79] text-sm mt-2">
            A verification email was sent to <span className="font-semibold">{maskedEmail}</span>. Please check your inbox and click the link to verify your email.
          </p>
          <p className="text-[#696F79] text-sm mt-2">
            Didn’t receive an email? Click below to resend.
          </p>
          <ActionButton active={!loading} className="py-3 mt-4" onClick={handleResend} text={loading ? "Resending..." : "Resend Email"} />
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSent;
