// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/login';
import HomePage from './pages/HomePage';
import "./App.css";
import NotFound from './pages/NotFound';
import Register from './pages/register';
import Profile from './pages/Profile';
import useAuthStore from './stores/authStore';
import DeckLibrary from './pages/DeckLibrary';
import DeckExplorer from './pages/DeckExplorer';
import AccessDenied from './pages/AccessDenied';
import ServerError from './pages/ServerError';
const App = () => {
   const { user } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        {/* Everything inside this route will use the Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile/>}/>

        {/* The Deck Routes */}
          <Route path="/decks" element={<DeckLibrary/>} />
          <Route path="/decks/:deckId" element={<DeckExplorer />} />
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