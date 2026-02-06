import { NavLink } from "react-router-dom";

const link =
  "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const active = `${link} bg-indigo-600 text-white`;
const inactive = `${link} text-gray-600 hover:bg-gray-200`;

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo / Title */}
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl">&#9776;</span>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Seller Ops Copilot
          </h1>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            Chat
          </NavLink>
          <NavLink
            to="/saved"
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            Saved
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
