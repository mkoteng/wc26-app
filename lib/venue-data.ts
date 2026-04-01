/**
 * Static venue metadata not present in wc26-mcp (surface, roof).
 * Images are served locally from /public/venues/.
 */

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
