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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoText: {
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#999",
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
  },
  totalValue: {
    width: 100,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

const FacturePDF = ({ facture, client, user }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(montant);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text>N° {facture.numero}</Text>
            <Text>Date : {formatDate(facture.date_emission)}</Text>
          </View>
        </View>

        {/* Informations client et émetteur */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Émetteur :</Text>
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Client :</Text>
            <Text style={styles.infoText}>{client.nom}</Text>
            <Text style={styles.infoText}>{client.adresse}</Text>
            <Text style={styles.infoText}>
              {client.code_postal} {client.ville}
            </Text>
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
                {formatMontant(prestation.prix_unitaire)} €
              </Text>
              <Text style={styles.col5}>
                {formatMontant(prestation.total_ht)} €
              </Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(facture.montant_ht)} €
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({facture.tva}%) :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(facture.montant_ht * (facture.tva / 100))} €
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total TTC :</Text>
            <Text style={styles.totalValue}>
              {formatMontant(facture.montant_ttc)} €
            </Text>
          </View>
        </View>

        {/* Conditions de paiement */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.infoTitle}>Conditions de paiement :</Text>
          <Text>{facture.conditions_paiement}</Text>
          <Text>Date d'échéance : {formatDate(facture.date_echeance)}</Text>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Facture générée le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FacturePDF;
