// @react-compilation-disable
import { useMemo, useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
// import Map, { Marker, NavigationControl} from 'react-map-gl/maplibre';
import type { Poi, Building, Floor } from '../types/situmTypes';
import { ErrorBoundary, FallbackComponent } from './ErrorBoundary';
import checkImage from '../utils/checkImage.ts'
import 'maplibre-gl/dist/maplibre-gl.css';

// Estilo base
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface MapProps {
    building: Building | undefined | null;
    pois: Poi[] | undefined | null;
    currentFloor: Floor | undefined | null;
}
interface WrapperProps {
    building: Building | undefined | null;
    pois: Poi[] | undefined | null;
    currentFloor: Floor | undefined | null;
}

function MapComponent({ building, pois, currentFloor }: MapProps) {
    // const [imageOK, setImageOK] = useState<boolean | null>(null);
    const [, setImageOK] = useState<boolean | null>(null);
    
    /* ------------------------------------------------------
    Validar imagen al recibir mapUrl
    -------------------------------------------------------*/
    useEffect(() => {
        //Url de la imagen del edificio
        const url = currentFloor?.maps?.map_url;
        if (!url) {
            console.warn("❌ No existe mapUrl en este floor.");
            return;
        }

        checkImage(url).then((valid) => {
            if (!valid) {
                console.error("❌ La imagen del piso es inválida o está corrupta:", url);
                setImageOK(false);
            }
            else {
                console.log("✅ Imagen válida:", url);
                setImageOK(true);
            }
        });
    }, [currentFloor?.maps?.map_url]);
    // EXTRACCIÓN DE PRIMITIVOS:
    // Extrae los valores necesarios para satisfacer al linter/compilador de React
    // y evitar que se queje de dependencias incorrectas en los useMemo.
    // const buildingId = building?.id;
    const buildingLat = building?.location?.lat;
    const buildingLng = building?.location?.lng;
    const buildingRotation = building?.rotation;
    const buildingCorners = building?.corners;

    //           const coords = useMemo(() => {
    //     if (!building?.corners|| building?.corners.length === 0) return null;

    //     const valid = building.corners.every(
    //       (p) =>
    //         Array.isArray(p) &&
    //         p.length === 2 &&
    //         typeof p[0] === "number" &&
    //         typeof p[1] === "number"
    //     );
    //    return valid ? building.corners : null;
    //   }, [building?.corners]);

    const initialViewState = useMemo(() => {
        const rotationDegrees = buildingRotation ? (buildingRotation * 180) / Math.PI : 0;
        console.log("📐 Rotación calculada (Grados):", rotationDegrees);
        // Usa las coordenadas del edificio para centrar el mapa
        if (buildingLat && buildingLng) {
            console.log("Centrando mapa en:", buildingRotation);
            return {
                longitude: buildingLng, // -8.42497...
                latitude: buildingLat,  // 43.35213...
                zoom: 18.25, // Zoom alto para ver el edificio
                bearing: rotationDegrees, // Rota el mapa para que se vea recto
                pitch: 0
            };
        }

        // Fallback solo si los datos vienen corruptos
        // return { longitude: -3.7037, latitude: 40.4167, zoom: 15 };
        return { longitude: -8.426001, latitude: 43.352942, zoom: 15 };
        // FIX: Usamos building?.id para evitar recalcular si cambia la referencia del objeto pero es el mismo edificio
    }, [buildingLat, buildingLng, buildingRotation]);
    // }, [building]);

    // Coordenadas de la imagen (Los 4 puntos para estirar el plano)

    const imageCoordinates = useMemo(() => {
        // MapLibre ImageSource espera: [TopLeft, TopRight, BottomRight, BottomLeft]
        // Situm devuelve 'corners'. Vamos a asumir el orden y mapear lat/lng.
        if (!buildingCorners || buildingCorners.length < 4) return undefined;

        const c = buildingCorners;
        // Mapeo directo: [lng, lat]
        const coordenadas = [
            [c[3].lng, c[3].lat], // NW
            [c[2].lng, c[2].lat], // NE
            [c[1].lng, c[1].lat], // SE
            [c[0].lng, c[0].lat]  // SW
        ];
        // Casting explícito a Tupla de 4 elementos.
        return coordenadas as [[number, number], [number, number], [number, number], [number, number]];
    }, [building?.id]);
    console.log("imageCoordinates", imageCoordinates);


    // URL de la imagen del piso actual
    //    const floorMapUrl = currentFloor?.maps?.map_url;
    const floorMapUrl = currentFloor?.maps?.map_url;
    console.log("buildingCorners", buildingCorners)
    console.log("currentFloor", currentFloor)
    console.log("floorMapUrl", floorMapUrl)
    if (!building) {
        return <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Cargando mapa...</div>;
    }

    return (
        // <div className="h-[500px] w-full rounded-lg overflow-hidden border border-gray-300 relative">
        // <div style={{ height: '600px', width: '100%', position: 'relative', border: '1px solid #ccc', justifyContent: 'center', margin: 'auto' }}>
        // Se usan estilos inline para evitar posibles problemas con el renderizado del mapa si React renderiza antes el mapa que los estilos de  Tailwind.
        <div style={{ height: '900px', width: '100%', position: 'relative', border: '1px solid #ccc', justifyContent: 'center', margin: 'auto' }}>

            {/* DEBUG VISUAL: Si esto sale en el mapa, es que building.location existe */}
            {/* <div style={{
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
            </div> */}
            <Map
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
                scrollZoom={false}
            >
                <NavigationControl position="top-right" />
                {/* --- CAPA DEL PLANO (RASTER) --- */}
                {/* IMAGEN DE PLANO NO SE MUESTRA (URL ROTA) */}
                {/* Solo si tenemos coordenadas y URL de imagen */}
                {imageCoordinates && floorMapUrl && (
                    <Source
                        //    key={floorMapUrl}
                        id="floorplan-source"
                        type="image"
                        url={floorMapUrl}
                        coordinates={imageCoordinates}
                    >
                        <Layer
                            id="floorplan-layer"
                            type="raster"
                            paint={{
                                'raster-opacity': 1,
                                'raster-fade-duration': 0
                            }}
                            beforeId="waterway-name" // Intentar ponerlo debajo de las etiquetas si se puede
                        />
                    </Source>
                )}

                {/* Renderizado de POIs */}
                {pois && pois.map((poi) => {
                    // Busca coordenadas en 'location' o 'position' (por seguridad)
                    // Normaliza a lat/lng o latitude/longitude
                    const loc = poi.location;

                    if (!loc) return null;

                    const lat = loc.lat ?? loc.lat;
                    const lng = loc.lng ?? loc.lng;
                    if (isNaN(lat) || isNaN(lng)) return null;

                    //Crea los marcadores para cada POI
                    return (
                        <Marker
                            key={poi.id}
                            longitude={lng}
                            latitude={lat}
                            anchor="bottom"
                        >
                            <div
                                className="text-xl cursor-pointer hover:scale-110 transition-transform relative group flex justify-center"
                                title={poi.name}
                                onClick={e => {
                                    e.stopPropagation();
                                    console.log("Click en POI:", poi.name);
                                }}

                            >
                                {/* ✨ ICONO SVG PROFESIONAL:
                                    - Punta definida para precisión.
                                    - Sombra para contraste.
                                    - No depende de emojis del sistema operativo.
                                */}
                                <svg
                                    height="30"
                                    viewBox="0 0 24 24"
                                    style={{
                                        fill: '#dc2626',
                                        stroke: 'white',
                                        strokeWidth: '2px',
                                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))'
                                    }}
                                >
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" />
                                </svg>

                                {/* Nombre flotante */}<span className="bg-white px-1 rounded text-sm font-bold shadow opacity-75">
                                    {poi.name}
                                </span>
                            </div>
                        </Marker>
                    );
                })}
            </Map>
        </div>
    );
}
// El Wrapper recibe los datos y se los pasa al MapComponent, protegiéndolo con el ErrorBoundary
const ComponentMapWrapper = ({ building, pois, currentFloor }: WrapperProps) => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <MapComponent
                building={building}
                pois={pois}
                currentFloor={currentFloor}
            />
        </ErrorBoundary>
    );
};

export default ComponentMapWrapper;