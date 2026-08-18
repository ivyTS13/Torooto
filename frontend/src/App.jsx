import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // new
import "./App.css";
import NotFound from "./pages/NotFound";
import Register from "./pages/register";
import Profile from "./pages/Profile";
import useAuthStore from "./stores/authStore";
import DeckLibrary from "./pages/DeckLibrary";
import DeckExplorer from "./pages/DeckExplorer";
import AccessDenied from "./pages/AccessDenied";
import ServerError from "./pages/ServerError";
import PileDrawer from "./pages/PileDrawer";
import DeckManagement from "./pages/admin/DeckManagement";
import CardManagement from "./pages/admin/CardManagement";
import Login from "./pages/LoginPage";
import { Loader2 } from "lucide-react";
import PileList from "./pages/pilelist";
import PileDetail from "./pages/PileDetail";
import ReadingRoom from "./pages/ReadingRoom";
import UserProfilePage from "./pages/UserProfile";
import UserDeckExplorer from "./pages/UserDeckExplorer";

const App = () => {
  const { user, validateSession, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If there's no token, we don't need to validate anything
    if (!token) {
      setIsChecking(false);
      return;
    }

    // Only when a token exists do we run the validation
    const initSession = async () => {
      await validateSession();
      setIsChecking(false);
    };
    initSession();
  }, []);

  // No token? Render immediately without a spinner
  if (isChecking) {
    return (
      <div className="night-sky min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="animate-spin text-purple-400" size={48} />
        <p className="text-gray-500 text-sm mt-4">
          This may require up to 1 minute...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps everything – navbar & sidebar are always visible */}
          {/* Public routes (accessible without login) */}
          <Route path="/" element={<ReadingRoom />} />
          <Route path="/tarot" element={<UserDeckExplorer />} />
        <Route element={<Layout />}>
          {/* Protected routes – only visible when logged in */}
          <Route element={<ProtectedRoute />}>
          <Route path="/decks" element={<DeckLibrary />} />
          <Route path="/decks/:deckId" element={<DeckExplorer />} />
            <Route path="admin/" element={<PileDrawer />} />
            <Route path="admin/profile" element={<Profile />} />
            <Route path="admin/piles/add" element={<PileDrawer />} />
            <Route path="/admin/decks" element={<DeckManagement />} />
            <Route
              path="/admin/decks/:deckId/cards"
              element={<CardManagement />}
            />
            <Route path="/piles" element={<PileList />} />
            <Route path="/piles/:pileId" element={<PileDetail />} />
          </Route>
        </Route>
        {/* User version*/}
          <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfilePage/>}/>
          </Route>
        {/* Standalone auth pages – redirect if already logged in */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate replace to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate replace to="/" />}
        />
        <Route path="*" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="/403" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
