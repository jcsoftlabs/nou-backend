-- Migration 010: Création de la table des annonces administratives
-- Base de données: nou_db / railway

CREATE TABLE IF NOT EXISTS annonces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priorite ENUM('info','important','urgent') NOT NULL DEFAULT 'info',
  statut ENUM('brouillon','publie','archive') NOT NULL DEFAULT 'brouillon',
  date_publication DATETIME NULL,
  date_expiration DATETIME NULL,
  auteur_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_annonces_auteur_id FOREIGN KEY (auteur_id) REFERENCES membres(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_annonces_statut_pub ON annonces (statut, date_publication);
CREATE INDEX idx_annonces_priorite ON annonces (priorite);
