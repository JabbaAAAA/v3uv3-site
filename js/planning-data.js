// Disponibilités du studio V3UV3.WAV, affichées sur planning.html.
// Pour changer le planning : modifier ce fichier, puis republier le site.
//
// Horaires : "14-18" = de 14 h à 18 h, découpé en créneaux d'une heure (14 h, 15 h, 16 h, 17 h).
// Après minuit : continuer à compter ("15-26" = de 15 h à 2 h du matin, rattaché au jour où la séance commence).
// Plusieurs plages dans la journée : ["10-13", "15-19"].  Jour sans studio : [].
// « pris » : créneaux déjà réservés ou absences, par ingé son :
//   "2026-12-05"        = toute la journée
//   "2026-12-05 14-16"  = de 14 h à 16 h ce jour-là
window.PLANNING = {
  // true = horaires d'exemple (un bandeau le signale sur la page). Passer à false avec les vrais horaires.
  exemple: false,
  semaines: 4, // nombre de semaines affichées à partir de la semaine en cours
  inges: [
    {
      id: 'v3uv3',
      nom: 'V3UV3',
      styles: 'Rock · Metal · Éclectique',
      texte: "Groupes, guitares qui saturent, batteries qui cognent et tout ce qui sort des cases.",
      semaine: {
        lundi: ['10-18'],
        mardi: ['10-18'],
        mercredi: ['10-18'],
        jeudi: ['10-18'],
        vendredi: ['10-18'],
        samedi: ['10-18'],
        dimanche: ['10-18']
      },
      pris: []
    },
    {
      id: 'j3yko',
      nom: 'J3YKO',
      styles: 'Rap · Trap',
      texte: "Voix posées, prods qui tapent, autotune réglé au millimètre : le rap et la trap, c'est lui.",
      semaine: {
        lundi: ['15-26'],
        mardi: ['15-26'],
        mercredi: ['15-26'],
        jeudi: ['15-26'],
        vendredi: ['15-26'],
        samedi: ['15-26'],
        dimanche: ['15-26']
      },
      pris: []
    }
  ]
};
