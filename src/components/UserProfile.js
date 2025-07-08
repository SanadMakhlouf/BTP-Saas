import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "../styles/pages/UserProfile.css";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    // Informations personnelles
    first_name: "",
    last_name: "",
    email: "",
    phone: "",

    // Informations de l'entreprise
    company_name: "",
    siret: "",
    vat_number: "",
    address: "",
    postal_code: "",
    city: "",

    // Informations bancaires
    bank_name: "",
    iban: "",
    bic: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Session non trouvée");
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase.from("user_profiles").upsert({
        ...formData,
        user_id: session.user.id,
        updated_at: new Date(),
      });

      if (error) throw error;
      setSuccess("Profil mis à jour avec succès");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="loading">Chargement du profil...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mon Profil</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Informations personnelles */}
        <div className="form-section personal-info">
          <h2>Informations personnelles</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Prénom</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">Nom</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Informations de l'entreprise */}
        <div className="form-section company-info">
          <h2>Informations de l'entreprise</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Nom de l'entreprise</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">SIRET</label>
              <input
                type="text"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">N° TVA</label>
              <input
                type="text"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="required">Adresse</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">Code postal</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="required">Ville</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Informations bancaires */}
        <div className="form-section bank-info">
          <h2>Informations bancaires</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Nom de la banque</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>IBAN</label>
              <input
                type="text"
                name="iban"
                value={formData.iban}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>BIC</label>
              <input
                type="text"
                name="bic"
                value={formData.bic}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
