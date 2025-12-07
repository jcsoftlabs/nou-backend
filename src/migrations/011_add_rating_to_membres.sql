-- Ajoute une colonne de notation par étoiles pour les membres (0..5)
ALTER TABLE `membres`
  ADD COLUMN `rating` TINYINT NOT NULL DEFAULT 0 AFTER `dernier_update`;