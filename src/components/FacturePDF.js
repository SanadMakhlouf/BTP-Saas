import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#374151",
  },
  infoText: {
    marginBottom: 3,
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
  totalsSection: {
    marginTop: 30,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
    color: "#374151",
  },
  totalValue: {
    width: 100,
    textAlign: "right",
    color: "#111827",
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

const FacturePDF = ({ facture, client, userProfile }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(montant);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec informations de l'entreprise */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userProfile && (
              <View style={styles.companyInfo}>
                <Text style={styles.infoTitle}>{userProfile.company_name}</Text>
                <Text style={styles.infoText}>{userProfile.address}</Text>
                <Text style={styles.infoText}>
                  {userProfile.postal_code} {userProfile.city}
                </Text>
                {userProfile.phone && (
                  <Text style={styles.infoText}>Tél : {userProfile.phone}</Text>
                )}
                <Text style={styles.infoText}>Email : {userProfile.email}</Text>
                {userProfile.website && (
                  <Text style={styles.infoText}>
                    Web : {userProfile.website}
                  </Text>
                )}
              </View>
            )}
            <Text style={styles.title}>FACTURE</Text>
            <Text style={styles.infoText}>N° {facture.numero}</Text>
            <Text style={styles.infoText}>
              Date : {formatDate(facture.date_emission)}
            </Text>
            <Text style={styles.infoText}>
              Échéance : {formatDate(facture.date_echeance)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.infoTitle}>Client</Text>
            <Text style={styles.infoText}>{client.nom}</Text>
            <Text style={styles.infoText}>{client.adresse}</Text>
            <Text style={styles.infoText}>
              {client.code_postal} {client.ville}
            </Text>
            {client.telephone && (
              <Text style={styles.infoText}>Tél : {client.telephone}</Text>
            )}
            {client.email && (
              <Text style={styles.infoText}>Email : {client.email}</Text>
            )}
            {client.numero_tva && (
              <Text style={styles.infoText}>N° TVA : {client.numero_tva}</Text>
            )}
          </View>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Quantité</Text>
            <Text style={styles.col3}>Unité</Text>
            <Text style={styles.col4}>Prix Unit.</Text>
            <Text style={styles.col5}>Total HT</Text>
          </View>
          {facture.prestations?.map((prestation, index) => (
            <View key={index} style={styles.tableRow}>
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
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(facture.montant_ht)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({facture.tva}%) :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(facture.montant_ht * (facture.tva / 100))}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>
              Total TTC :
            </Text>
            <Text style={[styles.totalValue, { fontWeight: "bold" }]}>
              {formatMontant(facture.montant_ttc)}
            </Text>
          </View>
        </View>

        {/* Conditions de paiement */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.infoTitle}>Conditions de paiement :</Text>
          <Text style={styles.infoText}>{facture.conditions_paiement}</Text>
        </View>

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

export default FacturePDF;
