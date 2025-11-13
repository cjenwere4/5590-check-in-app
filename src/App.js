import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CheckInPage from './pages/CheckInPage';
import IcebreakerDeck from './pages/IcebreakerDeck';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CheckInPage />} />
        <Route path="/icebreakers" element={<IcebreakerDeck />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
