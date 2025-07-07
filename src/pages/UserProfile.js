import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "../styles/pages/UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    postal_code: "",
    city: "",
    country: "France",
    phone: "",
    email: "",
    website: "",
    siret: "",
    vat_number: "",
    logo_url: "",
    bank_name: "",
    bank_iban: "",
    bank_bic: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setFormData(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      setError(error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Session expirée");
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: session.user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Informations de l'entreprise</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Informations générales</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company_name">Nom de l'entreprise*</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email professionnel*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Site web</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Adresse</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Adresse*</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Code postal*</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Ville*</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Pays</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Informations légales</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="siret">N° SIRET*</label>
              <input
                type="text"
                id="siret"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vat_number">N° TVA</label>
              <input
                type="text"
                id="vat_number"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Informations bancaires</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="bank_name">Nom de la banque</label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bank_iban">IBAN</label>
              <input
                type="text"
                id="bank_iban"
                name="bank_iban"
                value={formData.bank_iban}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bank_bic">BIC</label>
              <input
                type="text"
                id="bank_bic"
                name="bank_bic"
                value={formData.bank_bic}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {success && (
          <div className="alert alert-success">
            Modifications enregistrées avec succès !
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
