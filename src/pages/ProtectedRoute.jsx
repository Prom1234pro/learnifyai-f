import { useEffect, useState, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { initFirebase } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  // ✅ Initialize Firebase and store `auth` and `db` together
  useEffect(() => {
    const initializeFirebase = async () => {
      const { db, auth } = await initFirebase();
      setDb(db);
      setAuth(auth);
    };
    initializeFirebase();
  }, []);

  // ✅ Wait until `auth` is initialized before calling `onAuthStateChanged`
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
        return;
      }
      setUser(user);
      setUserId(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // ✅ Ensure `db` and `userId` are initialized before setting up chat sessions
  const initializeChatSession = useCallback(() => {
    if (!userId || !db) return;

    const userChatsCollection = collection(db, "users", userId, "chatSessions");
    const unsubscribe = onSnapshot(userChatsCollection, (snapshot) => {
      const updatedSessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        updatedAt: doc.data().updatedAt,
        name: doc.data().name || `New Chat`,
      }));
      setChatSessions(updatedSessions);
    });

    return () => unsubscribe();
  }, [userId, db]);

  useEffect(() => {
    if (userId && db) {
      initializeChatSession();
    }
  }, [initializeChatSession, userId, db]);

  if (!user && !loading) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="flex h-full w-screen bg-gradient-to-br from-[#ffffff] via-[#e7dbe9ac] to-[#A362A880]">
      <Sidebar chats={chatSessions} isOpen={isOpen} setIsOpen={setIsOpen} />

      {!loading && (
        <div className="flex flex-col h-full relative pb-2">
          <Header isOpen={isOpen} setIsOpen={setIsOpen} />
          {/* <div className="flex flex-col flex-1">{children}</div> */}
          {children}
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute;
