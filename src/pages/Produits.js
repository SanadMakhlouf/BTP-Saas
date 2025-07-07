import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import { mockProduits } from "../data/mockData";
import "../styles/pages/Produits.css";

const Produits = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [produits, setProduits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduit, setNewProduit] = useState({
    nom: "",
    description: "",
    prix_unitaire: "",
    unite: "unité",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const unites = [
    { value: "unité", label: "Unité" },
    { value: "m2", label: "m²" },
    { value: "m3", label: "m³" },
    { value: "ml", label: "ml" },
    { value: "h", label: "Heure" },
    { value: "j", label: "Jour" },
    { value: "forfait", label: "Forfait" },
    { value: "sac", label: "Sac" },
    { value: "pot", label: "Pot" },
  ];

  useEffect(() => {
    const fetchProduits = async () => {
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
          throw new Error("Utilisateur non connecté");
        }

        // Récupérer les produits
        const { data, error } = await supabase
          .from("produits")
          .select("*")
          .eq("user_id", session.user.id)
          .order("nom");

        if (error) {
          console.error("Erreur de récupération des produits:", error);
          throw new Error("Impossible de récupérer la liste des produits");
        }

        // Si aucun produit n'est trouvé, utiliser les données de test
        if (data && data.length === 0) {
          // Ajouter les produits de test à la base de données
          const produitsWithUserId = mockProduits.map((produit) => ({
            ...produit,
            user_id: session.user.id,
          }));

          const { data: insertedData, error: insertError } = await supabase
            .from("produits")
            .insert(produitsWithUserId)
            .select();

          if (insertError) {
            console.error(
              "Erreur d'insertion des produits de test:",
              insertError
            );
            throw new Error("Impossible d'ajouter les produits de test");
          }

          setProduits(insertedData || []);
        } else {
          setProduits(data || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur complète:", error);
        setError(error.message || "Une erreur est survenue");
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduit((prev) => ({
      ...prev,
      [name]: name === "prix_unitaire" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      // Vérifier que tous les champs requis sont remplis
      if (!newProduit.nom || !newProduit.prix_unitaire) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Ajouter le produit
      const { data, error } = await supabase
        .from("produits")
        .insert([
          {
            user_id: session.user.id,
            nom: newProduit.nom,
            description: newProduit.description,
            prix_unitaire: parseFloat(newProduit.prix_unitaire),
            unite: newProduit.unite,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // Ajouter le nouveau produit à la liste
      setProduits((prev) => [...prev, data[0]]);

      // Réinitialiser le formulaire
      setNewProduit({
        nom: "",
        description: "",
        prix_unitaire: "",
        unite: "unité",
      });

      setShowAddForm(false);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      setError(error.message || "Erreur lors de l'ajout du produit");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setLoading(true);

      try {
        const { error } = await supabase.from("produits").delete().eq("id", id);

        if (error) {
          throw error;
        }

        // Mettre à jour la liste des produits
        setProduits((prev) => prev.filter((produit) => produit.id !== id));
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setError(error.message || "Erreur lors de la suppression du produit");
        setLoading(false);
      }
    }
  };

  const filteredProduits = produits.filter(
    (produit) =>
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && produits.length === 0) {
    return (
      <div className="produits-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="produits-container">
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
    <div className="produits-container">
      <div className="produits-header">
        <h1>Bibliothèque de produits</h1>
        <div className="actions">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-add"
          >
            {showAddForm ? "Annuler" : "Ajouter un produit"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h2>Nouveau produit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom*</label>
              <input
                type="text"
                name="nom"
                value={newProduit.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={newProduit.description}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prix unitaire (€)*</label>
                <input
                  type="number"
                  name="prix_unitaire"
                  value={newProduit.prix_unitaire}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Unité</label>
                <select
                  name="unite"
                  value={newProduit.unite}
                  onChange={handleChange}
                >
                  {unites.map((unite) => (
                    <option key={unite.value} value={unite.value}>
                      {unite.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Ajout en cours..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="produits-list">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Prix unitaire</th>
              <th>Unité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((produit) => (
              <tr key={produit.id}>
                <td>{produit.nom}</td>
                <td>{produit.description}</td>
                <td>{produit.prix_unitaire.toFixed(2)} €</td>
                <td>
                  {unites.find((u) => u.value === produit.unite)?.label ||
                    produit.unite}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(produit.id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredProduits.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Produits;
