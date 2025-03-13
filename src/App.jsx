import ProtectedRoute from './pages/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewChat from './pages/Chat/NewChat'
import Chat from './pages/Chat/Chat'
import SignUp from './pages/Auth/SignUp';
import SignIn from './pages/Auth/SignIn';
import Welcome from './pages/Auth/Welcome';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import CreateNewPassword from './pages/ForgotPassword/CreateNewPassword';
import { ToastContainer } from "react-toastify";
import EmailVerificationFailure from './pages/Auth/EmailVerificationFailure';
import EmailVerificationSent from './pages/Auth/EmailVerificationSent';
import EmailVerification from './pages/Auth/EmailVerification';
import EmailVerificationSuccess from './pages/Auth/EmailVerificationSuccess';

const App = () => {
  return (
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/signup" element={<SignUp />}/>
          <Route path="/signin" element={<SignIn />}/>
          <Route path="/" element={<Welcome/>}/>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<CreateNewPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/email-verification-sent" element={<EmailVerificationSent />} />
          <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
          <Route path="/email-verification-failure" element={<EmailVerificationFailure />} />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <NewChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:id" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          {/* <Route 
            path="/chat/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>

                <ChattingPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          /> */}
        </Routes>
      </Router>
  );
};

export default App;
