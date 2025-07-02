import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import supabase from "../supabaseClient";
import DevisPDF from "../components/DevisPDF";
import "../styles/pages/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDevis: 0,
    devisEnCours: 0,
    devisAcceptes: 0,
  });
  const [recentDevis, setRecentDevis] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return navigate("/login");

      const userId = session.user.id;

      const { data: clients = [] } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId);

      const { data: devis = [] } = await supabase
        .from("devis")
        .select("*")
        .eq("user_id", userId);

      const enCours = devis.filter((d) => d.statut === "en_cours").length;
      const acceptes = devis.filter((d) => d.statut === "accepté").length;

      setStats({
        totalClients: clients.length,
        totalDevis: devis.length,
        devisEnCours: enCours,
        devisAcceptes: acceptes,
      });

      const { data: recent = [] } = await supabase
        .from("devis")
        .select("*, clients (nom)")
        .eq("user_id", userId)
        .order("date_creation", { ascending: false })
        .limit(5);

      setRecentDevis(recent);
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handlePreparePDF = async (id) => {
    const { data: devisData } = await supabase
      .from("devis")
      .select(
        "*, client:clients(*), ouvrages:ouvrages(*, prestations:prestations(*))"
      )
      .eq("id", id)
      .single();

    const { data: userData } = await supabase.auth.getUser();

    setSelectedDevis({
      devis: devisData,
      client: devisData.client,
      user: userData.user,
    });
  };

  if (loading) return <div className="dashboard-loading">Chargement...</div>;

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Tableau de bord</h1>
          </div>
          <div className="header-right">
            <Link to="/devis/creer" className="btn-create">
              <i className="fas fa-plus"></i> Nouveau devis
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              <i className="fas fa-sign-out-alt"></i> Déconnexion
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon clients">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h3>Clients</h3>
              <p className="stat-value">{stats.totalClients}</p>
              <Link to="/clients" className="stat-link">
                Voir tous les clients
              </Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon devis">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div className="stat-content">
              <h3>Total Devis</h3>
              <p className="stat-value">{stats.totalDevis}</p>
              <Link to="/devis" className="stat-link">
                Voir tous les devis
              </Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon en-cours">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>En cours</h3>
              <p className="stat-value">{stats.devisEnCours}</p>
              <Link to="/devis?status=en_cours" className="stat-link">
                Voir les devis en cours
              </Link>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon acceptes">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>Acceptés</h3>
              <p className="stat-value">{stats.devisAcceptes}</p>
              <Link to="/devis?status=accepte" className="stat-link">
                Voir les devis acceptés
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-devis-section">
          <h2>Devis récents</h2>
          {recentDevis.length > 0 ? (
            <table className="devis-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Montant HT</th>
                  <th>Montant TTC</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentDevis.map((devis) => (
                  <tr key={devis.id}>
                    <td>{devis.reference}</td>
                    <td>{devis.clients?.nom || "Inconnu"}</td>
                    <td>
                      {new Date(devis.date_creation).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>
                    <td>{devis.montant_ht?.toFixed(2)} €</td>
                    <td>{devis.montant_ttc?.toFixed(2)} €</td>
                    <td>
                      <span className={`status-badge ${devis.statut}`}>
                        {devis.statut}
                      </span>
                    </td>
                    <td
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Link
                        to={`/devis/${devis.id}/modifier`}
                        className="btn-action edit"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="btn-action pdf"
                        onClick={() => handlePreparePDF(devis.id)}
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun devis récent</p>
          )}
        </div>

        {/* Modal pour le PDF */}
        {selectedDevis && (
          <div className="pdf-modal">
            <div className="pdf-modal-content">
              <h3>Télécharger le devis</h3>
              <PDFDownloadLink
                document={<DevisPDF {...selectedDevis} />}
                fileName={`${selectedDevis.devis.reference}.pdf`}
                className="btn-download-pdf"
              >
                {({ loading }) =>
                  loading ? "Préparation..." : "Télécharger le PDF"
                }
              </PDFDownloadLink>
              <button
                onClick={() => setSelectedDevis(null)}
                className="btn-close-modal"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
