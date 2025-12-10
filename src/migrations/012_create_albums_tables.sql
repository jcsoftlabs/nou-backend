-- Migration 012: Création des tables pour la médiathèque (albums et photos)

-- Table albums
CREATE TABLE IF NOT EXISTS albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  date_evenement DATE COMMENT 'Date de l\'événement associé à l\'album',
  lieu_evenement VARCHAR(255) COMMENT 'Lieu où l\'événement a eu lieu',
  image_couverture VARCHAR(500) COMMENT 'URL de l\'image de couverture de l\'album',
  est_public BOOLEAN DEFAULT TRUE COMMENT 'Indique si l\'album est visible par tous ou uniquement par les admins',
  ordre INT DEFAULT 0 COMMENT 'Ordre d\'affichage de l\'album',
  auteur_id INT NOT NULL COMMENT 'ID de l\'admin qui a créé l\'album',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (auteur_id) REFERENCES membres(id) ON DELETE CASCADE,
  INDEX idx_auteur (auteur_id),
  INDEX idx_date_evenement (date_evenement),
  INDEX idx_est_public (est_public),
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table album_photos
CREATE TABLE IF NOT EXISTS album_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  album_id INT NOT NULL COMMENT 'ID de l\'album auquel appartient cette photo',
  url_photo VARCHAR(500) NOT NULL COMMENT 'URL de la photo',
  legende TEXT COMMENT 'Légende ou description de la photo',
  ordre INT DEFAULT 0 COMMENT 'Ordre d\'affichage de la photo dans l\'album',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  INDEX idx_album (album_id),
  INDEX idx_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
