ALTER TABLE membres
ADD COLUMN Statuts ENUM(
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
