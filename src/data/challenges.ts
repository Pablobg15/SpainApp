export type Challenge = {
  id: string;
  title: string;
  description: string;
  provinceIds: string[];
};

const ANDALUCIA = [
  'almeria',
  'cadiz',
  'cordoba',
  'granada',
  'huelva',
  'jaen',
  'malaga',
  'sevilla',
];

const ARAGON = ['huesca', 'teruel', 'zaragoza'];

const ASTURIAS = ['asturias'];

const ILLES_BALEARS = ['illes_balears'];

const CANARIAS = ['las_palmas', 'santa_cruz_tenerife'];

const CANTABRIA = ['cantabria'];

const CASTILLA_LA_MANCHA = [
  'albacete',
  'ciudad_real',
  'cuenca',
  'guadalajara',
  'toledo',
];

const CASTILLA_Y_LEON = [
  'avila',
  'burgos',
  'leon',
  'palencia',
  'salamanca',
  'segovia',
  'soria',
  'valladolid',
  'zamora',
];

const CATALUNA = ['barcelona', 'girona', 'lleida', 'tarragona'];

const COMUNIDAD_VALENCIANA = ['alicante', 'castellon', 'valencia'];

const EXTREMADURA = ['badajoz', 'caceres'];

const GALICIA = ['a_coruna', 'lugo', 'ourense', 'pontevedra'];

const LA_RIOJA = ['la_rioja'];

const MADRID = ['madrid'];

const MURCIA = ['murcia'];

const NAVARRA = ['navarra'];

const PAIS_VASCO = ['alava', 'bizkaia', 'gipuzkoa'];

const TODAS_LAS_PROVINCIAS = [
  ...ANDALUCIA,
  ...ARAGON,
  ...ASTURIAS,
  ...ILLES_BALEARS,
  ...CANARIAS,
  ...CANTABRIA,
  ...CASTILLA_LA_MANCHA,
  ...CASTILLA_Y_LEON,
  ...CATALUNA,
  ...COMUNIDAD_VALENCIANA,
  ...EXTREMADURA,
  ...GALICIA,
  ...LA_RIOJA,
  ...MADRID,
  ...MURCIA,
  ...NAVARRA,
  ...PAIS_VASCO,
];

