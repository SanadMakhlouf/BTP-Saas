import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "../styles/pages/CreerDevis.css";

const CreerDevis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);

  // État du formulaire principal
  const [formData, setFormData] = useState({
    client_id: "",
    reference: "",
    date_creation: new Date().toISOString().split("T")[0],
    date_validite: "",
    conditions_paiement: "À réception de facture",
    notes: "",
    taux_tva: 20, // Valeur par défaut
  });

  // État pour les ouvrages et prestations
  const [ouvrages, setOuvrages] = useState([
    {
      id: 1,
      titre: "Ouvrage 1",
      prestations: [
        {
          id: 1,
          description: "",
          quantite: 1,
          unite: "unité",
          prix_unitaire: 0,
          total_ht: 0,
          produit_id: "",
        },
      ],
    },
  ]);

  // Totaux calculés
  const [totaux, setTotaux] = useState({
    totalHT: 0,
    montantTVA: 0,
    totalTTC: 0,
  });

  // Liste des unités disponibles
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

  // Effet pour charger le profil utilisateur et initialiser les données
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Vérifier la session
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) {
          console.error("Erreur d'authentification:", authError);
          throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
        }

        if (!session) {
          navigate("/login");
          return;
        }

        // Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Erreur lors de la récupération du profil:", profileError);
        } else if (profile) {
          // Mettre à jour le taux de TVA avec vat_number du profil
          setFormData(prev => ({
            ...prev,
            taux_tva: profile.vat_number || prev.taux_tva
          }));
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

        // Récupérer les produits
        const { data: produitsData, error: produitsError } = await supabase
          .from("produits")
          .select("*")
          .eq("user_id", session.user.id)
          .order("nom");

        if (produitsError) {
          console.error("Erreur produits:", produitsError);
          throw new Error("Impossible de récupérer la liste des produits");
        }

        setClients(clientsData || []);
        setProduits(produitsData || []);
        setLoading(false);
      } catch (error) {
        console.error("Erreur complète:", error);
        setError(error.message || "Une erreur est survenue");
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  // Gérer les changements dans le formulaire principal
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gérer les changements dans les titres d'ouvrages
  const handleOuvrageChange = (index, value) => {
    const newOuvrages = [...ouvrages];
    newOuvrages[index].titre = value;
    setOuvrages(newOuvrages);
  };

  // Gérer les changements dans les prestations
  const handlePrestationChange = (
    ouvrageIndex,
    prestationIndex,
    name,
    value
  ) => {
    const newOuvrages = [...ouvrages];
    newOuvrages[ouvrageIndex].prestations[prestationIndex][name] = value;

    // Si on sélectionne un produit, mettre à jour les informations de la prestation
    if (name === "produit_id" && value) {
      const produitSelectionne = produits.find((p) => p.id === value);
      if (produitSelectionne) {
        newOuvrages[ouvrageIndex].prestations[prestationIndex].description =
          produitSelectionne.description || produitSelectionne.nom;
        newOuvrages[ouvrageIndex].prestations[prestationIndex].unite =
          produitSelectionne.unite;
        newOuvrages[ouvrageIndex].prestations[prestationIndex].prix_unitaire =
          produitSelectionne.prix_unitaire;

        // Recalculer le total HT
        const quantite =
          parseFloat(
            newOuvrages[ouvrageIndex].prestations[prestationIndex].quantite
          ) || 0;
        newOuvrages[ouvrageIndex].prestations[prestationIndex].total_ht =
          quantite * produitSelectionne.prix_unitaire;
      }
    }

    // Calculer le total HT de la prestation
    if (name === "quantite" || name === "prix_unitaire") {
      const prestation = newOuvrages[ouvrageIndex].prestations[prestationIndex];
      const quantite = parseFloat(prestation.quantite) || 0;
      const prix = parseFloat(prestation.prix_unitaire) || 0;
      newOuvrages[ouvrageIndex].prestations[prestationIndex].total_ht =
        quantite * prix;
    }

    setOuvrages(newOuvrages);
    calculerTotaux(newOuvrages);
  };

  // Ajouter un ouvrage
  const ajouterOuvrage = () => {
    const newId =
      ouvrages.length > 0 ? Math.max(...ouvrages.map((o) => o.id)) + 1 : 1;
    setOuvrages([
      ...ouvrages,
      {
        id: newId,
        titre: `Ouvrage ${newId}`,
        prestations: [
          {
            id: 1,
            description: "",
            quantite: 1,
            unite: "unité",
            prix_unitaire: 0,
            total_ht: 0,
            produit_id: "",
          },
        ],
      },
    ]);
  };

  // Supprimer un ouvrage
  const supprimerOuvrage = (index) => {
    if (ouvrages.length > 1) {
      const newOuvrages = [...ouvrages];
      newOuvrages.splice(index, 1);
      setOuvrages(newOuvrages);
      calculerTotaux(newOuvrages);
    }
  };

  // Ajouter une prestation à un ouvrage
  const ajouterPrestation = (ouvrageIndex) => {
    const newOuvrages = [...ouvrages];
    const prestations = newOuvrages[ouvrageIndex].prestations;
    const newId =
      prestations.length > 0
        ? Math.max(...prestations.map((p) => p.id)) + 1
        : 1;

    newOuvrages[ouvrageIndex].prestations.push({
      id: newId,
      description: "",
      quantite: 1,
      unite: "unité",
      prix_unitaire: 0,
      total_ht: 0,
      produit_id: "",
    });

    setOuvrages(newOuvrages);
  };

  // Supprimer une prestation
  const supprimerPrestation = (ouvrageIndex, prestationIndex) => {
    const newOuvrages = [...ouvrages];
    const prestations = newOuvrages[ouvrageIndex].prestations;

    if (prestations.length > 1) {
      newOuvrages[ouvrageIndex].prestations.splice(prestationIndex, 1);
      setOuvrages(newOuvrages);
      calculerTotaux(newOuvrages);
    }
  };

  // Calculer les totaux
  const calculerTotaux = (ouvragesData) => {
    let totalHT = 0;

    ouvragesData.forEach((ouvrage) => {
      ouvrage.prestations.forEach((prestation) => {
        totalHT += parseFloat(prestation.total_ht) || 0;
      });
    });

    const montantTVA = totalHT * (parseFloat(formData.taux_tva) / 100);
    const totalTTC = totalHT + montantTVA;

    setTotaux({
      totalHT,
      montantTVA,
      totalTTC,
    });
  };

  // Générer une référence de devis
  const genererReference = () => {
    const date = new Date();
    const annee = date.getFullYear().toString().slice(-2);
    const mois = (date.getMonth() + 1).toString().padStart(2, "0");
    const jour = date.getDate().toString().padStart(2, "0");
    const aleatoire = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    const reference = `DEV-${annee}${mois}${jour}-${aleatoire}`;
    setFormData((prev) => ({
      ...prev,
      reference,
    }));
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

      if (!formData.client_id) {
        throw new Error("Veuillez sélectionner un client");
      }

      // Vérifier que chaque prestation a une description
      let prestationsValides = true;
      ouvrages.forEach((ouvrage) => {
        ouvrage.prestations.forEach((prestation) => {
          if (!prestation.description.trim()) {
            prestationsValides = false;
          }
        });
      });

      if (!prestationsValides) {
        throw new Error("Toutes les prestations doivent avoir une description");
      }

      // Créer le devis
      const { data: devisData, error: devisError } = await supabase
        .from("devis")
        .insert([
          {
            user_id: session.user.id,
            client_id: formData.client_id,
            reference: formData.reference,
            date_creation: formData.date_creation,
            date_validite: formData.date_validite,
            conditions_paiement: formData.conditions_paiement,
            notes: formData.notes,
            taux_tva: parseFloat(formData.taux_tva),
            montant_ht: totaux.totalHT,
            montant_tva: totaux.montantTVA,
            montant_ttc: totaux.totalTTC,
            statut: "en_cours",
          },
        ])
        .select();

      if (devisError) throw devisError;

      const devisId = devisData[0].id;

      // Créer les ouvrages et prestations
      for (const [index, ouvrage] of ouvrages.entries()) {
        const { data: ouvrageData, error: ouvrageError } = await supabase
          .from("ouvrages")
          .insert([
            {
              devis_id: devisId,
              titre: ouvrage.titre,
              ordre: index,
            },
          ])
          .select();

        if (ouvrageError) throw ouvrageError;

        const ouvrageId = ouvrageData[0].id;

        // Créer les prestations pour cet ouvrage
        const prestationsToInsert = ouvrage.prestations.map(
          (prestation, prestationIndex) => ({
            ouvrage_id: ouvrageId,
            devis_id: devisId,
            description: prestation.description,
            quantite: parseFloat(prestation.quantite),
            unite: prestation.unite,
            prix_unitaire: parseFloat(prestation.prix_unitaire),
            total_ht: parseFloat(prestation.total_ht),
            produit_id: prestation.produit_id || null,
            ordre: prestationIndex,
          })
        );

        const { error: prestationsError } = await supabase
          .from("prestations")
          .insert(prestationsToInsert);

        if (prestationsError) throw prestationsError;
      }

      navigate(`/devis/${devisId}`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setError(error.message || "Erreur lors de la création du devis");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="creer-devis-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="creer-devis-container">
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
    <div className="creer-devis-container">
      <h1>Créer un devis</h1>

      <div className="main-content">
        <div className="left-column">
          <h2>Informations générales</h2>

          <div className="form-group">
            <label>Client*</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Référence*</label>
            <div className="reference-group">
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={genererReference}
                className="btn-generate"
              >
                Générer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Date de création*</label>
            <input
              type="date"
              name="date_creation"
              value={formData.date_creation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de validité</label>
            <input
              type="date"
              name="date_validite"
              value={formData.date_validite}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Conditions de paiement</label>
            <input
              type="text"
              name="conditions_paiement"
              value={formData.conditions_paiement}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Taux de TVA (%)*</label>
            <input
              type="number"
              name="taux_tva"
              value={formData.taux_tva}
              onChange={handleChange}
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        <div className="right-column">
          <div className="ouvrages-section">
            <div className="section-header">
              <h2>Ouvrages et prestations</h2>
              <button
                type="button"
                onClick={ajouterOuvrage}
                className="btn-add"
              >
                Ajouter un ouvrage
              </button>
            </div>

            {ouvrages.map((ouvrage, ouvrageIndex) => (
              <div key={ouvrage.id} className="ouvrage-item">
                <div className="ouvrage-header">
                  <input
                    type="text"
                    value={ouvrage.titre}
                    onChange={(e) =>
                      handleOuvrageChange(ouvrageIndex, e.target.value)
                    }
                    placeholder="Titre de l'ouvrage"
                  />
                  <button
                    type="button"
                    onClick={() => supprimerOuvrage(ouvrageIndex)}
                    className="btn-remove"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="prestations-list">
                  {ouvrage.prestations.map((prestation, prestationIndex) => (
                    <div key={prestation.id} className="prestation-item">
                      <div className="prestation-grid">
                        <div className="produit-select-container">
                          <select
                            value={prestation.produit_id}
                            onChange={(e) =>
                              handlePrestationChange(
                                ouvrageIndex,
                                prestationIndex,
                                "produit_id",
                                e.target.value
                              )
                            }
                            className="produit-select"
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map((produit) => (
                              <option key={produit.id} value={produit.id}>
                                {produit.nom} -{" "}
                                {produit.prix_unitaire.toFixed(2)} €/
                                {produit.unite}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={prestation.description}
                          onChange={(e) =>
                            handlePrestationChange(
                              ouvrageIndex,
                              prestationIndex,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description"
                          className="description-input"
                        />
                        <input
                          type="number"
                          value={prestation.quantite}
                          onChange={(e) =>
                            handlePrestationChange(
                              ouvrageIndex,
                              prestationIndex,
                              "quantite",
                              e.target.value
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="Qté"
                          className="quantite-input"
                        />
                        <select
                          value={prestation.unite}
                          onChange={(e) =>
                            handlePrestationChange(
                              ouvrageIndex,
                              prestationIndex,
                              "unite",
                              e.target.value
                            )
                          }
                          className="unite-select"
                        >
                          {unites.map((unite) => (
                            <option key={unite.value} value={unite.value}>
                              {unite.label}
                            </option>
                          ))}
                        </select>
                        <div className="prix-input-container">
                          <input
                            type="number"
                            value={prestation.prix_unitaire}
                            onChange={(e) =>
                              handlePrestationChange(
                                ouvrageIndex,
                                prestationIndex,
                                "prix_unitaire",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                            placeholder="Prix unitaire"
                            className="prix-input"
                          />
                          <span className="prix-symbole">€</span>
                        </div>
                        <div className="total-ht">
                          {prestation.total_ht.toFixed(2)} €
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            supprimerPrestation(ouvrageIndex, prestationIndex)
                          }
                          className="btn-remove"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => ajouterPrestation(ouvrageIndex)}
                    className="btn-add"
                  >
                    Ajouter une prestation
                  </button>
                </div>
              </div>
            ))}

            <div className="devis-summary">
              <div className="summary-item">
                <span>Total HT</span>
                <span>{totaux.totalHT.toFixed(2)} €</span>
              </div>
              <div className="summary-item">
                <span>TVA ({formData.taux_tva}%)</span>
                <span>{totaux.montantTVA.toFixed(2)} €</span>
              </div>
              <div className="summary-item total">
                <span>Total TTC</span>
                <span>{totaux.totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => navigate("/devis")}
          className="btn-cancel"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-save"
          disabled={loading}
        >
          {loading ? "Création en cours..." : "Créer le devis"}
        </button>
      </div>
    </div>
  );
};

export default CreerDevis;
