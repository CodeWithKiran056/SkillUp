import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import FindPartner from "./pages/FindPartner";
import StudyRoom from "./pages/StudyRoom";
import EdithAI from "./pages/EdithAI";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import MySessions from "./pages/MySessions";
import SavedRecordings from "./pages/SavedRecordings";
import ChatRoom from "./components/ChatRoom";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";


function protectedPage(page, shellProps = {}) {
  return (
    <ProtectedRoute>
      <AppShell {...shellProps}>{page}</AppShell>
    </ProtectedRoute>
  );
}


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* Public Routes */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />




        {/* Protected Routes */}


        <Route
          path="/dashboard"
          element={protectedPage(<Dashboard />)}
        />



        <Route
          path="/find-partner"
          element={protectedPage(<FindPartner />)}
        />



        <Route
          path="/study-room"
          element={protectedPage(<StudyRoom />)}
        />



        <Route
          path="/edith-ai"
          element={protectedPage(<EdithAI />, {
            contentClassName: "relative flex min-h-0 flex-1 flex-col p-0",
            contentScroll: false,
          })}
        />



        <Route
          path="/analytics"
          element={protectedPage(<Analytics />)}
        />



        <Route
          path="/settings"
          element={protectedPage(<Settings />)}
        />



        <Route
          path="/messages"
          element={protectedPage(<Messages />, {
            contentClassName: "relative flex min-h-0 flex-1 flex-col p-0",
            contentScroll: false,
          })}
        />



        <Route
          path="/mysessions"
          element={protectedPage(<MySessions />)}
        />



        <Route
          path="/saved-recordings"
          element={protectedPage(<SavedRecordings />)}
        />



        {/* 404 */}

        <Route
          path="*"
          element={<NotFound />}
        />


      </Routes>


    </BrowserRouter>

  );

}


export default App;
