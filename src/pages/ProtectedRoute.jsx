import { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from "../components/Sidebar";
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ Child }) => {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()
  const [user, setUser] = useState(null);

  const [chatSessions, setChatSessions] = useState([]);
  const [userId, setUserId] = useState(null);
  
  const initializeChatSession = useCallback(() => {
    if (!userId) return;

    // Real-time listener for chat sessions
    const userChatsCollection = collection(db, 'users', userId, 'chatSessions');
    const unsubscribe = onSnapshot(userChatsCollection, (snapshot) => {
      const updatedSessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        updatedAt: doc.data().updatedAt,
        name: doc.data().name || `New Chat`,
      }));
      setChatSessions(updatedSessions);
    });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      initializeChatSession();
    }
  }, [initializeChatSession, userId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin")
        return
      }
      setUser(user);
      setUserId(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);


  if (!user && !loading) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar chats={chatSessions} isOpen={isOpen} setIsOpen={setIsOpen}/>
      
      {!loading && <Child isOpen={isOpen} setIsOpen={setIsOpen}/>}
    </div>
  );;
};

export default ProtectedRoute;