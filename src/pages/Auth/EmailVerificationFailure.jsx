import { useNavigate } from "react-router-dom";
import Logo from "../../assets/logo.png";
import ActionButton from "../../components/Buttons/ActionButton";

const EmailVerificationFailure = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex bg-white py-3 justify-center">
        <img src={Logo} alt="Learnify AI" className="h-6" />
        <span className="bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-xl font-semibold">
          LEARNIFY AI
        </span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-[#D32F2F]">
            Email Verification Failed
          </h2>
          <p className="text-[#696F79] text-sm mt-2 mb-4">
            Oops! Something went wrong while verifying your email. The verification link may have expired or is invalid.
          </p>

          {/* Resend Verification Email Button */}
          <ActionButton
            active={true}
            className="py-3 mt-4"
            onClick={() => navigate("/email-verification-sent")}
            text="Resend Verification Email"
          />
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationFailure;
