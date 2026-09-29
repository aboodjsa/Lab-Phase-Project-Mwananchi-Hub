import { Routes, Route, Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import Home from "./pages/Home";
import About from "./pages/About";
import Browse from "./pages/Browse";
import Provider from "./pages/Provider";
import { Login, Register } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
const Guard = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};
export default function App() {
  const { user, logout } = useAuth(), nav = useNavigate();
  return (<>
    <nav>
      <Link to="/" className="logo">Mwananchi<span>Hub</span></Link>
      <div className="links">
        <NavLink to="/" end>Home</NavLink><NavLink to="/providers">Find a pro</NavLink><NavLink to="/about">About</NavLink>
        {user ? <>
          <NavLink to={user.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</NavLink>
          <span className="me">{user.name.split(" ")[0]}</span>
          <button className="ghost" onClick={() => { logout(); nav("/"); }}>Log out</button></> :
          <><NavLink to="/login">Log in</NavLink><Link className="cta" to="/register">Get started</Link></>}
      </div>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<main><About /></main>} />
      <Route path="/providers" element={<main><Browse /></main>} />
      <Route path="/provider/:id" element={<main><Provider /></main>} />
      <Route path="/login" element={<main><Login /></main>} />
      <Route path="/register" element={<main><Register /></main>} />
      <Route path="/dashboard" element={<main><Guard><Dashboard /></Guard></main>} />
      <Route path="/admin" element={<main><Guard role="admin"><Admin /></Guard></main>} />
    </Routes>
    <footer>
      <div><b className="logo">Mwananchi<span>Hub</span></b><p>Book trusted local professionals for the jobs you need done.</p></div>
      <div><b>Explore</b><Link to="/providers">Find a pro</Link><Link to="/about">About us</Link></div>
      <div><b>Account</b><Link to="/login">Log in</Link><Link to="/register">Sign up</Link></div>
      <p className="copy">© {new Date().getFullYear()} Service Mwananchi Hub. All rights reserved.</p>
    </footer>
  </>);
}
