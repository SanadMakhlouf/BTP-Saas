import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "../styles/pages/Clients.css";

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // État pour le formulaire
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    code_postal: "",
    ville: "",
  });

  // Effet pour filtrer les clients quand searchTerm change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter((client) =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  useEffect(() => {
    const initializeData = async () => {
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

        // Récupérer les clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", session.user.id)
          .order("nom");

        if (clientsError) {
          console.error("Erreur clients:", clientsError);
          throw new Error("Impossible de récupérer la liste des clients");
        }

        setClients(clientsData || []);
        setFilteredClients(clientsData || []);
      } catch (error) {
        console.error("Erreur complète:", error);
        setError(error.message || "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (client) => {
    setEditingClient(client.id);
    setFormData(client);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setFormData({
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      code_postal: "",
      ville: "",
    });
    setShowForm(false);
  };

  const handleDelete = async (clientId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);

      if (error) throw error;

      setClients((prev) => prev.filter((client) => client.id !== clientId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression du client");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      if (editingClient) {
        // Mise à jour d'un client existant
        const { data, error } = await supabase
          .from("clients")
          .update(formData)
          .eq("id", editingClient)
          .select();

        if (error) throw error;

        setClients((prev) =>
          prev.map((client) => (client.id === editingClient ? data[0] : client))
        );
      } else {
        // Création d'un nouveau client
        const { data, error } = await supabase
          .from("clients")
          .insert([
            {
              ...formData,
              user_id: session.user.id,
            },
          ])
          .select();

        if (error) throw error;

        setClients((prev) => [...prev, data[0]]);
      }

      setFormData({
        nom: "",
        email: "",
        telephone: "",
        adresse: "",
        code_postal: "",
        ville: "",
      });
      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Erreur lors de l'opération:", error);
      setError(
        `Erreur lors de ${
          editingClient ? "la modification" : "l'ajout"
        } du client`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clients-container">
        <div className="loading">Chargement des clients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clients-container">
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
    <div className="clients-container">
      <div className="clients-header">
        <h1>Clients</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
          <button
            className="btn-add"
            onClick={() => {
              if (editingClient) {
                handleCancelEdit();
              } else {
                setShowForm(!showForm);
              }
            }}
          >
            {showForm ? "Annuler" : "Ajouter un client"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="client-form-container">
          <h2>{editingClient ? "Modifier le client" : "Nouveau client"}</h2>
          <form onSubmit={handleSubmit} className="client-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nom / Raison sociale*</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Code postal</label>
                <input
                  type="text"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Ville</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading
                  ? "Enregistrement..."
                  : editingClient
                  ? "Modifier"
                  : "Enregistrer"}
              </button>
              {editingClient && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
            <div className="delete-confirm-actions">
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={loading}
              >
                {loading ? "Suppression..." : "Confirmer"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="clients-list">
        {filteredClients.length === 0 ? (
          <div className="empty-state">
            {searchTerm
              ? "Aucun client ne correspond à votre recherche."
              : "Aucun client pour le moment. Commencez par en ajouter un !"}
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nom / Raison sociale</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th>Code postal</th>
                  <th>Ville</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.nom}</td>
                    <td>{client.email || "-"}</td>
                    <td>{client.telephone || "-"}</td>
                    <td>{client.adresse || "-"}</td>
                    <td>{client.code_postal || "-"}</td>
                    <td>{client.ville || "-"}</td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(client)}
                        disabled={loading}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setShowDeleteConfirm(client.id)}
                        disabled={loading}
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
    </div>
  );
};

export default Clients;
