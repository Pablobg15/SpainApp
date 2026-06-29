export type ProvinceInfo = {
  provinceId: string;
  capital: string;
  population: string;
  highlights: string[];
  tags: string[];
  description: string;
};

export const provinceInfo: ProvinceInfo[] = [
  {
    provinceId: 'almeria',
    capital: 'Almería',
    population: '760 mil aprox.',
    highlights: ['Cabo de Gata', 'Mojácar'],
    tags: ['Costa', 'Desierto', 'Naturaleza'],
    description:
      'Provincia andaluza conocida por el Parque Natural de Cabo de Gata, sus playas volcánicas, pueblos blancos y paisajes semidesérticos únicos en España.',
  },
  {
    provinceId: 'cadiz',
    capital: 'Cádiz',
    population: '1,25 M aprox.',
    highlights: ['Cádiz capital', 'Tarifa'],
    tags: ['Costa', 'Playas', 'Gastronomía'],
    description:
      'Provincia andaluza conocida por su costa atlántica, sus pueblos blancos, su historia marinera y su ambiente de playa.',
  },
  {
    provinceId: 'cordoba',
    capital: 'Córdoba',
    population: '770 mil aprox.',
    highlights: ['Mezquita-Catedral', 'Medina Azahara'],
    tags: ['Historia', 'Patrimonio', 'Cultura'],
    description:
      'Provincia andaluza con un enorme peso histórico, famosa por Córdoba capital, sus patios, la Mezquita-Catedral y pueblos con mucho patrimonio.',
  },
  {
    provinceId: 'granada',
    capital: 'Granada',
    population: '930 mil aprox.',
    highlights: ['La Alhambra', 'Sierra Nevada'],
    tags: ['Montaña', 'Cultura', 'Nieve'],
    description:
      'Provincia andaluza donde se mezclan patrimonio, montaña y costa. Destaca por la Alhambra, Sierra Nevada, pueblos de la Alpujarra y ambiente universitario.',
  },
  {
    provinceId: 'huelva',
    capital: 'Huelva',
    population: '540 mil aprox.',
    highlights: ['Doñana', 'Matalascañas'],
    tags: ['Naturaleza', 'Playas', 'Marisma'],
    description:
      'Provincia andaluza conocida por sus playas atlánticas, el entorno de Doñana, las marismas y una gastronomía muy ligada al mar y al jamón.',
  },
  {
    provinceId: 'jaen',
    capital: 'Jaén',
    population: '620 mil aprox.',
    highlights: ['Úbeda', 'Baeza'],
    tags: ['Olivares', 'Patrimonio', 'Interior'],
    description:
      'Provincia de interior muy ligada al aceite de oliva, con ciudades monumentales como Úbeda y Baeza y espacios naturales como Cazorla.',
  },
  {
    provinceId: 'malaga',
    capital: 'Málaga',
    population: '1,8 M aprox.',
    highlights: ['Málaga capital', 'Ronda'],
    tags: ['Costa', 'Sol', 'Pueblos'],
    description:
      'Provincia andaluza muy turística, conocida por la Costa del Sol, sus pueblos blancos, playas, museos y ambiente mediterráneo.',
  },
  {
    provinceId: 'sevilla',
    capital: 'Sevilla',
    population: '2 M aprox.',
    highlights: ['Sevilla capital', 'Itálica'],
    tags: ['Cultura', 'Historia', 'Gastronomía'],
    description:
      'Provincia andaluza marcada por Sevilla capital, su patrimonio, la Semana Santa, la Feria, pueblos históricos y una fuerte identidad cultural.',
  },

  {
    provinceId: 'huesca',
    capital: 'Huesca',
    population: '230 mil aprox.',
    highlights: ['Ordesa y Monte Perdido', 'Alquézar'],
    tags: ['Pirineos', 'Montaña', 'Naturaleza'],
    description:
      'Provincia aragonesa de montaña, ideal para naturaleza, senderismo, nieve y pueblos medievales. Destaca especialmente por el Pirineo.',
  },
  {
    provinceId: 'teruel',
    capital: 'Teruel',
    population: '135 mil aprox.',
    highlights: ['Albarracín', 'Teruel capital'],
    tags: ['Pueblos', 'Mudéjar', 'Interior'],
    description:
      'Provincia aragonesa tranquila y de interior, famosa por Albarracín, el arte mudéjar, sus paisajes rurales y pueblos con mucho encanto.',
  },
  {
    provinceId: 'zaragoza',
    capital: 'Zaragoza',
    population: '980 mil aprox.',
    highlights: ['Basílica del Pilar', 'Monasterio de Piedra'],
    tags: ['Ciudad', 'Patrimonio', 'Rutas'],
    description:
      'Provincia aragonesa vertebrada por Zaragoza capital, con patrimonio histórico, espacios naturales y una buena posición entre Madrid, Barcelona y el norte.',
  },

  {
    provinceId: 'asturias',
    capital: 'Oviedo',
    population: '1 M aprox.',
    highlights: ['Oviedo', 'Picos de Europa'],
    tags: ['Montaña', 'Costa', 'Naturaleza'],
    description:
      'Provincia y comunidad del norte de España con una mezcla muy potente de montaña, costa, pueblos, sidra y gastronomía.',
  },

  {
    provinceId: 'illes_balears',
    capital: 'Palma',
    population: '1,2 M aprox.',
    highlights: ['Palma', 'Serra de Tramuntana'],
    tags: ['Islas', 'Playas', 'Mediterráneo'],
    description:
      'Provincia insular mediterránea conocida por sus playas, calas, pueblos costeros y paisajes de montaña en Mallorca.',
  },

  {
    provinceId: 'las_palmas',
    capital: 'Las Palmas de Gran Canaria',
    population: '1,15 M aprox.',
    highlights: ['Gran Canaria', 'Lanzarote'],
    tags: ['Islas', 'Playas', 'Volcanes'],
    description:
      'Provincia canaria formada por islas con paisajes muy variados: playas, dunas, volcanes, pueblos blancos y clima suave durante gran parte del año.',
  },
  {
    provinceId: 'santa_cruz_tenerife',
    capital: 'Santa Cruz de Tenerife',
    population: '1,06 M aprox.',
    highlights: ['Teide', 'La Palma'],
    tags: ['Volcanes', 'Islas', 'Naturaleza'],
    description:
      'Provincia canaria con paisajes volcánicos, parques naturales, playas y algunas de las islas más espectaculares del Atlántico.',
  },

  {
    provinceId: 'cantabria',
    capital: 'Santander',
    population: '590 mil aprox.',
    highlights: ['Santander', 'Santillana del Mar'],
    tags: ['Costa', 'Montaña', 'Pueblos'],
    description:
      'Provincia y comunidad del norte con una gran combinación de costa, montaña, cuevas, pueblos históricos y gastronomía cántabra.',
  },

  {
    provinceId: 'albacete',
    capital: 'Albacete',
    population: '390 mil aprox.',
    highlights: ['Alcalá del Júcar', 'Albacete capital'],
    tags: ['Interior', 'Pueblos', 'Naturaleza'],
    description:
      'Provincia castellano-manchega de interior, conocida por sus pueblos junto al río Júcar, llanuras, sierras y tradición cuchillera.',
  },
  {
    provinceId: 'ciudad_real',
    capital: 'Ciudad Real',
    population: '495 mil aprox.',
    highlights: ['Almagro', 'Tablas de Daimiel'],
    tags: ['Interior', 'Naturaleza', 'Patrimonio'],
    description:
      'Provincia manchega con espacios naturales, patrimonio histórico, pueblos teatrales como Almagro y paisajes muy ligados a Don Quijote.',
  },
  {
    provinceId: 'cuenca',
    capital: 'Cuenca',
    population: '200 mil aprox.',
    highlights: ['Casas Colgadas', 'Ciudad Encantada'],
    tags: ['Naturaleza', 'Patrimonio', 'Interior'],
    description:
      'Provincia de interior famosa por Cuenca capital, sus hoces, la Ciudad Encantada y paisajes naturales perfectos para escapadas tranquilas.',
  },
  {
    provinceId: 'guadalajara',
    capital: 'Guadalajara',
    population: '285 mil aprox.',
    highlights: ['Sigüenza', 'Pueblos de la Arquitectura Negra'],
    tags: ['Pueblos', 'Rutas', 'Naturaleza'],
    description:
      'Provincia castellano-manchega con pueblos medievales, rutas rurales, arquitectura negra y zonas naturales muy cercanas a Madrid.',
  },
  {
    provinceId: 'toledo',
    capital: 'Toledo',
    population: '725 mil aprox.',
    highlights: ['Toledo capital', 'Consuegra'],
    tags: ['Historia', 'Patrimonio', 'Molinos'],
    description:
      'Provincia con fuerte peso histórico y monumental, conocida por Toledo capital, los molinos manchegos y pueblos cargados de tradición.',
  },

  {
    provinceId: 'avila',
    capital: 'Ávila',
    population: '160 mil aprox.',
    highlights: ['Muralla de Ávila', 'Sierra de Gredos'],
    tags: ['Murallas', 'Montaña', 'Patrimonio'],
    description:
      'Provincia castellana con gran valor histórico y natural, famosa por su muralla, la ciudad de Ávila y la Sierra de Gredos.',
  },
  {
    provinceId: 'burgos',
    capital: 'Burgos',
    population: '360 mil aprox.',
    highlights: ['Catedral de Burgos', 'Atapuerca'],
    tags: ['Patrimonio', 'Historia', 'Gastronomía'],
    description:
      'Provincia de Castilla y León con una gran riqueza histórica, desde la Catedral de Burgos hasta Atapuerca y pueblos medievales.',
  },
  {
    provinceId: 'leon',
    capital: 'León',
    population: '450 mil aprox.',
    highlights: ['León capital', 'Las Médulas'],
    tags: ['Montaña', 'Historia', 'Camino'],
    description:
      'Provincia extensa y variada, con montaña, patrimonio romano, Camino de Santiago, pueblos históricos y una gastronomía muy reconocida.',
  },
  {
    provinceId: 'palencia',
    capital: 'Palencia',
    population: '160 mil aprox.',
    highlights: ['Catedral de Palencia', 'Montaña Palentina'],
    tags: ['Románico', 'Montaña', 'Interior'],
    description:
      'Provincia tranquila de interior, conocida por su patrimonio románico, la Montaña Palentina y rutas culturales poco masificadas.',
  },
  {
    provinceId: 'salamanca',
    capital: 'Salamanca',
    population: '330 mil aprox.',
    highlights: ['Salamanca capital', 'La Alberca'],
    tags: ['Universidad', 'Patrimonio', 'Pueblos'],
    description:
      'Provincia con una de las ciudades universitarias más bonitas de España, pueblos históricos, dehesas y mucha vida cultural.',
  },
  {
    provinceId: 'segovia',
    capital: 'Segovia',
    population: '155 mil aprox.',
    highlights: ['Acueducto de Segovia', 'La Granja'],
    tags: ['Patrimonio', 'Gastronomía', 'Sierra'],
    description:
      'Provincia castellana famosa por Segovia capital, su acueducto, el Alcázar, La Granja y su gastronomía tradicional.',
  },
  {
    provinceId: 'soria',
    capital: 'Soria',
    population: '90 mil aprox.',
    highlights: ['Cañón del Río Lobos', 'Soria capital'],
    tags: ['Naturaleza', 'Tranquilidad', 'Interior'],
    description:
      'Provincia de interior muy tranquila, con paisajes naturales, pueblos pequeños, patrimonio románico y una fuerte identidad rural.',
  },
  {
    provinceId: 'valladolid',
    capital: 'Valladolid',
    population: '520 mil aprox.',
    highlights: ['Valladolid capital', 'Peñafiel'],
    tags: ['Vino', 'Historia', 'Castillos'],
    description:
      'Provincia de Castilla y León con patrimonio histórico, castillos, rutas del vino y una capital con mucha actividad cultural.',
  },
  {
    provinceId: 'zamora',
    capital: 'Zamora',
    population: '165 mil aprox.',
    highlights: ['Zamora capital', 'Lago de Sanabria'],
    tags: ['Románico', 'Naturaleza', 'Interior'],
    description:
      'Provincia conocida por su patrimonio románico, el Lago de Sanabria, pueblos tranquilos y paisajes naturales del oeste castellano.',
  },

  {
    provinceId: 'barcelona',
    capital: 'Barcelona',
    population: '6 M aprox.',
    highlights: ['Barcelona capital', 'Montserrat'],
    tags: ['Ciudad', 'Costa', 'Cultura'],
    description:
      'Provincia catalana con una gran mezcla de ciudad, costa, arquitectura, montaña y pueblos con mucho ambiente.',
  },
  {
    provinceId: 'girona',
    capital: 'Girona',
    population: '830 mil aprox.',
    highlights: ['Costa Brava', 'Girona capital'],
    tags: ['Costa', 'Pueblos', 'Naturaleza'],
    description:
      'Provincia catalana conocida por la Costa Brava, pueblos medievales, calas, montaña pirenaica y una capital con mucho encanto.',
  },
  {
    provinceId: 'lleida',
    capital: 'Lleida',
    population: '450 mil aprox.',
    highlights: ['Val d’Aran', 'Aigüestortes'],
    tags: ['Pirineos', 'Naturaleza', 'Nieve'],
    description:
      'Provincia catalana de interior y montaña, ideal para naturaleza, nieve, valles pirenaicos y pueblos de alta montaña.',
  },
  {
    provinceId: 'tarragona',
    capital: 'Tarragona',
    population: '860 mil aprox.',
    highlights: ['Tarragona romana', 'Delta del Ebro'],
    tags: ['Costa', 'Historia', 'Naturaleza'],
    description:
      'Provincia catalana con costa mediterránea, patrimonio romano, pueblos marineros y espacios naturales como el Delta del Ebro.',
  },

  {
    provinceId: 'alicante',
    capital: 'Alicante',
    population: '2,1 M aprox.',
    highlights: ['Alicante capital', 'Benidorm'],
    tags: ['Costa', 'Playas', 'Mediterráneo'],
    description:
      'Provincia mediterránea muy turística, conocida por sus playas, pueblos costeros, clima suave y destinos como Benidorm, Jávea o Altea.',
  },
  {
    provinceId: 'castellon',
    capital: 'Castellón de la Plana',
    population: '610 mil aprox.',
    highlights: ['Peñíscola', 'Morella'],
    tags: ['Costa', 'Pueblos', 'Montaña'],
    description:
      'Provincia valenciana con una mezcla de costa mediterránea, pueblos medievales, montaña interior y destinos como Peñíscola.',
  },
  {
    provinceId: 'valencia',
    capital: 'Valencia',
    population: '2,8 M aprox.',
    highlights: ['Valencia capital', 'Albufera'],
    tags: ['Costa', 'Ciudad', 'Gastronomía'],
    description:
      'Provincia mediterránea conocida por Valencia capital, sus playas, la Albufera, las Fallas y la gastronomía.',
  },

  {
    provinceId: 'badajoz',
    capital: 'Badajoz',
    population: '670 mil aprox.',
    highlights: ['Mérida', 'Zafra'],
    tags: ['Historia', 'Interior', 'Patrimonio'],
    description:
      'Provincia extremeña extensa, con patrimonio romano en Mérida, pueblos históricos, dehesas y una gastronomía muy ligada al territorio.',
  },
  {
    provinceId: 'caceres',
    capital: 'Cáceres',
    population: '385 mil aprox.',
    highlights: ['Cáceres capital', 'Trujillo'],
    tags: ['Patrimonio', 'Naturaleza', 'Pueblos'],
    description:
      'Provincia extremeña con ciudades monumentales, pueblos históricos, dehesas y espacios naturales como Monfragüe o el Valle del Jerte.',
  },

  {
    provinceId: 'a_coruna',
    capital: 'A Coruña',
    population: '1,12 M aprox.',
    highlights: ['A Coruña', 'Santiago de Compostela'],
    tags: ['Costa', 'Cultura', 'Camino'],
    description:
      'Provincia gallega con ciudades históricas, costa atlántica, faros, gastronomía y una fuerte relación con el Camino de Santiago.',
  },
  {
    provinceId: 'lugo',
    capital: 'Lugo',
    population: '320 mil aprox.',
    highlights: ['Muralla de Lugo', 'Playa de las Catedrales'],
    tags: ['Muralla', 'Costa', 'Naturaleza'],
    description:
      'Provincia gallega conocida por su muralla romana, la Mariña Lucense, paisajes verdes, pueblos tranquilos y buena gastronomía.',
  },
  {
    provinceId: 'ourense',
    capital: 'Ourense',
    population: '300 mil aprox.',
    highlights: ['Termas de Ourense', 'Ribeira Sacra'],
    tags: ['Termas', 'Vino', 'Naturaleza'],
    description:
      'Provincia gallega de interior, famosa por sus aguas termales, la Ribeira Sacra, cañones fluviales y paisajes de viñedo.',
  },
  {
    provinceId: 'pontevedra',
    capital: 'Pontevedra',
    population: '950 mil aprox.',
    highlights: ['Vigo', 'Islas Cíes'],
    tags: ['Rías', 'Playas', 'Gastronomía'],
    description:
      'Provincia gallega conocida por las Rías Baixas, playas, marisco, pueblos costeros y espacios naturales como las Islas Cíes.',
  },

  {
    provinceId: 'la_rioja',
    capital: 'Logroño',
    population: '320 mil aprox.',
    highlights: ['Logroño', 'Haro'],
    tags: ['Vino', 'Gastronomía', 'Pueblos'],
    description:
      'Provincia y comunidad famosa por sus vinos, bodegas, paisajes de viñedo, pueblos históricos y gastronomía riojana.',
  },

  {
    provinceId: 'madrid',
    capital: 'Madrid',
    population: '7,2 M aprox.',
    highlights: ['Madrid capital', 'Alcalá de Henares'],
    tags: ['Ciudad', 'Cultura', 'Ocio'],
    description:
      'Provincia del centro de España, marcada por la capital, sus museos, vida cultural, ocio y pueblos históricos.',
  },

  {
    provinceId: 'murcia',
    capital: 'Murcia',
    population: '1,6 M aprox.',
    highlights: ['Murcia capital', 'Cartagena'],
    tags: ['Costa', 'Huerta', 'Historia'],
    description:
      'Provincia y región mediterránea con costa, huerta, ciudades históricas, gastronomía propia y zonas como Cartagena o el Mar Menor.',
  },

  {
    provinceId: 'navarra',
    capital: 'Pamplona',
    population: '680 mil aprox.',
    highlights: ['Pamplona', 'Selva de Irati'],
    tags: ['Naturaleza', 'Fiestas', 'Montaña'],
    description:
      'Provincia y comunidad con gran variedad de paisajes, desde el Pirineo hasta la Ribera, famosa por Pamplona, San Fermín y la Selva de Irati.',
  },

  {
    provinceId: 'alava',
    capital: 'Vitoria-Gasteiz',
    population: '340 mil aprox.',
    highlights: ['Vitoria-Gasteiz', 'Rioja Alavesa'],
    tags: ['Vino', 'Naturaleza', 'Ciudad verde'],
    description:
      'Provincia vasca con una capital muy verde, pueblos de la Rioja Alavesa, bodegas, naturaleza y un ritmo tranquilo.',
  },
  {
    provinceId: 'bizkaia',
    capital: 'Bilbao',
    population: '1,15 M aprox.',
    highlights: ['Bilbao', 'San Juan de Gaztelugatxe'],
    tags: ['Costa', 'Ciudad', 'Gastronomía'],
    description:
      'Provincia vasca conocida por Bilbao, su transformación urbana, la costa vizcaína, pueblos marineros y una gastronomía muy destacada.',
  },
  {
    provinceId: 'gipuzkoa',
    capital: 'Donostia / San Sebastián',
    population: '730 mil aprox.',
    highlights: ['San Sebastián', 'Zarautz'],
    tags: ['Costa', 'Gastronomía', 'Pueblos'],
    description:
      'Provincia vasca famosa por San Sebastián, su costa, pueblos marineros, gastronomía, pintxos y paisajes verdes junto al Cantábrico.',
  },
];

export function getProvinceInfoById(provinceId: string) {
  return provinceInfo.find((info) => info.provinceId === provinceId);
}