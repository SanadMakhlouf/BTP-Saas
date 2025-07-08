import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import supabase from "../supabaseClient";
import FacturePDF from "../components/FacturePDF";
import "../styles/pages/Factures.css";

const Factures = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusLoading, setStatusLoading] = useState(null);
  const navigate = useNavigate();

  // Liste des statuts disponibles
  const statusOptions = [
    { value: "en_attente", label: "En attente" },
    { value: "payee", label: "Payée" },
    { value: "annulee", label: "Annulée" },
  ];

  useEffect(() => {
    fetchFactures();
    fetchClients();
  }, []);

  // Effet pour filtrer les factures quand searchTerm change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFactures(factures);
    } else {
      const filtered = factures.filter((facture) => {
        const clientName = getClientName(
          facture.devis?.client_id
        ).toLowerCase();
        return clientName.includes(searchTerm.toLowerCase());
      });
      setFilteredFactures(filtered);
    }
  }, [searchTerm, factures, clients]);

  const fetchFactures = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      const { data: facturesData, error: facturesError } = await supabase
        .from("factures")
        .select("*, devis:devis_id(*)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (facturesError) {
        throw facturesError;
      }

      setFactures(facturesData || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("nom");

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
    }
  };

  const handleStatusChange = async (factureId, newStatus) => {
    try {
      setStatusLoading(factureId);
      const { error: updateError } = await supabase
        .from("factures")
        .update({ statut: newStatus })
        .eq("id", factureId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setFactures(
        factures.map((f) =>
          f.id === factureId ? { ...f, statut: newStatus } : f
        )
      );
      setFilteredFactures(
        filteredFactures.map((f) =>
          f.id === factureId ? { ...f, statut: newStatus } : f
        )
      );
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      setError("Erreur lors du changement de statut de la facture");
    } finally {
      setStatusLoading(null);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.nom : "Client inconnu";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(montant);
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case "payee":
        return "status-badge success";
      case "en_attente":
        return "status-badge warning";
      case "annulee":
        return "status-badge danger";
      default:
        return "status-badge";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "payee":
        return "Payée";
      case "en_attente":
        return "En attente";
      case "annulee":
        return "Annulée";
      default:
        return statut;
    }
  };

  const handlePreparePDF = async (factureId) => {
    try {
      const { data: factureData } = await supabase
        .from("factures")
        .select(
          `
          *,
          devis:devis_id(
            *,
            client:client_id(*),
            ouvrages:ouvrages(
              *,
              prestations:prestations(*)
            )
          )
        `
        )
        .eq("id", factureId)
        .single();

      if (!factureData) {
        throw new Error("Facture non trouvée");
      }

      // Récupérer les informations du profil utilisateur
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", factureData.user_id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(
          "Erreur lors de la récupération du profil:",
          profileError
        );
      }

      // Préparer les données pour le PDF
      const facturePDFData = {
        facture: {
          ...factureData,
          prestations: factureData.devis.ouvrages.flatMap((o) => o.prestations),
        },
        client: factureData.devis.client,
        userProfile: userProfile || null,
      };

      setSelectedFacture(facturePDFData);
    } catch (error) {
      console.error("Erreur lors de la préparation du PDF:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button onClick={fetchFactures} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="factures-container">
      <div className="factures-header">
        <h1>Factures</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher par nom de client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="clear-search"
              title="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredFactures.length === 0 ? (
        <div className="no-data">
          {searchTerm
            ? "Aucune facture trouvée pour ce client."
            : "Aucune facture trouvée."}
        </div>
      ) : (
        <div className="table-container">
          <table className="factures-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Devis associé</th>
                <th>Client</th>
                <th>Date d'émission</th>
                <th>Date d'échéance</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFactures.map((facture) => (
                <tr key={facture.id}>
                  <td>{facture.numero}</td>
                  <td>{facture.devis?.numero || "N/A"}</td>
                  <td className="client">
                    {getClientName(facture.devis?.client_id)}
                  </td>
                  <td className="date">{formatDate(facture.date_emission)}</td>
                  <td className="date">{formatDate(facture.date_echeance)}</td>
                  <td className="montant">
                    {formatMontant(facture.montant_ht)}
                  </td>
                  <td>{facture.tva ? `${facture.tva}%` : "Non définie"}</td>
                  <td className="montant">
                    {formatMontant(facture.montant_ttc)}
                  </td>
                  <td>
                    <div className="status-selector">
                      <select
                        value={facture.statut}
                        onChange={(e) =>
                          handleStatusChange(facture.id, e.target.value)
                        }
                        disabled={statusLoading === facture.id}
                        className={`status-select ${getStatusBadgeClass(
                          facture.statut
                        )}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {statusLoading === facture.id && (
                        <span className="status-loading">
                          <i className="fas fa-spinner fa-spin"></i>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="actions">
                    <div className="table-actions">
                      <button
                        onClick={() => navigate(`/factures/${facture.id}`)}
                        className="btn-action btn-view"
                        title="Voir la facture"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handlePreparePDF(facture.id)}
                        className="btn-action btn-download"
                        title="Télécharger en PDF"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour le PDF */}
      {selectedFacture && (
        <div className="pdf-modal">
          <div className="pdf-modal-content">
            <h3>Télécharger la facture</h3>
            <PDFDownloadLink
              document={<FacturePDF {...selectedFacture} />}
              fileName={`${selectedFacture.facture.numero}.pdf`}
              className="btn-download-pdf"
            >
              {({ loading }) =>
                loading ? "Préparation..." : "Télécharger le PDF"
              }
            </PDFDownloadLink>
            <button
              onClick={() => setSelectedFacture(null)}
              className="btn-close-modal"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Factures;
