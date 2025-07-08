import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import supabase from "../supabaseClient";
import DevisPDF from "../components/DevisPDF";
import "../styles/pages/Devis.css";

const Devis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [devis, setDevis] = useState([]);
  const [filteredDevis, setFilteredDevis] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Liste des statuts disponibles
  const statusOptions = [
    { value: "en_cours", label: "En cours" },
    { value: "envoyé", label: "Envoyé" },
    { value: "accepté", label: "Accepté" },
    { value: "refusé", label: "Refusé" },
    { value: "annulé", label: "Annulé" },
  ];

  useEffect(() => {
    fetchDevis();
    fetchClients();
  }, []);

  // Effet pour filtrer les devis quand searchTerm change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDevis(devis);
    } else {
      const filtered = devis.filter((d) => {
        const clientName = d.client?.nom?.toLowerCase() || "";
        return clientName.includes(searchTerm.toLowerCase());
      });
      setFilteredDevis(filtered);
    }
  }, [searchTerm, devis]);

  const fetchDevis = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      const { data, error } = await supabase
        .from("devis")
        .select(
          `
          *,
          client:clients(*)
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setDevis(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des devis:", error);
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

  const handleCreateFacture = async (devis) => {
    try {
      setLoading(true);
      console.log("Creating facture from devis:", devis);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier si une facture existe déjà pour ce devis
      const { data: existingFacture, error: checkError } = await supabase
        .from("factures")
        .select("id")
        .eq("devis_id", devis.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingFacture) {
        throw new Error("Une facture existe déjà pour ce devis");
      }

      // Vérifier que le devis est bien accepté
      if (devis.statut !== "accepté") {
        throw new Error("Le devis doit être accepté pour créer une facture");
      }

      // Générer le numéro de facture (FACT-YYYY-XXX)
      const date = new Date();
      const year = date.getFullYear();
      const { data: lastFacture, error: countError } = await supabase
        .from("factures")
        .select("numero")
        .ilike("numero", `FACT-${year}-%`)
        .order("numero", { ascending: false })
        .limit(1);

      if (countError) {
        throw countError;
      }

      let numero = 1;
      if (lastFacture && lastFacture.length > 0) {
        const lastNumber = parseInt(lastFacture[0].numero.split("-")[2]);
        numero = lastNumber + 1;
      }

      const numeroFacture = `FACT-${year}-${String(numero).padStart(3, "0")}`;

      // Calculer la date d'échéance (30 jours)
      const dateEmission = new Date().toISOString().split("T")[0];
      const dateEcheance = new Date();
      dateEcheance.setDate(dateEcheance.getDate() + 30);

      // Créer la facture
      const { data: newFacture, error: createError } = await supabase
        .from("factures")
        .insert({
          numero: numeroFacture,
          devis_id: devis.id,
          date_emission: dateEmission,
          date_echeance: dateEcheance.toISOString().split("T")[0],
          montant_ht: devis.montant_ht,
          tva: devis.taux_tva,
          montant_ttc: devis.montant_ttc,
          conditions_paiement:
            devis.conditions_paiement || "Paiement à 30 jours",
          user_id: session.user.id,
          statut: "en_attente",
        })
        .select()
        .single();

      console.log("Created facture:", newFacture);

      if (createError) {
        throw createError;
      }

      setLoading(false);
      // Rediriger vers la facture créée
      navigate(`/factures/${newFacture.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la facture:", error);
      setError(error.message || "Erreur lors de la création de la facture");
      setLoading(false);
    }
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
      case "accepté":
        return "status-badge success";
      case "en_cours":
        return "status-badge warning";
      case "refusé":
      case "annulé":
        return "status-badge danger";
      case "envoyé":
        return "status-badge info";
      default:
        return "status-badge";
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case "accepté":
        return "Accepté";
      case "en_cours":
        return "En cours";
      case "refusé":
        return "Refusé";
      case "annulé":
        return "Annulé";
      case "envoyé":
        return "Envoyé";
      default:
        return statut;
    }
  };

  const handlePreparePDF = async (id) => {
    try {
      const { data: devisData } = await supabase
        .from("devis")
        .select(
          "*, client:clients(*), ouvrages:ouvrages(*, prestations:prestations(*))"
        )
        .eq("id", id)
        .single();

      if (!devisData) {
        throw new Error("Devis non trouvé");
      }

      // Récupérer les informations du profil utilisateur
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", devisData.user_id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(
          "Erreur lors de la récupération du profil:",
          profileError
        );
      }

      setSelectedDevis({
        devis: devisData,
        client: devisData.client,
        userProfile: userProfile || null,
      });
    } catch (error) {
      console.error("Erreur lors de la préparation du PDF:", error);
      setError(error.message);
    }
  };

  // Fonction pour changer le statut d'un devis
  const handleStatusChange = async (devisId, newStatus) => {
    try {
      setStatusLoading(devisId);
      const { error: updateError } = await supabase
        .from("devis")
        .update({ statut: newStatus })
        .eq("id", devisId);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setDevis(
        devis.map((d) => (d.id === devisId ? { ...d, statut: newStatus } : d))
      );
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      setError("Erreur lors du changement de statut du devis");
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button onClick={fetchDevis} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="devis-container">
      <div className="devis-header">
        <div className="header-left">
          <h1>Devis</h1>
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
        <Link to="/creer-devis" className="btn-add">
          + Nouveau devis
        </Link>
      </div>

      {filteredDevis.length === 0 ? (
        <div className="no-data">
          {searchTerm
            ? "Aucun devis trouvé pour ce client."
            : "Aucun devis trouvé. Créez votre premier devis !"}
        </div>
      ) : (
        <div className="table-container">
          <table className="devis-table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant HT</th>
                <th>TVA</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevis.map((devis) => (
                <tr key={devis.id}>
                  <td>{devis.reference || "N° non défini"}</td>
                  <td className="client">
                    {devis.client?.nom || "Client inconnu"}
                  </td>
                  <td className="date">{formatDate(devis.created_at)}</td>
                  <td className="montant">{formatMontant(devis.montant_ht)}</td>
                  <td>
                    {devis.taux_tva ? `${devis.taux_tva}%` : "Non définie"}
                  </td>
                  <td className="montant">
                    {formatMontant(devis.montant_ttc)}
                  </td>
                  <td>
                    <div className="status-selector">
                      <select
                        value={devis.statut}
                        onChange={(e) =>
                          handleStatusChange(devis.id, e.target.value)
                        }
                        disabled={statusLoading === devis.id}
                        className={`status-select ${getStatusBadgeClass(
                          devis.statut
                        )}`}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {statusLoading === devis.id && (
                        <span className="status-loading">
                          <i className="fas fa-spinner fa-spin"></i>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="actions">
                    <div className="table-actions">
                      <Link
                        to={`/modifier-devis/${devis.id}`}
                        className="btn-action btn-edit"
                        title="Modifier le devis"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => handlePreparePDF(devis.id)}
                        className="btn-action btn-download"
                        title="Télécharger en PDF"
                      >
                        <i className="fas fa-file-pdf"></i>
                      </button>
                      <button
                        onClick={() => handleCreateFacture(devis)}
                        className="btn-action btn-create-facture"
                        disabled={devis.statut !== "accepté"}
                        title={
                          devis.statut !== "accepté"
                            ? "Le devis doit être accepté pour créer une facture"
                            : "Créer une facture"
                        }
                      >
                        <i className="fas fa-file-invoice"></i>
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
      {selectedDevis && (
        <div className="pdf-modal">
          <div className="pdf-modal-content">
            <h3>Télécharger le devis</h3>
            <PDFDownloadLink
              document={<DevisPDF {...selectedDevis} />}
              fileName={`${selectedDevis.devis.numero}.pdf`}
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
  );
};

export default Devis;
