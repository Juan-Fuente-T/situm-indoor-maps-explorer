
export type ID = number;

export type PoiCreateForm = PoiUpdateForm;

export type UUID = string;

export type Poi = Required<PoiCreateForm> & {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  categoryName: string;
  infoUnsafe: string;
  type: string;
  floorId: number;
  location: Coordinate & Cartesians;
};

export type PoiUpdateForm = {
  buildingId: ID;
  name?: string;
  info?: string;
  categoryId?: number;
  categoryIds?: number[];
  customFields?: CustomField[];
  icon?: string;
  selectedIcon?: string;
  position: {
    floorId: ID;
    georeferences: Coordinate;
  };
};

export type Coordinate = {
  lat: number;
  lng: number;
};

export type Cartesians = {
  x: number;
  y: number;
};

export type CustomField = {
  key: string;
  value: string;
};

export type Geofence = GeofenceForm & {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
};

export type GeofenceForm = {
  buildingId: string;
  code?: string;
  customFields?: CustomField[];
  floorId: ID;
  geometric: [number, number][];
  info?: string;
  name: string;
  organizationId?: UUID;
  type: GeofenceType;
};

export type GeofenceType = "POLYGON";

export type Paths = {
  nodes: Node[];
  links: Link[];
};

export type Link = {
  source: number;
  target: number;
  origin: "both" | "source" | "target";
  tags: string[];
  accessible: boolean;
};

export type Maps = {
  scale: number;
  map_url: string;
  map_id: string;
};

export type FloorBase = {
  buildingId: ID;
  level: number;
  levelHeight?: number;
  name?: string;
  customFields?: CustomField[];
};

export type FloorForm = FloorBase & {
  mapId: string;
};

export type Floor = FloorBase & {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  maps: Maps;
};

export type Building = BuildingListElement & {
  corners: Coordinate[];
  floors: Floor[];
  pois: Poi[];
  geofences: Geofence[];
  paths: Paths;
};

export type BuildingListElement = BuildingBase & {
  id: ID;
  info: string;
  calibrationModel: CalibrationModel;
  createdAt: Date;
  pictureThumbUrl: string;
  pictureUrl: string;
  serverUrl: string;
  updatedAt: Date;
  userId: UUID;
};

export type BuildingBase = {
  customFields?: CustomField[];
  description?: string;
  dimensions: Dimensions;
  info?: string;
  location: Coordinate;
  name: string;
  rotation: number;
};

export type CalibrationModel = {
  id: number;
  updatedAt: Date;
  download: string;
};

export type Dimensions = {
  width: number;
  length: number;
};
