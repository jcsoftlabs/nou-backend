-- Migration 005: Ajout de champs de contenu riche sur les modules
-- Base de données: nou_db

-- Note: MySQL ne supporte pas IF NOT EXISTS avec ALTER TABLE ADD COLUMN avant la version 8.0.19+
-- On gère les erreurs de duplicata dans le script de déploiement

ALTER TABLE modules 
  ADD COLUMN type_contenu VARCHAR(20) DEFAULT 'texte' AFTER description;

ALTER TABLE modules 
  ADD COLUMN contenu_texte TEXT NULL AFTER type_contenu;

ALTER TABLE modules 
  ADD COLUMN image_url VARCHAR(255) NULL AFTER contenu_texte;

ALTER TABLE modules 
  ADD COLUMN video_url VARCHAR(255) NULL AFTER image_url;
