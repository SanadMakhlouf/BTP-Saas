# BTP Devis - Application de gestion de devis pour le BTP

Cette application permet aux entreprises du BTP (plombiers, électriciens, maçons, etc.) de créer et gérer facilement des devis pour leurs clients.

## Fonctionnalités

- **Gestion des clients** : Ajout, modification et suppression de clients
- **Création de devis** : Interface intuitive pour créer des devis multi-lots
- **Gestion des ouvrages** : Possibilité d'ajouter plusieurs ouvrages (plomberie, électricité, etc.) dans un même devis
- **Gestion des prestations** : Ajout de prestations détaillées pour chaque ouvrage
- **Calcul automatique** : Calcul des totaux HT, TVA et TTC
- **Suivi des statuts** : Suivi de l'état des devis (en cours, acceptés, refusés)

## Modèle de données

L'application utilise Supabase comme backend et stocke les données dans les tables suivantes :

- `entreprises` : Informations sur les entreprises utilisatrices
- `clients` : Informations sur les clients de chaque entreprise
- `devis` : Informations générales sur les devis (client, montants, dates, etc.)
- `ouvrages` : Catégories de prestations dans un devis (ex: "Plomberie", "Électricité")
- `prestations` : Lignes détaillées dans chaque ouvrage (description, quantité, prix, etc.)

## Configuration

### Prérequis

- Node.js (v14 ou supérieur)
- NPM ou Yarn
- Compte Supabase

### Installation

1. Clonez ce dépôt
2. Installez les dépendances :
   ```
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet avec vos informations Supabase :
   ```
   REACT_APP_SUPABASE_URL=votre_url_supabase
   REACT_APP_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```
4. Mettez à jour le fichier `src/supabaseClient.js` avec vos informations Supabase

### Structure de la base de données Supabase

Créez les tables suivantes dans votre projet Supabase :

#### Table `entreprises`

- `id` : uuid (primary key)
- `user_id` : uuid (foreign key to auth.users)
- `nom` : text
- `created_at` : timestamp

#### Table `clients`

- `id` : uuid (primary key)
- `entreprise_id` : uuid (foreign key to entreprises.id)
- `nom` : text
- `prenom` : text
- `email` : text
- `telephone` : text
- `adresse` : text
- `code_postal` : text
- `ville` : text
- `created_at` : timestamp
- `updated_at` : timestamp

#### Table `devis`

- `id` : uuid (primary key)
- `entreprise_id` : uuid (foreign key to entreprises.id)
- `client_id` : uuid (foreign key to clients.id)
- `reference` : text
- `date_creation` : date
- `date_validite` : date
- `conditions_paiement` : text
- `notes` : text
- `taux_tva` : float
- `montant_ht` : float
- `montant_tva` : float
- `montant_ttc` : float
- `statut` : text (en_cours, accepte, refuse)

#### Table `ouvrages`

- `id` : uuid (primary key)
- `devis_id` : uuid (foreign key to devis.id)
- `titre` : text

#### Table `prestations`

- `id` : uuid (primary key)
- `ouvrage_id` : uuid (foreign key to ouvrages.id)
- `devis_id` : uuid (foreign key to devis.id)
- `description` : text
- `quantite` : float
- `unite` : text
- `prix_unitaire` : float
- `total_ht` : float

### Lancement de l'application

```
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000).

## Développement

### Technologies utilisées

- React
- React Router
- Supabase (authentification et base de données)
- Tailwind CSS

### Structure du projet

- `/src/components` : Composants réutilisables
- `/src/pages` : Pages principales de l'application
- `/src/supabaseClient.js` : Configuration de Supabase

## Licence

MIT