export const challenges: Challenge[] = [
  {
    id: 'espana_completa',
    title: 'España completa',
    description: 'Visita las 50 provincias de España.',
    provinceIds: TODAS_LAS_PROVINCIAS,
  },
  {
    id: 'andalucia_completa',
    title: 'Andalucía completa',
    description: 'Visita todas las provincias de Andalucía.',
    provinceIds: ANDALUCIA,
  },
  {
    id: 'aragon_completo',
    title: 'Aragón completo',
    description: 'Completa Huesca, Teruel y Zaragoza.',
    provinceIds: ARAGON,
  },
  {
    id: 'asturias_completa',
    title: 'Asturias completada',
    description: 'Marca Asturias como visitada o como tu casa.',
    provinceIds: ASTURIAS,
  },
  {
    id: 'baleares_completa',
    title: 'Baleares completada',
    description: 'Visita Illes Balears.',
    provinceIds: ILLES_BALEARS,
  },
  {
    id: 'canarias_completa',
    title: 'Canarias completa',
    description: 'Visita Las Palmas y Santa Cruz de Tenerife.',
    provinceIds: CANARIAS,
  },
  {
    id: 'cantabria_completa',
    title: 'Cantabria completada',
    description: 'Visita Cantabria.',
    provinceIds: CANTABRIA,
  },
  {
    id: 'castilla_la_mancha_completa',
    title: 'Castilla-La Mancha completa',
    description: 'Completa las cinco provincias de Castilla-La Mancha.',
    provinceIds: CASTILLA_LA_MANCHA,
  },
  {
    id: 'castilla_y_leon_completa',
    title: 'Castilla y León completa',
    description: 'Visita la comunidad con más provincias de España.',
    provinceIds: CASTILLA_Y_LEON,
  },
  {
    id: 'cataluna_completa',
    title: 'Cataluña completa',
    description: 'Visita Barcelona, Girona, Lleida y Tarragona.',
    provinceIds: CATALUNA,
  },
  {
    id: 'comunidad_valenciana_completa',
    title: 'Comunidad Valenciana completa',
    description: 'Completa Alicante, Castellón y Valencia.',
    provinceIds: COMUNIDAD_VALENCIANA,
  },
  {
    id: 'extremadura_completa',
    title: 'Extremadura completa',
    description: 'Visita Badajoz y Cáceres.',
    provinceIds: EXTREMADURA,
  },
  {
    id: 'galicia_completa',
    title: 'Galicia completa',
    description: 'Completa las cuatro provincias gallegas.',
    provinceIds: GALICIA,
  },
  {
    id: 'la_rioja_completa',
    title: 'La Rioja completada',
    description: 'Visita La Rioja.',
    provinceIds: LA_RIOJA,
  },
  {
    id: 'madrid_completo',
    title: 'Madrid completado',
    description: 'Visita la Comunidad de Madrid.',
    provinceIds: MADRID,
  },
  {
    id: 'murcia_completa',
    title: 'Murcia completada',
    description: 'Visita la Región de Murcia.',
    provinceIds: MURCIA,
  },
  {
    id: 'navarra_completa',
    title: 'Navarra completada',
    description: 'Visita Navarra.',
    provinceIds: NAVARRA,
  },
  {
    id: 'pais_vasco_completo',
    title: 'País Vasco completo',
    description: 'Visita Álava, Bizkaia y Gipuzkoa.',
    provinceIds: PAIS_VASCO,
  },
  {
    id: 'norte_de_espana',
    title: 'Norte de España',
    description: 'Recorre algunas de las provincias más verdes del norte.',
    provinceIds: [
      'a_coruna',
      'lugo',
      'asturias',
      'cantabria',
      'bizkaia',
      'gipuzkoa',
      'navarra',
    ],
  },
  {
    id: 'espana_verde',
    title: 'España verde',
    description: 'Completa Galicia, Asturias, Cantabria y País Vasco.',
    provinceIds: [
      ...GALICIA,
      ...ASTURIAS,
      ...CANTABRIA,
      ...PAIS_VASCO,
    ],
  },
  {
    id: 'ruta_cantabrica',
    title: 'Costa cantábrica',
    description: 'Visita provincias del litoral cantábrico.',
    provinceIds: [
      'a_coruna',
      'lugo',
      'asturias',
      'cantabria',
      'bizkaia',
      'gipuzkoa',
    ],
  },
  {
    id: 'mediterraneo',
    title: 'Ruta mediterránea',
    description: 'Recorre provincias bañadas por el Mediterráneo.',
    provinceIds: [
      'girona',
      'barcelona',
      'tarragona',
      'castellon',
      'valencia',
      'alicante',
      'murcia',
      'almeria',
      'granada',
      'malaga',
      'illes_balears',
    ],
  },
  {
    id: 'costa_andaluza',
    title: 'Costa andaluza',
    description: 'Visita las provincias costeras de Andalucía.',
    provinceIds: ['huelva', 'cadiz', 'malaga', 'granada', 'almeria'],
  },
  {
    id: 'levante',
    title: 'Levante español',
    description: 'Completa Castellón, Valencia, Alicante y Murcia.',
    provinceIds: ['castellon', 'valencia', 'alicante', 'murcia'],
  },
  {
    id: 'islas_espanolas',
    title: 'Islas españolas',
    description: 'Visita Baleares y las dos provincias canarias.',
    provinceIds: ['illes_balears', 'las_palmas', 'santa_cruz_tenerife'],
  },
  {
    id: 'pirineos',
    title: 'Ruta de los Pirineos',
    description: 'Visita provincias cercanas al Pirineo.',
    provinceIds: ['gipuzkoa', 'navarra', 'huesca', 'lleida', 'girona'],
  },
  {
    id: 'camino_frances',
    title: 'Camino Francés',
    description: 'Recorre provincias clásicas del Camino de Santiago Francés.',
    provinceIds: [
      'navarra',
      'la_rioja',
      'burgos',
      'palencia',
      'leon',
      'lugo',
      'a_coruna',
    ],
  },
  {
    id: 'camino_norte',
    title: 'Camino del Norte',
    description: 'Completa provincias del Camino de Santiago por el norte.',
    provinceIds: [
      'gipuzkoa',
      'bizkaia',
      'cantabria',
      'asturias',
      'lugo',
      'a_coruna',
    ],
  },
  {
    id: 'ruta_de_la_plata',
    title: 'Ruta de la Plata',
    description: 'Viaja desde Andalucía hasta el norte por el oeste peninsular.',
    provinceIds: [
      'sevilla',
      'badajoz',
      'caceres',
      'salamanca',
      'zamora',
      'leon',
      'asturias',
    ],
  },
  {
    id: 'raya_portugal',
    title: 'Frontera con Portugal',
    description: 'Visita provincias españolas cercanas a Portugal.',
    provinceIds: [
      'pontevedra',
      'ourense',
      'zamora',
      'salamanca',
      'caceres',
      'badajoz',
      'huelva',
    ],
  },
  {
    id: 'centro_de_espana',
    title: 'Centro de España',
    description: 'Completa una ruta por el centro peninsular.',
    provinceIds: [
      'madrid',
      'toledo',
      'ciudad_real',
      'cuenca',
      'guadalajara',
      'avila',
      'segovia',
    ],
  },
  {
    id: 'meseta_norte',
    title: 'Meseta norte',
    description: 'Visita todas las provincias de Castilla y León.',
    provinceIds: CASTILLA_Y_LEON,
  },
  {
    id: 'meseta_sur',
    title: 'Meseta sur',
    description: 'Visita Madrid y las provincias de Castilla-La Mancha.',
    provinceIds: [...MADRID, ...CASTILLA_LA_MANCHA],
  },
  {
    id: 'las_dos_castillas',
    title: 'Las dos Castillas',
    description: 'Completa Castilla y León y Castilla-La Mancha.',
    provinceIds: [...CASTILLA_Y_LEON, ...CASTILLA_LA_MANCHA],
  },
  {
    id: 'grandes_ciudades',
    title: 'Grandes ciudades',
    description: 'Visita provincias con algunas de las ciudades más grandes.',
    provinceIds: [
      'madrid',
      'barcelona',
      'valencia',
      'sevilla',
      'zaragoza',
      'malaga',
      'murcia',
    ],
  },
  {
    id: 'ciudades_monumentales',
    title: 'Ciudades monumentales',
    description: 'Recorre provincias con ciudades históricas muy conocidas.',
    provinceIds: [
      'granada',
      'cordoba',
      'sevilla',
      'toledo',
      'segovia',
      'salamanca',
    ],
  },
  {
    id: 'capitales_del_norte',
    title: 'Capitales del norte',
    description: 'Visita provincias clave del norte de España.',
    provinceIds: [
      'a_coruna',
      'asturias',
      'cantabria',
      'bizkaia',
      'gipuzkoa',
      'navarra',
      'la_rioja',
    ],
  },
  {
    id: 'asturias_y_vecinas',
    title: 'Asturias y vecinas',
    description: 'Completa Asturias y sus provincias cercanas.',
    provinceIds: ['asturias', 'cantabria', 'leon', 'lugo'],
  },
  {
    id: 'cordillera_cantabrica',
    title: 'Cordillera Cantábrica',
    description: 'Visita provincias de montaña del norte.',
    provinceIds: [
      'asturias',
      'cantabria',
      'leon',
      'palencia',
      'burgos',
      'lugo',
    ],
  },
  {
    id: 'costa_brava_dorada',
    title: 'Costa Brava y Dorada',
    description: 'Completa las provincias costeras catalanas.',
    provinceIds: ['girona', 'barcelona', 'tarragona'],
  },
  {
    id: 'sur_peninsular',
    title: 'Sur peninsular',
    description: 'Visita Andalucía, Murcia y Extremadura.',
    provinceIds: [...ANDALUCIA, ...MURCIA, ...EXTREMADURA],
  },
  {
    id: 'este_peninsular',
    title: 'Este peninsular',
    description: 'Recorre Cataluña, Comunidad Valenciana, Murcia y Aragón.',
    provinceIds: [
      ...CATALUNA,
      ...COMUNIDAD_VALENCIANA,
      ...MURCIA,
      ...ARAGON,
    ],
  },
  {
    id: 'oeste_peninsular',
    title: 'Oeste peninsular',
    description: 'Visita Galicia, Extremadura y varias provincias del oeste.',
    provinceIds: [
      ...GALICIA,
      ...EXTREMADURA,
      'zamora',
      'salamanca',
      'leon',
      'huelva',
    ],
  },
  {
    id: 'todas_las_costas',
    title: 'Todas las costas',
    description: 'Visita provincias españolas con costa.',
    provinceIds: [
      'a_coruna',
      'lugo',
      'pontevedra',
      'asturias',
      'cantabria',
      'bizkaia',
      'gipuzkoa',
      'girona',
      'barcelona',
      'tarragona',
      'castellon',
      'valencia',
      'alicante',
      'murcia',
      'almeria',
      'granada',
      'malaga',
      'cadiz',
      'huelva',
      'illes_balears',
      'las_palmas',
      'santa_cruz_tenerife',
    ],
  },
];