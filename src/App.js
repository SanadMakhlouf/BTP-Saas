import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Pages
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Devis from "./pages/Devis";
import CreerDevis from "./pages/CreerDevis";
import ModifierDevis from "./pages/ModifierDevis";
import Produits from "./pages/Produits";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Factures from "./pages/Factures";
import UserProfile from "./pages/UserProfile";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis"
            element={
              <ProtectedRoute>
                <Devis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creer-devis"
            element={
              <ProtectedRoute>
                <CreerDevis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/modifier-devis/:id"
            element={
              <ProtectedRoute>
                <ModifierDevis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produits"
            element={
              <ProtectedRoute>
                <Produits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/factures"
            element={
              <ProtectedRoute>
                <Factures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
