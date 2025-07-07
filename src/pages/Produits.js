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
  const [editingProduit, setEditingProduit] = useState(null);
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

  const handleChange = (e, isEditing = false) => {
    const { name, value } = e.target;
    const setValue = isEditing ? setEditingProduit : setNewProduit;

    setValue((prev) => ({
      ...prev,
      [name]: name === "prix_unitaire" ? parseFloat(value) || "" : value,
    }));
  };

  const handleStartEdit = (produit) => {
    setEditingProduit({
      ...produit,
      prix_unitaire: produit.prix_unitaire.toString(),
    });
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProduit(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Utilisateur non connecté");
      }

      if (!editingProduit.nom || !editingProduit.prix_unitaire) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      const { data, error } = await supabase
        .from("produits")
        .update({
          nom: editingProduit.nom,
          description: editingProduit.description,
          prix_unitaire: parseFloat(editingProduit.prix_unitaire),
          unite: editingProduit.unite,
        })
        .eq("id", editingProduit.id)
        .select();

      if (error) {
        throw error;
      }

      setProduits((prev) =>
        prev.map((p) => (p.id === editingProduit.id ? data[0] : p))
      );

      setEditingProduit(null);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      setError(error.message || "Erreur lors de la modification du produit");
      setLoading(false);
    }
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

  const renderForm = (produit, isEditing = false) => {
    const handleFormSubmit = isEditing ? handleUpdate : handleSubmit;
    const handleFormChange = (e) => handleChange(e, isEditing);

    return (
      <div className={isEditing ? "edit-form" : "add-form"}>
        <h2>{isEditing ? "Modifier le produit" : "Nouveau produit"}</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Nom*</label>
            <input
              type="text"
              name="nom"
              value={produit.nom}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={produit.description || ""}
              onChange={handleFormChange}
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix unitaire (€)*</label>
              <input
                type="number"
                name="prix_unitaire"
                value={produit.prix_unitaire}
                onChange={handleFormChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Unité</label>
              <select
                name="unite"
                value={produit.unite}
                onChange={handleFormChange}
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
              {loading
                ? isEditing
                  ? "Modification en cours..."
                  : "Ajout en cours..."
                : isEditing
                ? "Enregistrer"
                : "Ajouter"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancelEdit}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

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
          {!editingProduit && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add"
            >
              {showAddForm ? "Annuler" : "Ajouter un produit"}
            </button>
          )}
        </div>
      </div>

      {showAddForm && !editingProduit && renderForm(newProduit)}
      {editingProduit && renderForm(editingProduit, true)}

      <div className="produits-grid">
        {filteredProduits.length === 0 ? (
          <div className="no-data">Aucun produit trouvé</div>
        ) : (
          filteredProduits.map((produit) => (
            <div key={produit.id} className="produit-card">
              <div className="produit-content">
                <h3 className="produit-nom">{produit.nom}</h3>
                <p className="produit-description">
                  {produit.description || "Aucune description"}
                </p>
                <div className="produit-details">
                  <div className="prix">
                    <span className="label">Prix unitaire</span>
                    <span className="valeur">
                      {produit.prix_unitaire.toFixed(2)} €
                    </span>
                  </div>
                  <div className="unite">
                    <span className="label">Unité</span>
                    <span className="valeur">
                      {unites.find((u) => u.value === produit.unite)?.label ||
                        produit.unite}
                    </span>
                  </div>
                </div>
              </div>
              <div className="produit-actions">
                <button
                  onClick={() => handleStartEdit(produit)}
                  className="btn-edit"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(produit.id)}
                  className="btn-delete"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Produits;
