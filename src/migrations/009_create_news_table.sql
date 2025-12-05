-- Migration 009: Création de la table des articles de news/blog
-- Base de données: nou_db / railway

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  resume TEXT NULL,
  contenu LONGTEXT NOT NULL,
  categorie VARCHAR(100) NULL,
  image_couverture_url VARCHAR(255) NULL,
  est_publie TINYINT(1) NOT NULL DEFAULT 0,
  date_publication DATETIME NULL,
  auteur_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_news_auteur_id FOREIGN KEY (auteur_id) REFERENCES membres(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_news_publication ON news (est_publie, date_publication);
CREATE INDEX idx_news_categorie ON news (categorie);
