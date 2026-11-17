import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import NotFound from "./pages/NotFound";
import Register from "./pages/register";
import Profile from "./pages/Profile";
import useAuthStore from "./stores/authStore";
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
import UserPileList from "./pages/UserPileList";
import UserPileDetail from "./pages/UserPileDetail";

const App = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const validateSession = useAuthStore((state) => state.validateSession);
  const [isChecking, setIsChecking] = useState(() => Boolean(token));

  useEffect(() => {
    if (!isChecking || !token) return;

    let active = true;
    const initSession = async () => {
      await validateSession();
      if (active) setIsChecking(false);
    };
    initSession();

    return () => {
      active = false;
    };
  }, [isChecking, token, validateSession]);

  if (isChecking) {
    return (
      <div className="tarot-canvas min-h-[100dvh] flex flex-col items-center justify-center bg-[#0B0A0E] text-[#E8E2D5]">
        <Loader2 className="animate-spin text-[#C5A059]" size={40} strokeWidth={1.5} />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9E9689] mt-4">
          Verifying session…
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReadingRoom />} />
        <Route path="/tarot" element={<UserDeckExplorer />} />
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<PileDrawer />} />
            <Route path="/admin/decks" element={<DeckManagement />} />
            <Route
              path="/admin/decks/:deckId/cards"
              element={<CardManagement />}
            />
            <Route path="/admin/piles" element={<PileList />} />
            <Route path="/admin/piles/:pileId" element={<PileDetail />} />
            <Route path="/admin/piles/add" element={<PileDrawer />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/piles" element={<UserPileList />} />
          <Route path="/piles/:pileId" element={<UserPileDetail />} />
        </Route>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate replace to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate replace to="/" />}
        />
        <Route path="/500" element={<ServerError />} />
        <Route path="/403" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
