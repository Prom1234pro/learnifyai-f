/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Search, Plus, Edit, LogOut } from "lucide-react";
import ActionButton from "./Buttons/ActionButton";
import Logo from "../assets/logo.png";
import menuIcon from "../assets/menu.svg";
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

const Sidebar = ({ chats, isOpen, setIsOpen }) => {
  const [search, setSearch] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log(chats);
  }, [chats]);

  const handleLogout = async () => {
    console.log("here 1")
    try {
      console.log("here")
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const categorizeChats = (chats) => {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Initialize with fixed categories
    const categories = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Previous 14 Days": [],
      "Previous 30 Days": []
    };

    const sortedChats = [...chats].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    sortedChats.forEach((chat) => {
      const updatedAt = new Date(chat.updatedAt).getTime();
      const chatDate = new Date(chat.updatedAt);
      const diff = now - updatedAt;
      const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
      const year = chatDate.getFullYear().toString();

      if (updatedAt >= today) {
        categories["Today"].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      } else if (daysDiff <= 1) {
        categories["Yesterday"].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      } else if (daysDiff <= 7) {
        categories["Previous 7 Days"].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      } else if (daysDiff <= 14) {
        categories["Previous 14 Days"].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      } else if (daysDiff <= 30) {
        categories["Previous 30 Days"].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      } else {
        // Dynamically add year category if it doesn't exist
        if (!categories[year]) {
          categories[year] = [];
        }
        categories[year].push({ name: chat.name, id: chat.id, updatedAt: chat.updatedAt });
      }
    });

    return categories;
  };

  const categorizedChats = categorizeChats(chats);

  const baseCategories = [
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Previous 14 Days",
    "Previous 30 Days"
  ];

  // Get all unique years from chats and sort them in descending order
  const yearCategories = Object.keys(categorizedChats)
    .filter(key => !baseCategories.includes(key))
    .sort((a, b) => Number(b) - Number(a));

  const categoryOrder = [...baseCategories, ...yearCategories];

  const handleEdit = (chatId, currentName) => {
    setEditingChatId(chatId);
    setEditName(currentName);
  };

  const handleSave = async (chatId) => {
    if (!editName.trim()) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const chatRef = doc(db, 'users', userId, 'chatSessions', chatId);
      await updateDoc(chatRef, { name: editName });
      setEditingChatId(null);
    } catch (error) {
      console.error("Error updating chat name:", error);
    }
  };

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      handleSave(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <>
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-[-5px] left-4 z-50 text-black p-2 rounded-md"
      >
        {!isOpen && <img width={40} height={40} src={menuIcon}/>}
      </button> */}

      <div
        className={`fixed h-screen top-0 left-0 bg-gradient-to-br from-[#E5E7EA] to-[#A362A880] py-4 border-r shadow-lg w-72 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:w-72 lg:translate-x-0 lg:static lg:flex flex-col z-40`}
      >


        <div className="sticky px-6 top-0 left-0 z-10 h-[20%]">

          <div className="flex items-center mb-4 gap-[1px] relative">
            <img src={Logo} alt="AI Icon" className="w-9 h-9" />
            <span className="font-montserrat bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-[24px] font-[700]">
              LEARNIFY AI
            </span>
            <img className="lg:hidden absolute right-0" width={35} height={35} src={menuIcon} onClick={() => setIsOpen(!isOpen)}/>
          </div>

          <div className="relative w-full max-w-sm mb-4">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#282A2F]"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-[0.4rem] border rounded-[20px] text-sm bg-[#fafafa] text-[#282A2F] placeholder-[#282a2f] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
          <div className="px-6">
            <ActionButton icon={Plus} active text="New Chat" onClick={() => navigate("/chat")} className={"py-[0.4rem]"} />
          </div>

          <div className="space-y-4 mt-7 px-6 h-[60vh] overflow-y-scroll z-50 relative">
            {categoryOrder.filter(category => categorizedChats[category].length > 0).length > 0 ? (
              categoryOrder
                .filter(category => categorizedChats[category].length > 0)
                .map(category => (
                  <div key={category}>
                    <h3 className="font-semibold text-[12px] text-gray-700">{category}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-gray-800 mb-5">
                      {categorizedChats[category]
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        .filter(chat => chat.name.toLowerCase().includes(search.toLowerCase()))
                        .map(chat => (
                          <li 
                            key={chat.id} 
                            className="flex items-center justify-between rounded-md px-1 py-1 hover:text-gray-900 cursor-pointer group hover:bg-[#63236616]"
                          >
                            {editingChatId === chat.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, chat.id)}
                                onBlur={() => handleSave(chat.id)}
                                className="flex-1 px-2 py-[.1rem] border-none rounded text-sm focus:outline-none focus:ring-2 bg-[#63236600] focus:ring-[#99439d]"
                                autoFocus
                              />
                            ) : (
                              <>
                                <Link 
                                  to={`/chat/${chat.id}`} 
                                  className="flex-1 truncate"
                                  style={{ 
                                    display: 'block', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                  }}
                                >
                                  {chat.name}
                                </Link>
                                <button
                                  onClick={() => handleEdit(chat.id, chat.name)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-gray-600"
                                >
                                  <Edit size={16} />
                                </button>
                              </>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
            ) : (
              <p className="text-gray-600 text-sm italic text-center">No recent chat history</p>
            )}
          </div>


        {/* logout section */}
        <div className="z-[999] px-4 fixed bottom-0 w-72 py-4 shadow-md">
          <ul className="mt-2 space-y-1 text-sm text-gray-800">
            <li className="flex items-center justify-between rounded-md py-2 px-2 hover:text-gray-900 cursor-pointer group hover:bg-[#63236621]">
              <button onClick={handleLogout} className="flex items-center gap-3 flex-1">
                <LogOut size={18} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


