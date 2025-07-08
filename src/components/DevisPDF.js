import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Création des styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerLeft: {
    width: "60%",
  },
  headerRight: {
    width: "35%",
    textAlign: "right",
  },
  companyInfo: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2563eb",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151",
  },
  text: {
    marginBottom: 5,
    color: "#4b5563",
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  col1: { width: "40%" },
  col2: { width: "15%" },
  col3: { width: "15%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
});

const DevisPDF = ({ devis, client, userProfile }) => {
  // Formater les nombres en euros
  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(montant);
  };

  // Formater les dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec informations de l'entreprise */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userProfile && (
              <View style={styles.companyInfo}>
                <Text style={styles.subtitle}>{userProfile.company_name}</Text>
                <Text style={styles.text}>{userProfile.address}</Text>
                <Text style={styles.text}>
                  {userProfile.postal_code} {userProfile.city}
                </Text>
                {userProfile.phone && (
                  <Text style={styles.text}>Tél : {userProfile.phone}</Text>
                )}
                <Text style={styles.text}>Email : {userProfile.email}</Text>
                {userProfile.website && (
                  <Text style={styles.text}>Web : {userProfile.website}</Text>
                )}
              </View>
            )}
            <Text style={styles.title}>DEVIS</Text>
            <Text style={styles.text}>Référence : {devis.reference}</Text>
            <Text style={styles.text}>
              Date : {formatDate(devis.date_creation)}
            </Text>
            {devis.date_validite && (
              <Text style={styles.text}>
                Validité : {formatDate(devis.date_validite)}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Client</Text>
            <Text style={styles.text}>{client.nom}</Text>
            <Text style={styles.text}>{client.adresse}</Text>
            <Text style={styles.text}>
              {client.code_postal} {client.ville}
            </Text>
            {client.telephone && (
              <Text style={styles.text}>Tél : {client.telephone}</Text>
            )}
            {client.email && (
              <Text style={styles.text}>Email : {client.email}</Text>
            )}
          </View>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Quantité</Text>
            <Text style={styles.col3}>Unité</Text>
            <Text style={styles.col4}>Prix unitaire</Text>
            <Text style={styles.col5}>Total HT</Text>
          </View>
          {devis.ouvrages?.map((ouvrage) => (
            <React.Fragment key={ouvrage.id}>
              <View style={[styles.tableRow, { backgroundColor: "#f9fafb" }]}>
                <Text style={[styles.col1, { fontWeight: "bold" }]}>
                  {ouvrage.titre}
                </Text>
                <Text style={styles.col2}></Text>
                <Text style={styles.col3}></Text>
                <Text style={styles.col4}></Text>
                <Text style={styles.col5}></Text>
              </View>
              {ouvrage.prestations?.map((prestation) => (
                <View key={prestation.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{prestation.description}</Text>
                  <Text style={styles.col2}>{prestation.quantite}</Text>
                  <Text style={styles.col3}>{prestation.unite}</Text>
                  <Text style={styles.col4}>
                    {formatMontant(prestation.prix_unitaire)}
                  </Text>
                  <Text style={styles.col5}>
                    {formatMontant(prestation.total_ht)}
                  </Text>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(devis.montant_ht)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({devis.taux_tva}%) :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(devis.montant_tva)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>
              Total TTC :
            </Text>
            <Text style={[styles.totalValue, { fontWeight: "bold" }]}>
              {formatMontant(devis.montant_ttc)}
            </Text>
          </View>
        </View>

        {/* Conditions de paiement et notes */}
        {devis.conditions_paiement && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.subtitle}>Conditions de paiement</Text>
            <Text style={styles.text}>{devis.conditions_paiement}</Text>
          </View>
        )}

        {devis.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subtitle}>Notes</Text>
            <Text style={styles.text}>{devis.notes}</Text>
          </View>
        )}

        {/* Pied de page avec informations légales */}
        {userProfile && (
          <Text style={styles.footer}>
            {userProfile.company_name} - {userProfile.address},{" "}
            {userProfile.postal_code} {userProfile.city}
            {"\n"}
            SIRET : {userProfile.siret}
            {userProfile.vat_number ? ` - TVA : ${userProfile.vat_number}` : ""}
            {userProfile.bank_name ? `\nBanque : ${userProfile.bank_name}` : ""}
            {userProfile.bank_iban ? ` - IBAN : ${userProfile.bank_iban}` : ""}
            {userProfile.bank_bic ? ` - BIC : ${userProfile.bank_bic}` : ""}
          </Text>
        )}
      </Page>
    </Document>
  );
};

export default DevisPDF;
