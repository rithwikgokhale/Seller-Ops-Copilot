import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ChatPage from "./pages/ChatPage";
import SavedPage from "./pages/SavedPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/saved" element={<SavedPage />} />
        </Routes>
      </main>
    </div>
  );
}
