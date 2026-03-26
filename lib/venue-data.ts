/**
 * Static venue metadata not present in wc26-mcp (surface, roof) and
 * Wikipedia article titles used to fetch images from the Wikipedia REST API.
 */

/** Exact Wikipedia article title for each venue — used by getWikipediaImage(). */
export const VENUE_WIKIPEDIA_TITLES: Record<string, string> = {
  metlife:       'MetLife Stadium',
  sofi:          'SoFi Stadium',
  att:           'AT&T Stadium',
  hard_rock:     'Hard Rock Stadium',
  mercedes_benz: 'Mercedes-Benz Stadium',
  gillette:      'Gillette Stadium',
  nrg:           'NRG Stadium',
  arrowhead:     'Arrowhead Stadium',
  lincoln:       'Lincoln Financial Field',
  levis:         "Levi's Stadium",
  lumen:         'Lumen Field',
  azteca:        'Estadio Azteca',
  akron:         'Estadio Akron',
  bbva:          'Estadio BBVA',
  bmo:           'BMO Field',
  bc_place:      'BC Place',
}

export const VENUE_DETAILS: Record<string, { surface: string; roof: string }> = {
  metlife:       { surface: 'Natural grass',  roof: 'Open'        },
  sofi:          { surface: 'Natural grass',  roof: 'Fixed'       },
  att:           { surface: 'Grass on tray',  roof: 'Retractable' },
  hard_rock:     { surface: 'Natural grass',  roof: 'Partial'     },
  mercedes_benz: { surface: 'Grass on tray',  roof: 'Retractable' },
  gillette:      { surface: 'Natural grass',  roof: 'Open'        },
  nrg:           { surface: 'Natural grass',  roof: 'Retractable' },
  arrowhead:     { surface: 'Natural grass',  roof: 'Open'        },
  lincoln:       { surface: 'Natural grass',  roof: 'Open'        },
  levis:         { surface: 'Natural grass',  roof: 'Open'        },
  lumen:         { surface: 'FieldTurf',      roof: 'Open'        },
  azteca:        { surface: 'Natural grass',  roof: 'Open'        },
  akron:         { surface: 'Natural grass',  roof: 'Open'        },
  bbva:          { surface: 'Natural grass',  roof: 'Open'        },
  bmo:           { surface: 'Natural grass',  roof: 'Open'        },
  bc_place:      { surface: 'FieldTurf',      roof: 'Retractable' },
}

/** Local image paths under /public/venues/ — pre-downloaded from Wikipedia. */
export const VENUE_IMAGE_PATH: Record<string, string> = {
  metlife:       '/venues/metlife.jpg',
  sofi:          '/venues/sofi.jpg',
  att:           '/venues/att.jpg',
  hard_rock:     '/venues/hard_rock.jpg',
  mercedes_benz: '/venues/mercedes_benz.jpg',
  gillette:      '/venues/gillette.jpg',
  nrg:           '/venues/nrg.jpg',
  arrowhead:     '/venues/arrowhead.jpg',
  lincoln:       '/venues/lincoln.jpg',
  levis:         '/venues/levis.jpg',
  lumen:         '/venues/lumen.jpg',
  azteca:        '/venues/azteca.jpg',
  akron:         '/venues/akron.jpg',
  bbva:          '/venues/bbva.jpg',
  bmo:           '/venues/bmo.png',
  bc_place:      '/venues/bc_place.jpg',
}

export const COUNTRY_FLAG: Record<string, string> = {
  USA:    '🇺🇸',
  Mexico: '🇲🇽',
  Canada: '🇨🇦',
}
