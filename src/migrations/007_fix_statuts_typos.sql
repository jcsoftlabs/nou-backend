-- Script pour corriger les erreurs d'orthographe dans la colonne Statuts
-- Cette migration modifie le type ENUM pour corriger les fautes d'orthographe

ALTER TABLE membres
MODIFY COLUMN Statuts ENUM(
  'Membre pré-adhérent',
  'Membre adhérent',
  'Membre spécial',
  'Chef d''équipe',
  'Dirigeant',
  'Leader',
  'Dirigeant national',
  'Dirigeant départemental',
  'Dirigeant communal',
  'Dirigeant section communale'
) DEFAULT 'Membre pré-adhérent';
