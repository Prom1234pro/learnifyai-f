import { useState, useRef, useEffect } from "react";
import ActionButton from "../../components/Buttons/ActionButton";
import Logo from "../../assets/logo.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);


  const [active, setActive] = useState(false);

     useEffect(() => {
            if (!otp.includes("")) {
                setActive(true);
            } else {
                setActive(false);
            }
        }, [otp]);
        const handleSubmit = () => {
    
          if (otp.includes("")) {
              toast.error("Complete the otp field");
              return;
          }
      
          
      
          toast.success("Correct OTP!");
      };
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field if value is entered
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Move back to the previous input
    }
  };

  return (
    <div>
      {/* Header with Logo */}
      <div className="flex bg-white py-3 justify-center">
        <img src={Logo} alt="Learnify AI" className="h-6" />
        <span className="font-montserrat bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-xl font-semibold">LEARNIFY AI</span>
      </div>

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          {/* Title */}
          <h2 className="text-2xl font-semibold text-[#041822]">Verify your code</h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter the passcode you just received on your email address ending with <br />
            <span className="font-medium">********in@gmail.com</span>
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-evenly items-center mt-4">
            {otp.map((digit, index) => (
              <div key={index} className="flex items-center">
                {/* Add a dash between the 2nd and 3rd input fields */}
                {index === 2
 && <span className="text-gray-400 text-xl mr-5">—</span>}
 <input
   ref={(el) => (inputRefs.current[index] = el)}
   type="text"
   maxLength="1"
   value={digit}
   onChange={(e) => handleChange(index, e.target.value)}
   onKeyDown={(e) => handleKeyDown(index, e)}
   className="w-12 h-12 text-center border rounded-md text-[30px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
 />
</div>
))}
</div>

{/* Resend OTP */}
<p className="text-gray-500 text-sm mt-4">
Didn’t receive the OTP? <span className="text-indigo-600 font-medium cursor-pointer">Resend</span>
</p>

{/* Verify Button */}
<ActionButton active={active} className="py-3" onClick={handleSubmit} text="Sign up"/>

</div>
</div>
</div>
);
};

export default OTPVerification;
