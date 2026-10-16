// ==========================================
// VENUES & ENTERPRISES DATA (Clean baseline, without mock salons)
// ==========================================
// Region coordinates mapping for quick zoom and bounds
const REGION_CENTERS = {
  all: { center: [55.766324, 37.604245], zoom: 6 },
  moscow: { center: [55.765000, 37.605000], zoom: 13 },
  spb: { center: [59.934000, 30.335000], zoom: 13 },
  kazan: { center: [55.788700, 49.122100], zoom: 12 },
  samara: { center: [53.195900, 50.100200], zoom: 12 },
  rostov: { center: [47.228000, 39.715000], zoom: 12 },
  krasnodar: { center: [45.035500, 38.975300], zoom: 12 },
  voronezh: { center: [51.675500, 39.208900], zoom: 12 },
  volgograd: { center: [48.707100, 44.516900], zoom: 12 },
  sochi: { center: [43.602800, 39.734200], zoom: 12 },
  stavropol: { center: [45.044500, 41.969100], zoom: 12 },
  anapa: { center: [44.894800, 37.316300], zoom: 13 },
  tuapse: { center: [44.097500, 39.076000], zoom: 13 },
  novorossiysk: { center: [44.723900, 37.768700], zoom: 12 }
};

let currentFilterRegion = 'all';

// Salons list is completely clean - only the user's real salon is added when configured in PRO
const venues = [];

let currentFilterCategory = 'all';
let currentSearchQuery = '';
let visibleVenues = [...venues];
