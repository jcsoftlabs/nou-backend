-- Script de création de la table membres
-- Base de données: nou_db

CREATE TABLE IF NOT EXISTS membres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Codes d'adhésion et parrainage
  code_adhesion VARCHAR(50) UNIQUE,
  code_parrain VARCHAR(50),
  
  -- Informations personnelles
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  surnom VARCHAR(100),
  sexe VARCHAR(20),
  lieu_de_naissance VARCHAR(255),
  date_de_naissance DATE,
  
  -- Informations familiales
  nom_pere VARCHAR(100),
  nom_mere VARCHAR(100),
  situation_matrimoniale VARCHAR(50),
  nb_enfants INT DEFAULT 0,
  nb_personnes_a_charge INT DEFAULT 0,
  
  -- Documents officiels
  nin VARCHAR(50),
  nif VARCHAR(50),
  
  -- Coordonnées
  telephone_principal VARCHAR(20) NOT NULL,
  telephone_etranger VARCHAR(20),
  email VARCHAR(255),
  adresse_complete TEXT,
  
  -- Profession et occupation
  profession VARCHAR(100),
  occupation VARCHAR(100),
  
  -- Localisation
  departement VARCHAR(100),
  commune VARCHAR(100),
  section_communale VARCHAR(100),
  
  -- Réseaux sociaux
  facebook VARCHAR(255),
  instagram VARCHAR(255),
  
  -- Historique politique
  a_ete_membre_politique BOOLEAN DEFAULT FALSE,
  role_politique_precedent VARCHAR(255),
  nom_parti_precedent VARCHAR(255),
  
  -- Historique organisationnel
  a_ete_membre_organisation BOOLEAN DEFAULT FALSE,
  role_organisation_precedent VARCHAR(255),
  nom_organisation_precedente VARCHAR(255),
  
  -- Informations du référent
  referent_nom VARCHAR(100),
  referent_prenom VARCHAR(100),
  referent_adresse TEXT,
  referent_telephone VARCHAR(20),
  relation_avec_referent VARCHAR(100),
  
  -- Antécédents légaux
  a_ete_condamne BOOLEAN DEFAULT FALSE,
  a_violé_loi_drogue BOOLEAN DEFAULT FALSE,
  a_participe_activite_terroriste BOOLEAN DEFAULT FALSE,
  
  -- Authentification et profil
  photo_profil_url VARCHAR(255),
  password_hash VARCHAR(255),
  role_utilisateur VARCHAR(50) DEFAULT 'membre',
  
  -- Timestamps
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dernier_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Index pour optimiser les recherches
  INDEX idx_code_adhesion (code_adhesion),
  INDEX idx_telephone_principal (telephone_principal),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
