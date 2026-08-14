// =========================================================
// AMATORA — Thème visuel (vert / gris / blanc)
// =========================================================

export const couleurs = {
  // Verts (couleur principale du projet) - Inspiré du drapeau
  vertPrincipal: '#1EB53A',
  vertVif:       '#2E9E5B',
  vertClair:     '#E7F4EC',
  vertFonce:     '#14532D',

  // Gris (couleur secondaire)
  grisFonce:     '#374151',
  grisMoyen:     '#6B7280',
  grisClair:     '#9CA3AF',
  grisTresClair: '#F1F2F0',

  // Blanc / fonds
  blanc:         '#FFFFFF',
  fond:          '#F5F7F6',

  // États - Le rouge est inspiré du drapeau
  danger:        '#CE1126',
  dangerFond:    '#FBEAE5',
  avertissement: '#B9843B',
  avertissementFond: '#F7EEDD',

  // Texte
  texte:         '#1F2937',
  texteMuted:    '#6B7280',

  // Couleurs des partis
  partis: {
    CNL: '#E63946',
    CNDD_FDD: '#1E8449',
    IPEDE: '#F4A261',
    UPRONA: '#2563EB',
    FRODEBU: '#7C3AED',
    FRODEBU_NYAKURI: '#D97706',
  }
};

export const gradients = {
  primary: ['#1EB53A', '#14532D'],
  accent: ['#CE1126', '#B3452F'],
};

export const typo = {
  titre: { fontSize: 24, fontWeight: '700', color: couleurs.texte },
  sousTitre: { fontSize: 15, color: couleurs.texteMuted },
  section: { fontSize: 17, fontWeight: '600', color: couleurs.texte },
  corps: { fontSize: 14.5, color: couleurs.texte },
};

export const espacements = {
  xs: 6, sm: 10, md: 16, lg: 24, xl: 32,
};

export const rayon = {
  sm: 8, md: 12, lg: 18, pill: 999,
};

export const ombre = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};
