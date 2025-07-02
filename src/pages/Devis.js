import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "../styles/pages/Devis.css";

const Devis = () => {
  const navigate = useNavigate();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("tous");

  const fetchDevis = async () => {
    try {
      // Vérifier la session
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError) {
        console.error("Erreur d'authentification:", authError);
        throw new Error(
          "Erreur d'authentification. Veuillez vous reconnecter."
        );
      }

      if (!session) {
        navigate("/login");
        return;
      }

      // Récupérer les devis
      const { data: devisData, error: devisError } = await supabase
        .from("devis")
        .select(
          `
          *,
          client:clients(nom)
        `
        )
        .eq("user_id", session.user.id)
        .order("date_creation", { ascending: false });

      if (devisError) {
        console.error("Erreur devis:", devisError);
        throw new Error("Impossible de récupérer la liste des devis");
      }

      setDevis(devisData || []);
    } catch (error) {
      console.error("Erreur complète:", error);
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, [navigate]);

  const handleCreateDevis = () => {
    navigate("/devis/creer");
  };

  const handleDelete = async (id) => {
    try {
      const { error: devisError } = await supabase
        .from("devis")
        .delete()
        .eq("id", id);

      if (devisError) throw devisError;
      await fetchDevis();
    } catch (error) {
      console.error("Erreur lors de la suppression du devis:", error);
      setError("Erreur lors de la suppression du devis");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("devis")
        .update({ statut: newStatus })
        .eq("id", id);

      if (error) throw error;
      await fetchDevis();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      setError("Erreur lors de la mise à jour du statut");
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      en_cours: "status-pending",
      envoye: "status-sent",
      accepte: "status-accepted",
      refuse: "status-rejected",
      annule: "status-cancelled",
    };
    return `status ${statusClasses[status] || "status-pending"}`;
  };

  const filteredDevis =
    filter === "tous" ? devis : devis.filter((d) => d.statut === filter);

  if (loading) {
    return (
      <div className="devis-container">
        <div className="loading">Chargement des devis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="devis-container">
        <div className="alert alert-error">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="btn-retry"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="devis-container">
      <div className="devis-header">
        <h1>Devis</h1>
        <button className="btn-add" onClick={handleCreateDevis}>
          Créer un devis
        </button>
      </div>

      <div className="devis-list">
        {devis.length === 0 ? (
          <div className="empty-state">
            Aucun devis pour le moment. Commencez par en créer un !
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date création</th>
                  <th>Montant HT</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devis.map((devis) => (
                  <tr key={devis.id}>
                    <td>{devis.reference}</td>
                    <td>{devis.client?.nom || "-"}</td>
                    <td>
                      {new Date(devis.date_creation).toLocaleDateString()}
                    </td>
                    <td>{devis.montant_ht.toFixed(2)} €</td>
                    <td>{devis.montant_ttc.toFixed(2)} €</td>
                    <td>
                      <select
                        value={devis.statut}
                        onChange={(e) =>
                          handleStatusChange(devis.id, e.target.value)
                        }
                        className={`status ${devis.statut}`}
                      >
                        <option value="en_cours">En cours</option>
                        <option value="envoyé">Envoyé</option>
                        <option value="accepté">Accepté</option>
                        <option value="refusé">Refusé</option>
                        <option value="annulé">Annulé</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/devis/${devis.id}`)}
                        className="btn-view"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleDelete(devis.id)}
                        className="btn-delete"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="filter-buttons">
        <button
          onClick={() => setFilter("tous")}
          className={`filter-btn ${filter === "tous" ? "active" : ""}`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("en_cours")}
          className={`filter-btn ${filter === "en_cours" ? "active" : ""}`}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter("envoye")}
          className={`filter-btn ${filter === "envoye" ? "active" : ""}`}
        >
          Envoyés
        </button>
        <button
          onClick={() => setFilter("accepte")}
          className={`filter-btn ${filter === "accepte" ? "active" : ""}`}
        >
          Acceptés
        </button>
        <button
          onClick={() => setFilter("refuse")}
          className={`filter-btn ${filter === "refuse" ? "active" : ""}`}
        >
          Refusés
        </button>
      </div>
    </div>
  );
};

export default Devis;
