-- Migration 008: Ajouter support des fichiers multimédias aux modules de formation
-- Date: 2025-12-07

-- Ajouter les nouveaux champs pour supporter PDF, PPT et fichiers supplémentaires
ALTER TABLE modules 
ADD COLUMN fichier_pdf_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN fichier_ppt_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN fichiers_supplementaires TEXT DEFAULT NULL;

-- Note: fichiers_supplementaires stockera un JSON array
-- Exemple: [{"type": "pdf", "url": "https://...", "nom": "document.pdf"}]
