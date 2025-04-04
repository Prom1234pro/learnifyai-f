import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initFirebase } from "../../firebase";

export default function LearnifyAI() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      const setUpAuth = async () => {
        const { auth } = await initFirebase();
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            navigate("/chat");
          } else {
            setLoading(false);
          }
        });
        return () => unsubscribe();
      }
      setUpAuth()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white overflow-x-hidden">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#632366] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#A362A880] via-white to-[#A362A880]">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-[#282732]">
          Welcome to{" "}
          <span className="font-montserrat bg-gradient-to-r from-[#632366] text-3xl to-[#44798E] bg-clip-text text-transparent font-bold">
            LEARNIFY AI
          </span>
        </h1>
        <p className="text-[#282732] font-normal mt-3 max-w-[840px] w-[95%] md:w-[80%] mx-auto px-3">
          Your AI-powered assistant for seamless document management, helping you upload, and gain insights from your files with ease and efficiency.
        </p>
        <div className="mt-6 flex-col flex md:flex-row items-center justify-center gap-4">
          <a
            href="/signup"
            className="w-full max-w-[279px] px-6 py-3 bg-gradient-to-r from-[#632366] to-[#44798E] text-white rounded-md shadow-md hover:opacity-90"
          >
            Sign up
          </a>
          <a
            href="/signin"
            className="w-full max-w-[279px] px-6 py-3 border border-gray-500 text-gray-700 rounded-md hover:bg-gray-100"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
