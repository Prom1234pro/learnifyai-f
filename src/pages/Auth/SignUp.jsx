import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import GoogleLogo from "../../assets/google-icon.svg";
import Logo from "../../assets/logo.png";
import { Send, RotateCw, Copy } from "lucide-react";
import ActionButton from "../../components/Buttons/ActionButton";
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ThoughtInput = () => {
  const [text, setText] = useState("");
  
  return (
    <div className="flex flex-col p-3 gap-4 bg-white rounded-md mt-auto w-full max-w-md border border-gray-200 relative">
      {/* Brain Emoji & Placeholder */}
      <div className="flex items-center space-x-2 text-gray-500">
        <span className="text-pink-500 text-lg">🧠</span>
        <input
          type="text"
          className="w-full outline-none bg-transparent text-sm placeholder-gray-400"
          placeholder="What’s in your mind?..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-3 text-gray-400">
        <button className="hover:text-gray-600">
          <RotateCw size={18} />
        </button>
        <button className="hover:text-gray-600">
          <Copy size={18} />
        </button>
      </div>

      {/* Send Button */}
      <button className="absolute right-3 bg-gradient-to-r from-[#632366] to-[#44798E] text-white p-2 rounded-full shadow-md hover:scale-105 transition">
        <Send size={18} />
      </button>
    </div>
  );
};




