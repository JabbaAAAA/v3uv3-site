// Disponibilités du studio V3UV3.WAV, affichées sur planning.html.
// Pour changer le planning : modifier ce fichier, puis republier le site.
//
// Horaires : "14-18" = de 14 h à 18 h, découpé en créneaux d'une heure (14 h, 15 h, 16 h, 17 h).
// Plusieurs plages dans la journée : ["10-13", "15-19"].  Jour sans studio : [].
// « pris » : créneaux déjà réservés ou absences, par ingé son :
//   "2026-12-05"        = toute la journée
//   "2026-12-05 14-16"  = de 14 h à 16 h ce jour-là
window.PLANNING = {
  // true = horaires d'exemple (un bandeau le signale sur la page). Passer à false avec les vrais horaires.
  exemple: true,
  semaines: 4, // nombre de semaines affichées à partir de la semaine en cours
  inges: [
    {
      id: 'v3uv3',
      nom: 'V3UV3',
      styles: 'Rock · Metal · Éclectique',
      texte: "Groupes, guitares qui saturent, batteries qui cognent et tout ce qui sort des cases.",
      semaine: {
        lundi: [],
        mardi: ['18-22'],
        mercredi: ['14-22'],
        jeudi: ['18-22'],
        vendredi: ['14-20'],
        samedi: ['10-18'],
        dimanche: []
      },
      pris: []
    },
    {
      id: 'j3yko',
      nom: 'J3YKO',
      styles: 'Rap · Trap',
      texte: "Voix posées, prods qui tapent, autotune réglé au millimètre : le rap et la trap, c'est lui.",
      semaine: {
        lundi: ['16-22'],
        mardi: ['16-22'],
        mercredi: [],
        jeudi: ['16-22'],
        vendredi: [],
        samedi: ['14-22'],
        dimanche: ['14-20']
      },
      pris: []
    }
  ]
};
