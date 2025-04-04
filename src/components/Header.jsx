import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import menuIcon from "../assets/menu.svg";

// eslint-disable-next-line react/prop-types
const Header = ({isOpen, setIsOpen}) => {
const [userName, setUserName] = useState("Anonymous"); // Default username
  const [userInitials, setUserInitials] = useState("AN"); // Default initials
  const [userPhoto, setUserPhoto] = useState(null); // User profile photo

    useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Anonymous"); 
        setUserPhoto(user.photoURL || null); 
        
        if (user.displayName) {
          const initials = user.displayName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          setUserInitials(initials);
        }
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);
  return (
    <div className="flex justify-between mt-2 py-0 sm:py-2 sm:bg-none bg-gradient-to-br from-[#ffffff] via-[#f1e7f3] to-[#bb75c0] sticky top-0 z-[0]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden z-50 text-black rounded-md"
      >
        <img className={`${isOpen && "opacity-0"}`} width={40} height={40} src={menuIcon}/>
      </button>

      <div className="ml-auto flex items-center bg-none p-1 md:px-3 md:py-1 rounded-full md:bg-gradient-to-r from-[#632366] to-[#44798E] text-white text-sm font-normal">
      <span className="hidden md:inline mr-2">{userName}</span>
        {userPhoto? (
          <img
            src={userPhoto}
            alt="User Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <span className="w-6 h-6 p-4 flex items-center justify-center rounded-full bg-gradient-to-r from-[#632366] to-[#44798E] text-xs font-bold">
            {userInitials}
          </span>
        )}
      </div>
    </div>
  )
}

export default Header
