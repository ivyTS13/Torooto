// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/login';
import "./App.css";
import NotFound from './pages/NotFound';
import Register from './pages/register';
import Profile from './pages/Profile';
import useAuthStore from './stores/authStore';
import DeckLibrary from './pages/DeckLibrary';
import DeckExplorer from './pages/DeckExplorer';
import AccessDenied from './pages/AccessDenied';
import ServerError from './pages/ServerError';
import PileDrawer from './pages/PileDrawer';
import DeckManagement from './pages/admin/DeckManagement';
import CardManagement from './pages/admin/CardManagement';
const App = () => {
   const { user } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything inside this route will use the Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<PileDrawer />} />
          <Route path="/profile" element={<Profile/>}/>

        {/* The Deck Routes */}
          <Route path="/decks" element={<DeckLibrary/>} />
          <Route path="/decks/:deckId" element={<DeckExplorer />} />

        {/* The Pile Routes */}
          <Route path="/piles/add" element={<PileDrawer/>} />

{/* Admin Routes */}
        {/* The Pile Routes */}
          <Route path="/admin/decks" element={<DeckManagement/>} />
          <Route path="/admin/decks/:deckId/cards" element={<CardManagement />} />
        </Route>





        {/* You can still have pages WITHOUT the layout (like a Login page) */}
       <Route path="/login" element={!user ? <Login /> : <Navigate replace to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate replace to="/" />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/500" element={<ServerError/>}/>
        <Route path="/403" element={<AccessDenied/>}/>
      </Routes>
    </BrowserRouter>
  );
};

export default App;