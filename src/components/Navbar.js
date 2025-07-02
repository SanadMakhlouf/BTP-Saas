import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">BTP Devis</div>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className="nav-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/clients" className="nav-link">
              Clients
            </Link>
          </li>
          <li>
            <Link to="/devis" className="nav-link">
              Devis
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
