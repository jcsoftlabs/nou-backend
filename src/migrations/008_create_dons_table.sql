-- Script de création de la table dons
-- Base de données: nou_db

CREATE TABLE IF NOT EXISTS dons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  membre_id INT NOT NULL,
  montant DECIMAL(10, 2) NOT NULL,
  recu_url VARCHAR(255),
  statut_don ENUM('en_attente', 'approuve', 'rejete') DEFAULT 'en_attente',
  date_don TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_verification TIMESTAMP NULL,
  admin_verificateur_id INT,
  commentaire_verification TEXT,
  description TEXT,
  
  -- Contraintes et index
  FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_verificateur_id) REFERENCES membres(id) ON DELETE SET NULL,
  INDEX idx_membre_id (membre_id),
  INDEX idx_statut_don (statut_don),
  INDEX idx_date_don (date_don)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
