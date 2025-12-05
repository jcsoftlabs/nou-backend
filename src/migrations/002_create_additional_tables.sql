-- Script de création des tables complémentaires
-- Base de données: nou_db

-- Table cotisations
CREATE TABLE IF NOT EXISTS cotisations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  membre_id INT NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  moyen_paiement ENUM('moncash', 'cash', 'recu_upload') NOT NULL,
  url_recu VARCHAR(255),
  statut_paiement ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
  date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_verification TIMESTAMP NULL,
  admin_verificateur_id INT,
  commentaire_verification TEXT,
  
  -- Contraintes et index
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_verificateur_id) REFERENCES membres(id) ON DELETE SET NULL,
  INDEX idx_membre_id (membre_id),
  INDEX idx_statut_paiement (statut_paiement),
  INDEX idx_date_paiement (date_paiement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table referrals
CREATE TABLE IF NOT EXISTS referrals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parrain_id INT NOT NULL,
  filleul_id INT NOT NULL,
  points_attribues INT DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes et index
  FOREIGN KEY (parrain_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (filleul_id) REFERENCES membres(id) ON DELETE CASCADE,
  INDEX idx_parrain_id (parrain_id),
  INDEX idx_filleul_id (filleul_id),
  INDEX idx_date_creation (date_creation),
  UNIQUE KEY unique_referral (parrain_id, filleul_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table podcasts
CREATE TABLE IF NOT EXISTS podcasts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  url_audio VARCHAR(255),
  url_live VARCHAR(255),
  est_en_direct BOOLEAN DEFAULT FALSE,
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duree_en_secondes INT,
  img_couverture_url VARCHAR(255),
  
  -- Index
  INDEX idx_date_publication (date_publication),
  INDEX idx_est_en_direct (est_en_direct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table quiz
CREATE TABLE IF NOT EXISTS quiz (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_expiration TIMESTAMP NULL,
  
  -- Index
  INDEX idx_date_publication (date_publication),
  INDEX idx_date_expiration (date_expiration)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  bonne_reponse ENUM('a', 'b', 'c', 'd') NOT NULL,
  points_question INT DEFAULT 1,
  
  -- Contraintes et index
  FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE,
  INDEX idx_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table quiz_resultats
CREATE TABLE IF NOT EXISTS quiz_resultats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  membre_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score_total INT NOT NULL,
  date_participation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes et index
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quiz(id) ON DELETE CASCADE,
  INDEX idx_membre_id (membre_id),
  INDEX idx_quiz_id (quiz_id),
  INDEX idx_date_participation (date_participation),
  UNIQUE KEY unique_participation (membre_id, quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
