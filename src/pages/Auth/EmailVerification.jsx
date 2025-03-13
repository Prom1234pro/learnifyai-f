import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuth, applyActionCode } from "firebase/auth";
import { toast } from "react-toastify";

// Utility function to safely apply action code
const safeApplyActionCode = async (auth, code) => {
  try {
    await applyActionCode(auth, code);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const hasVerifiedRef = useRef(false); // Tracks if verification has run

  const auth = getAuth();
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const verifyEmail = async () => {
      // Ensure this runs only once
      if (hasVerifiedRef.current) {
        console.log("Verification already attempted, skipping...");
        return;
      }

      // Mark as run
      hasVerifiedRef.current = true;
      console.log("oobCode:", oobCode);

      // Check for oobCode
      if (!oobCode) {
        toast.error("Invalid verification link");
        setTimeout(() => {
          navigate("/email-verification-failure");
          setIsLoading(false);
        }, 2000);
        return;
      }

      // Perform verification
      const result = await safeApplyActionCode(auth, oobCode);
      if (result.success) {
        toast.success("Email Verified Successfully 🎉");
        setTimeout(() => {
          navigate("/email-verification-success");
          setIsLoading(false);
        }, 2000);
      } else {
        toast.error(`Error verifying email: ${result.error}`);
        setTimeout(() => {
          navigate("/email-verification-failure");
          setIsLoading(false);
        }, 2000);
      }
    };

    verifyEmail();
    // Empty dependency array ensures this runs only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Complete</h2>
            <p className="text-gray-600">Redirecting you shortly...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;