import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SplashScreen } from './pages/SplashScreen';
import { Uploader } from './pages/Uploader';
import { UserProfile } from './pages/UserProfile';
import { useEffect, useRef } from 'react';
import { useUserStore } from './stores/useUserStore';
import { useShallow } from 'zustand/react/shallow';

function App() {
  const tg = Telegram.WebApp;
  const {updateUser} = useUserStore(
    useShallow((state) => ({
      updateUser: state.updateUser
    }))
  );

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (tg?.initData) {
      tg.expand();
      tg.enableClosingConfirmation();
      tg.enableVerticalSwipes();
      tg.lockOrientation();
    }

    const user = tg?.initDataUnsafe?.user;
    if (user) {
      updateUser({
        id: String(user.id),
        nicName: user.username ?? user.first_name ?? 'Unknown',
        avatar: user.photo_url ?? null
      });
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen/>}/>
          <Route path="/uploader" element={<Uploader/>}/>
          <Route path="/profile" element={<UserProfile/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
