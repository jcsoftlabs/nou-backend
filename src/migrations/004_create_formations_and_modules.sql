-- Migration: Création des tables formations et modules, et ajout de module_id sur quiz
-- Base de données: nou_db

-- Table formations
CREATE TABLE IF NOT EXISTS formations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  niveau VARCHAR(50),
  image_couverture_url VARCHAR(255),
  est_active BOOLEAN DEFAULT TRUE,
  date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_formations_est_active (est_active),
  INDEX idx_formations_date_publication (date_publication)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table modules (modules de formation)
CREATE TABLE IF NOT EXISTS modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  formation_id INT NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  ordre INT DEFAULT 0,

  FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE,
  INDEX idx_modules_formation_id (formation_id),
  INDEX idx_modules_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajout de la colonne module_id sur la table quiz
ALTER TABLE quiz 
  ADD COLUMN module_id INT NULL AFTER description;

-- Ajout de la contrainte de clé étrangère sur quiz.module_id
ALTER TABLE quiz 
  ADD CONSTRAINT fk_quiz_module_id
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL;

-- Index sur quiz.module_id
ALTER TABLE quiz 
  ADD INDEX idx_quiz_module_id (module_id);
