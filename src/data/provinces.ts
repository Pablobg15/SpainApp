export type Province = {
  id: string;
  name: string;
  community: string;
};

export const provinces: Province[] = [
  // Andalucía
  { id: 'almeria', name: 'Almería', community: 'Andalucía' },
  { id: 'cadiz', name: 'Cádiz', community: 'Andalucía' },
  { id: 'cordoba', name: 'Córdoba', community: 'Andalucía' },
  { id: 'granada', name: 'Granada', community: 'Andalucía' },
  { id: 'huelva', name: 'Huelva', community: 'Andalucía' },
  { id: 'jaen', name: 'Jaén', community: 'Andalucía' },
  { id: 'malaga', name: 'Málaga', community: 'Andalucía' },
  { id: 'sevilla', name: 'Sevilla', community: 'Andalucía' },

  // Aragón
  { id: 'huesca', name: 'Huesca', community: 'Aragón' },
  { id: 'teruel', name: 'Teruel', community: 'Aragón' },
  { id: 'zaragoza', name: 'Zaragoza', community: 'Aragón' },

  // Asturias
  { id: 'asturias', name: 'Asturias', community: 'Asturias' },

  // Islas Baleares
  { id: 'illes_balears', name: 'Illes Balears', community: 'Islas Baleares' },

  // Canarias
  { id: 'las_palmas', name: 'Las Palmas', community: 'Canarias' },
  { id: 'santa_cruz_tenerife', name: 'Santa Cruz de Tenerife', community: 'Canarias' },

  // Cantabria
  { id: 'cantabria', name: 'Cantabria', community: 'Cantabria' },

  // Castilla-La Mancha
  { id: 'albacete', name: 'Albacete', community: 'Castilla-La Mancha' },
  { id: 'ciudad_real', name: 'Ciudad Real', community: 'Castilla-La Mancha' },
  { id: 'cuenca', name: 'Cuenca', community: 'Castilla-La Mancha' },
  { id: 'guadalajara', name: 'Guadalajara', community: 'Castilla-La Mancha' },
  { id: 'toledo', name: 'Toledo', community: 'Castilla-La Mancha' },

  // Castilla y León
  { id: 'avila', name: 'Ávila', community: 'Castilla y León' },
  { id: 'burgos', name: 'Burgos', community: 'Castilla y León' },
  { id: 'leon', name: 'León', community: 'Castilla y León' },
  { id: 'palencia', name: 'Palencia', community: 'Castilla y León' },
  { id: 'salamanca', name: 'Salamanca', community: 'Castilla y León' },
  { id: 'segovia', name: 'Segovia', community: 'Castilla y León' },
  { id: 'soria', name: 'Soria', community: 'Castilla y León' },
  { id: 'valladolid', name: 'Valladolid', community: 'Castilla y León' },
  { id: 'zamora', name: 'Zamora', community: 'Castilla y León' },

  // Cataluña
  { id: 'barcelona', name: 'Barcelona', community: 'Cataluña' },
  { id: 'girona', name: 'Girona', community: 'Cataluña' },
  { id: 'lleida', name: 'Lleida', community: 'Cataluña' },
  { id: 'tarragona', name: 'Tarragona', community: 'Cataluña' },

  // Comunidad Valenciana
  { id: 'alicante', name: 'Alicante', community: 'Comunidad Valenciana' },
  { id: 'castellon', name: 'Castellón', community: 'Comunidad Valenciana' },
  { id: 'valencia', name: 'Valencia', community: 'Comunidad Valenciana' },

  // Extremadura
  { id: 'badajoz', name: 'Badajoz', community: 'Extremadura' },
  { id: 'caceres', name: 'Cáceres', community: 'Extremadura' },

  // Galicia
  { id: 'a_coruna', name: 'A Coruña', community: 'Galicia' },
  { id: 'lugo', name: 'Lugo', community: 'Galicia' },
  { id: 'ourense', name: 'Ourense', community: 'Galicia' },
  { id: 'pontevedra', name: 'Pontevedra', community: 'Galicia' },

  // La Rioja
  { id: 'la_rioja', name: 'La Rioja', community: 'La Rioja' },

  // Comunidad de Madrid
  { id: 'madrid', name: 'Madrid', community: 'Comunidad de Madrid' },

  // Región de Murcia
  { id: 'murcia', name: 'Murcia', community: 'Región de Murcia' },

  // Navarra
  { id: 'navarra', name: 'Navarra', community: 'Navarra' },

  // País Vasco
  { id: 'alava', name: 'Álava', community: 'País Vasco' },
  { id: 'bizkaia', name: 'Bizkaia', community: 'País Vasco' },
  { id: 'gipuzkoa', name: 'Gipuzkoa', community: 'País Vasco' },
];