export const mockClients = [
  {
    id: 1,
    nom: "Dupont Construction",
    email: "dupont@example.com",
    telephone: "06 12 34 56 78",
    adresse: "123 rue de Paris, 75001 Paris",
  },
  {
    id: 2,
    nom: "Martin Rénovation",
    email: "martin@example.com",
    telephone: "06 98 76 54 32",
    adresse: "456 avenue des Champs-Élysées, 75008 Paris",
  },
  {
    id: 3,
    nom: "Bernard BTP",
    email: "bernard@example.com",
    telephone: "06 11 22 33 44",
    adresse: "789 boulevard Haussmann, 75009 Paris",
  },
];

export const mockProduits = [
  {
    nom: "Ciment standard",
    description: "Sac de ciment standard 35kg",
    prix_unitaire: 12.5,
    unite: "sac",
  },
  {
    nom: "Plaque de plâtre BA13",
    description: "Plaque de plâtre standard 250x120cm",
    prix_unitaire: 8.75,
    unite: "unité",
  },
  {
    nom: "Peinture acrylique blanche",
    description: "Pot de peinture acrylique blanche 10L",
    prix_unitaire: 45.9,
    unite: "pot",
  },
  {
    nom: "Carrelage grès cérame",
    description: "Carrelage grès cérame 60x60cm",
    prix_unitaire: 29.5,
    unite: "m2",
  },
  {
    nom: "Parquet stratifié chêne",
    description: "Parquet stratifié aspect chêne naturel",
    prix_unitaire: 18.75,
    unite: "m2",
  },
  {
    nom: "Main d'œuvre ouvrier",
    description: "Tarif horaire main d'œuvre ouvrier qualifié",
    prix_unitaire: 35.0,
    unite: "h",
  },
  {
    nom: "Déplacement",
    description: "Frais de déplacement forfaitaire",
    prix_unitaire: 50.0,
    unite: "forfait",
  },
  {
    nom: "Câble électrique 2.5mm²",
    description: "Câble électrique souple 2.5mm²",
    prix_unitaire: 2.3,
    unite: "ml",
  },
  {
    nom: "Robinet mitigeur",
    description: "Robinet mitigeur pour lavabo",
    prix_unitaire: 89.9,
    unite: "unité",
  },
  {
    nom: "Tuyau PVC Ø100mm",
    description: "Tuyau PVC évacuation Ø100mm",
    prix_unitaire: 7.8,
    unite: "ml",
  },
];

export const mockDevis = [
  {
    id: 1,
    numero: "DEV-2024-001",
    client_id: 1,
    date_creation: "2024-03-15",
    statut: "en_cours",
    montant_ht: 15000,
    tva: 20,
    montant_ttc: 18000,
    ouvrages: [
      {
        id: 1,
        nom: "Plomberie",
        prestations: [
          {
            description: "Installation sanitaire complète",
            quantite: 1,
            prix_unitaire: 8000,
            total: 8000,
          },
          {
            description: "Raccordement eau chaude/froide",
            quantite: 2,
            prix_unitaire: 3500,
            total: 7000,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    numero: "DEV-2024-002",
    client_id: 2,
    date_creation: "2024-03-14",
    statut: "accepte",
    montant_ht: 25000,
    tva: 20,
    montant_ttc: 30000,
    ouvrages: [
      {
        id: 2,
        nom: "Électricité",
        prestations: [
          {
            description: "Rénovation tableau électrique",
            quantite: 1,
            prix_unitaire: 12000,
            total: 12000,
          },
          {
            description: "Installation prises et interrupteurs",
            quantite: 26,
            prix_unitaire: 500,
            total: 13000,
          },
        ],
      },
    ],
  },
];

export const mockStats = {
  total_devis: 15,
  devis_en_cours: 8,
  devis_acceptes: 5,
  devis_refuses: 2,
  montant_total_ttc: 180000,
  montant_moyen_ttc: 12000,
};
