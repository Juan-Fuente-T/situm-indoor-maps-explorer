// Este archivo centraliza la creación de datos falsos.

export const createMockFloor = (overrides = {}) => ({
  id: 101,
  buildingId: 7033,
  level: 0,
  name: 'Planta Baja',
  levelHeight: 3,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  maps: {
    scale: 1,
    mapUrl: 'http://example.com/map.png',
    mapId: '1'
  },
  customFields: [],
  ...overrides
});

// AÑADIDO: Mock para POIs con TODOS los campos de Required<PoiUpdateForm>
export const createMockPoi = (overrides = {}) => ({
  id: 2001,
  buildingId: 7033,
  floorId: 101,
  name: 'Baños',
  info: 'Baños de caballeros',
  categoryName: 'Baños',
  infoUnsafe: 'Baños de caballeros',
  type: 'poi',
  categoryId: 10,
  categoryIds: [10],
  icon: 'https://dashboard.situm.com/static/img/categories/ba.png',
  selectedIcon: 'https://dashboard.situm.com/static/img/categories/ba_selected.png',
  location: {
    lat: 42.8,
    lng: -8.5,
    x: 50,
    y: 50
  },
  position: {
    floorId: 101,
    georeferences: {
      lat: 42.8,
      lng: -8.5
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  customFields: [],
  ...overrides
});

export const createMockBuilding = (overrides = {}) => ({
  id: 7033,
  name: 'Edificio Test',
  address: 'Calle Test',
  info: 'Info del edificio',
  infoHtml: '', // El SDK real lo trae aunque el tipo no lo diga, pero el tipo pide 'info'
  pictureThumbUrl: '',
  pictureUrl: '',
  rotation: 0,
  serverUrl: '', // Requerido por BuildingListElement
  userId: 'user-uuid-123', // Requerido por BuildingListElement
  calibrationModel: { // Requerido por BuildingListElement
    id: 1,
    updatedAt: new Date(),
    download: ''
  },
  location: {
    lat: 42.8,
    lng: -8.5
  },
  floors: [
    createMockFloor({ id: 101, level: 0 }),
    createMockFloor({ id: 102, level: 1 })
  ],
  bounds: {
    northEast: { lat: 0, lng: 0 },
    northWest: { lat: 0, lng: 0 },
    southEast: { lat: 0, lng: 0 },
    southWest: { lat: 0, lng: 0 }
  },
  // Ojo: boundsRotated no está en el tipo Building, pero suele venir en el SDK.
  boundsRotated: {
    northEast: { lat: 0, lng: 0 },
    northWest: { lat: 0, lng: 0 },
    southEast: { lat: 0, lng: 0 },
    southWest: { lat: 0, lng: 0 }
  },
  center: { lat: 0, lng: 0 },
  dimensions: {
    width: 100,
    length: 100
  },
  description: '', // Opcional en BuildingBase
  
  pois: [],      // Requerido por Building
  geofences: [], // Requerido por Building
  paths: {       // Requerido por Building
    nodes: [],
    links: []
  },
  
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  
  corners: [], // Requerido por Building

  ...overrides
});