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
import Login from "./pages/Login";
import Register from "./pages/Register";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Clients />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Devis />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis/creer"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <CreerDevis />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devis/:id/modifier"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <ModifierDevis />
                </>
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
