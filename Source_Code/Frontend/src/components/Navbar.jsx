import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {

const { user, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = () => {
logout();
navigate("/");
};

const getDashboardLink = () => {
if (!user) return null;

const map = {
user:"/user",
planner:"/planner",
vendor:"/vendor",
admin:"/admin"
};

return map[user.role];
};

return (

<header className="navbar">

<div className="nav-container">

<Link to="/" className="nav-logo">
💍 NextStep
</Link>

<nav className="nav-links">

{/* <Link to="/destinations">Destinations</Link>
<Link to="/vendors">Vendors</Link>
<Link to="/packages">Packages</Link> */}

</nav>

<div className="nav-actions">

{user ? (
<>

<Link to={getDashboardLink()} className="dashboard-link">
Dashboard
</Link>

<span className="user-name">
{user.name || user.email}
</span>

<button onClick={handleLogout} className="logout-btn">
Logout
</button>

</>
) : (

<>

<Link to="/login" className="login-link">
Login
</Link>

<Link to="/signup" className="signup-btn">
Start Planning
</Link>

</>

)}

</div>

</div>

</header>

);

};

export default Navbar;