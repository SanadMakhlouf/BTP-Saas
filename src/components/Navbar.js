import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";
import "../styles/components/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error.message);
    }
  };

  // Ne pas afficher la navbar sur les pages de login et register
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          BTP Devis
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link
              to="/"
              className={`nav-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link
              to="/devis"
              className={`nav-link ${
                location.pathname.includes("/devis") ? "active" : ""
              }`}
            >
              Devis
            </Link>
          </li>
          <li>
            <Link
              to="/factures"
              className={`nav-link ${
                location.pathname.includes("/factures") ? "active" : ""
              }`}
            >
              Factures
            </Link>
          </li>
          <li>
            <Link
              to="/clients"
              className={`nav-link ${
                location.pathname === "/clients" ? "active" : ""
              }`}
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              to="/produits"
              className={`nav-link ${
                location.pathname === "/produits" ? "active" : ""
              }`}
            >
              Produits
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`nav-link ${
                location.pathname === "/profile" ? "active" : ""
              }`}
            >
              Mon entreprise
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="nav-link">
              Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
