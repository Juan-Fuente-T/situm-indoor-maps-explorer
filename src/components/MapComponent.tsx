import { useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import type { Poi, Building } from '../types/situmTypes';
import { ErrorBoundary, FallbackComponent } from  './ErrorBoundary';

// Estilo base
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapProps {
    building: Building | undefined;
    pois: Poi[] | undefined;
}
interface WrapperProps {
    building: Building | undefined;
    pois: Poi[] | undefined;
}

function MapComponent({ building, pois }: MapProps) {
    console.log("BUILDING en MAP", building);
    console.log("POIS en MAP", pois);
    // Dentro de MapComponent, antes del return
    console.log("ESTRUCTURA REAL DEL PRIMER POI:", pois?.at(0));

    const initialViewState = useMemo(() => {
        // Usa building.location para centrar el mapa
        if (building && building.location) {
            console.log("Centrando mapa en:", building.location);
            return {
                longitude: building.location.lng, // -8.42497...
                latitude: building.location.lat,  // 43.35213...
                zoom: 18 // Zoom alto para ver el edificio
            };
        }

        // Fallback solo si los datos vinien corruptos
        return { longitude: -3.7037, latitude: 40.4167, zoom: 15 };
    }, [building]);

    if (!building) {
        return <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
    }

    return (
        // <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-300 relative">
        <div style={{ height: '600px', width: '100%', position: 'relative', border: '1px solid #ccc', justifyContent: 'center', margin: 'auto' }}>

            {/* DEBUG VISUAL: Si esto sale en el mapa, es que building.location existe */}
            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1000,
                background: 'rgba(255,255,255,0.9)',
                padding: '5px',
                fontSize: '10px',
                maxWidth: '200px'
            }}>
                <strong>DEBUG:</strong><br />
                Edificio: {building.name}<br />
                Lat: {building.location.lat}<br />
                Lng: {building.location.lng}<br />
                POIs: {pois?.length}
            </div>
            <Map
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
            >
                <NavigationControl position="top-right" />

                {/* Renderizado de POIs */}
                {pois && pois.map((poi) => {
                    // Busca coordenadas en 'location' o 'position' (por seguridad)
                    // Normaliza a lat/lng o latitude/longitude
                    const loc = poi.location;

                    if (!loc) return null;

                    const lat = loc.lat ?? loc.lat;
                    const lng = loc.lng ?? loc.lng;

                    //Crea los marcadores para cada POI
                    return (
                        <Marker
                            key={poi.id}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                        >
                            <div
                                className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                                title={poi.name}
                                onClick={() => console.log("Click en POI:", poi.name)}
                            >
                                📍
                            </div>
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}
// El Wrapper recibe los datos y se los pasa al MapComponent, protegiéndolo con el ErrorBoundary
const ComponentMapWrapper = ({ building, pois }: WrapperProps) => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <MapComponent building={building} pois={pois} />
        </ErrorBoundary>
    );
};

export default ComponentMapWrapper;