export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [displayNameError, setDisplayNameError] = useState("");
    const [agree, setAgree] = useState(false);
    const [active, setActive] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [agreeError, setAgreeError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
  
    const isValidEmail = (email) => {
      return /\S+@\S+\.\S+/.test(email);
    };
  
    
    const storeUserInFirestore = async (user) => {
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(
        userDoc,
        {
          email: user.email,
          displayName: displayName || user.displayName || '',
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );
    };

    useEffect(() => {
      document.title = "Learnify AI - Sign Up"; // Change the title
  
      return () => {
        document.title = "Learnify AI"; // Optional cleanup when component unmounts
      };
    }, []);

    // Effect to update active state
    useEffect(() => {
        if (isValidEmail(email) && password.length >= 6 && agree) {
            setActive(true);
        } else {
            setActive(false);
        }
    }, [email, password, agree]);

    const handleSubmit = async () => {
        let isValid = true;
        
        if (!isValidEmail(email)) {
          setEmailError("Please enter a valid email.");
          isValid = false;
        } else {
            setEmailError("");
        }
        if (displayName.trim().length < 3) {
          setDisplayNameError("Display name must be at least 3 characters.");
          isValid = false;
        } else {
          setDisplayNameError("");
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            isValid = false;
        } else {
            setPasswordError("");
        }

        if (!agree) {
          setAgreeError("You must agree to the terms & conditions.");
            isValid = false;
        } else {
            setAgreeError("");
        }

        if (isValid) {
          setIsLoading(true);
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const sendVerificationEmail = async () => {
              if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser, {
                  url: "https://localhost:5173/email-verification-success?uid=" + auth.currentUser.uid,
                  handleCodeInApp: true, // Ensures the app handles the link
                });
                toast.success("Verification email sent! Check your inbox.");
              }
            };
            await sendVerificationEmail();
            await storeUserInFirestore(userCredential.user);
            await updateProfile(auth.currentUser, { displayName });

            navigate('/email-verification-sent', { state: { email: userCredential.user.email } });
          }catch (error) {
            switch (error.code) {
              case 'auth/wrong-password':
                setPasswordError('Incorrect password.');
                break;
              case 'auth/user-not-found':
                setEmailError('No account found with this email.');
                break;
              case 'auth/invalid-email':
                setEmailError('Invalid email format.');
                break;
              case 'auth/user-disabled':
                setEmailError('This account has been disabled.');
                break;
              case 'auth/too-many-requests':
                setEmailError('Too many attempts. Please try again later.');
                break;
              case 'auth/invalid-credential':
                setEmailError('Invalid credentials provided.');
                break;
              case 'auth/email-already-in-use':
                setEmailError('This email is already in use.');
                break;
              case 'auth/operation-not-allowed':
                setEmailError('This operation is not allowed.');
                break;
              case 'auth/account-exists-with-different-credential':
                setEmailError('An account already exists with different credentials.');
                break;
              case 'auth/requires-recent-login':
                setEmailError('Please log in again to perform this action.');
                break;
              case 'auth/network-request-failed':
                setEmailError('Network error. Please check your connection.');
                break;
              default:
                setEmailError('Unknown error');
                break;
            }
          }  finally {
            setIsLoading(false);
          }
        }
    };

    const handleGoogleSignIn = async () => {
      try {
        setIsLoading(true);
        setEmailError('');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        await storeUserInFirestore(result.user);
        if (!result.user.emailVerified) {
          navigate('/email-verification-sent', { state: { email: result.user.email } });
        } else {
          navigate('/chat');
        }
      } catch (error) {
        toast.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    return (
      <div className="flex h-screen overflow-y-scroll bg-gradient-to-r from-purple-100 to-white">
        
        {/* Left Section - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        
          <div className="max-w-md w-full">
          <div className="flex items-center mb-4 gap-3">
              <img src={Logo} alt="AI Icon" className="w-12 h-12" />
              <span className="font-montserrat bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-xl md:text-2xl font-[700]">LEARNIFY AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Create an account</h1>
            <p className="text-gray-600 mt-3">Kindly fill in your details to create an account</p>
            <div className="mt-6">
              <label className="block text-gray-700 mb-2">Display Name*</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#FAFAFA] focus:ring-indigo-500 ${
                    displayNameError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {displayNameError && (
                  <AlertCircle className="absolute right-3 top-3 text-red-500 w-5 h-5" />
                )}
              </div>
              {displayNameError && <p className="text-red-500 text-sm mt-1">{displayNameError}</p>}
            </div>

            <div className="mt-6">
              <label className="block text-gray-700 mb-2">Your email*</label>
              <div className="relative">
                
              <input type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" 
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#FAFAFA] focus:ring-indigo-500 ${emailError ? "border-red-500" : "border-gray-300"}`}
              />
              {emailError && (
                  <AlertCircle className="absolute right-3 top-3 text-red-500 w-5 h-5" />
                )}
              </div>
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
             
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-700 mb-2">Password*</label>
              <div className="relative mt-1">

              <input type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 bg-[#FAFAFA] focus:ring-indigo-500 ${passwordError ? "border-red-500" : "border-gray-300"}`}
              />
              <button 
              type="button" 
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
                {passwordError && (
                  <AlertCircle className="absolute right-8 top-3 text-red-500 w-5 h-5" />
                )}
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
              </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}   
          
            </div>
            
            <div className="mt-6 flex items-center  mb-4">
              <input type="checkbox"
              value={agree}
              onChange={() => setAgree(!agree)} className="mr-2" />
              <span className={`text-gray-600 ${agreeError ? "border-red-500" : ""}`}>I agree to terms & conditions</span>
            </div>
            {agreeError && <p className="text-red-500 text-sm -mt-3 mb-3">{agreeError}</p>}
            
            {/* <button className="w-full px-6 py-3 bg-[#696F79] text-white rounded-md shadow-md hover:opacity-90">Sign up</button> */}
            <ActionButton active={active} className="py-3" onClick={handleSubmit} text={isLoading? "Please wait..." : "Sign up"}/>
            <p className="my-8 text-center text-gray-500">Or register with</p>
            
            <div className="flex justify-center space-x-4 mt-3 text-[#282A2F]">
              <button 
              onClick={handleGoogleSignIn}
              className="w-full px-4 py-2 border flex items-center justify-center rounded-md"><img src={GoogleLogo} alt="Google" className="w-5 h-5 mr-2" />Sign up with Google</button>
              {/* <button className="px-4 py-2 border flex items-center rounded-md"><img src="/apple-icon.png" alt="Apple" className="w-5 h-5 mr-2" />Sign up with Apple</button> */}
            </div>
            
            <p className="text-center text-gray-600 mt-4">Already have an Account? <a href="signin" className="text-[#632668]">Login</a></p>
          </div>
        </div>
        
        {/* Right Section - AI Assistant (Hidden on Small Screens) */}
        <div className="hidden lg:flex lg:flex-col items-center w-1/2 p-3 flex-col justify-center fixed right-0 top-0 h-full">
        <div className=" lg:flex lg:flex-col items-center w-full h-full bg-gradient-to-tr pb-6 rounded-2xl from-[#A362A880] via-[#FAFAFA] via-60% to-[#A362A880] flex-col justify-center">

          <div className="max-w-md my-auto">
            <div className="flex items-center mb-4">
              <img src={Logo} alt="AI Icon" className="w-12 h-12" />
              {/* <span className="ml-2 text-xl font-semibold">LEARNIFY AI</span> */}
            </div>
            <p className="text-gray-700">
              Welcome! I&apos;m your AI assistant, ready to help with whatever you need. Whether it&apos;s answering questions, offering recommendations, or helping you manage tasks, I&apos;m here to make things easier for you. Just type what you&apos;re looking for, and I&apos;ll provide the support or information you need. Let&apos;s get started—how can I assist you today?
            </p>
            
          </div>
            <ThoughtInput />
        </div>
        </div>
      </div>
    );
  }
  