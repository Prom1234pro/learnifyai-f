/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from "react";
import { Menu } from "@headlessui/react";
import { Search, Plus, LogOut, MoreHorizontal, Upload, Pencil, Archive, Trash2 } from "lucide-react";
import ActionButton from "./Buttons/ActionButton";
import Logo from "../assets/logo.png";
import { useNavigate } from 'react-router-dom';
// import { db } from '../firebase';
import { initFirebase } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";




const ChatDropdown = ({ chat, onEdit }) => (
  <Menu as="div" className="relative">
    <Menu.Button className="p-1 text-gray-400 hover:text-gray-600">
      <MoreHorizontal className="w-5 h-5" />
    </Menu.Button>

    <Menu.Items
      className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 z-[9999]"
      style={{
        bottom: chat.isBottom ? "100%" : "auto",
        top: chat.isBottom ? "auto" : "100%",
      }}
    >
      <Menu.Item>
        {({ active }) => (
          <button className={`flex items-center w-full px-3 py-2 ${active ? "bg-gray-100" : ""}`}>
            <Upload className="w-4 h-4 mr-2" /> Share
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button onClick={() => onEdit(chat.id, chat.name)} className={`flex items-center w-full px-3 py-2 ${active ? "bg-gray-100" : ""}`}>
            <Pencil className="w-4 h-4 mr-2" /> Rename
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button className={`flex items-center w-full px-3 py-2 ${active ? "bg-gray-100" : ""}`}>
            <Archive className="w-4 h-4 mr-2" /> Export
          </button>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <button className={`flex items-center w-full px-3 py-2 text-red-500 ${active ? "bg-red-100" : ""}`}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        )}
      </Menu.Item>
    </Menu.Items>
  </Menu>
);



const Sidebar = ({ chats, isOpen, setIsOpen }) => {
  const [search, setSearch] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editName, setEditName] = useState("");
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(null); // Store ID of open menu
  const menuRefs = useRef({}); // Store refs dynamically for each chat item

  const sidebarRef = useRef(null);

  useEffect(() => {
      const setUpDb = async () => {
        const { db } = await initFirebase();
        setDb(db)
      }
      setUpDb()
  }, [])

  useEffect(() => {
      const setUpAuth = async () => {
        const { auth } = await initFirebase();
        setAuth(auth)
      }
      setUpAuth()
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen !== null && menuRefs.current[isMenuOpen] && 
          !menuRefs.current[isMenuOpen].contains(event.target)) {
        setIsMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);


  useEffect(() => {
    if (isMenuOpen && menuRefs.current[isMenuOpen]) {
      const buttonRect = menuRefs.current[isMenuOpen].current.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const dropdownHeight = 120; // Approximate height of menu

      const shouldDropUp = buttonRect.bottom + dropdownHeight > screenHeight;
      const dropdown = menuRefs.current[isMenuOpen].current.nextElementSibling;

      if (dropdown) {
        dropdown.style.top = shouldDropUp ? "auto" : "100%";
        dropdown.style.bottom = shouldDropUp ? "100%" : "auto";
      }
    }
  }, [isMenuOpen]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      toast.error("Invalid Request");
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

  const handleClickLink = (url) => {
    navigate(url);
    setIsOpen(false)
  }

  return (
    <>
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-[-5px] left-4 z-50 text-black p-2 rounded-md"
      >
        {!isOpen && <img width={40} height={40} src={menuIcon}/>}
      </button> */}
        {isOpen && <div onClick={()=>setIsOpen(false)} className="lg:hidden w-screen h-screen z-[500] fixed top-0 opacity-[0.6] bg-[#E5E7EA]">

        </div>}

      
      <div
        className={`fixed h-full top-0 left-0 bg-gradient-to-br from-[#E5E7EA] to-[#A362A880] py-4 shadow-lg w-72 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:w-72 lg:translate-x-0 lg:static lg:flex flex-col z-[998]`}
      >


        <div className="sticky px-6 top-0 left-0 z-10 h-[20%]">

          <div className="flex items-center mb-4 gap-[1px] relative">
            <img src={Logo} alt="AI Icon" className="w-9 h-9" />
            <span className="font-montserrat bg-gradient-to-r from-[#632366] to-[#44798E] bg-clip-text text-transparent ml-2 text-[24px] font-[700]">
              LEARNIFY AI
            </span>
            {/* <img className="lg:hidden absolute right-0" width={35} height={35} src={menuIcon} onClick={() => setIsOpen(!isOpen)}/> */}
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
            <ActionButton icon={Plus} active text="New Chat" onClick={() => handleClickLink("/chat")} className={"py-[0.4rem]"} />
          </div>

          <div className="space-y-4 mt-7 px-6 h-[50vh] overflow-y-scroll z-50 relative">
        {categoryOrder.filter(category => categorizedChats[category].length > 0).length > 0 ? (
          categoryOrder
            .filter(category => categorizedChats[category].length > 0)
            .map(category => (
              <div key={category}>
                <h3 className="font-semibold text-[12px] text-gray-700">{category}</h3>
                <ul ref={sidebarRef}
                className="mt-2 space-y-1 text-sm text-gray-800 mb-5">
                  {categorizedChats[category]
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .filter(chat => chat.name.toLowerCase().includes(search.toLowerCase()))
                    .map(chat => {
                      if (!menuRefs.current[chat.id]) {
                        menuRefs.current[chat.id] = React.createRef();
                      }
                      return (
                        <li key={chat.id} className="relative flex items-center justify-between rounded-md px-1 py-1 hover:text-gray-900 cursor-pointer group hover:bg-[#63236616]">
                          {editingChatId === chat.id ? (
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => handleKeyPress(e, chat.id)} onBlur={() => handleSave(chat.id)} className="flex-1 px-2 py-[.1rem] border-none rounded text-sm focus:outline-none focus:ring-2 bg-[#63236600] focus:ring-[#99439d]" autoFocus />
                          ) : (
                            <>
                              <div onClick={() => handleClickLink(`/chat/${chat.id}`)} className="flex-1 truncate" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chat.name}
                              </div>
                              <ChatDropdown chat={chat} onEdit={handleEdit} />
                            </>
                          )}
                        </li>
                      );
                    })}
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


