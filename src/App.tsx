import { useEffect, useState, useMemo } from 'react';
import type { Poi, Building, Floor } from "./types/situmTypes";
import SitumSDK from '@situm/sdk-js';
import MapComponent from './components/MapComponent';
import { ErrorBoundary, FallbackComponent } from './components/ErrorBoundary';


function App() {
  const [data, setData] = useState<{ building: Building; pois: Poi[] } | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  useEffect(() => {
    // Inicializar el SDK
    const sdk = new SitumSDK({
      auth: {
        apiKey: import.meta.env.VITE_APP_SITUM_API_KEY,
      },
    });

    console.log("SDK Inicializado. Pidiendo datos...");

    // Usa promesas (async/await dentro de una función)
    const fetchData = async () => {
      try {
        // const buildings: Promise<readonly BuildingListElement[]> = sdk.cartography.getBuildings();
        // console.log("Buildings()...", buildings);

        // console.log("Llamando a cartography.getBuildings()...");
        // const buildingsList = await sdk.cartography.getBuildings();
        // console.log("EDIFICIOS RECIBIDOS:", buildingsList);
        // Busca el edificio 7033 (convierte a string para asegurar)
        // const targetBuilding= buildingsList.find((b: BuildingListElement) => String(b.id) === '7033');

        // Pide el detalle COMPLETO del edificio 7033
        const targetBuilding = await sdk.cartography.getBuildingById(7033);
        console.log("Target Buildin: ", targetBuilding);

        if (targetBuilding) {
          console.log("Pidiendo POIs...");
          // Casting doble para los POIs
          const pois = (await sdk.cartography.getPois({ buildingId: 7033 })) as unknown as Poi[];
          console.log("POIS", pois);

          // console.log("Pidiendo Pisos...");
          // const floors = (await sdk.cartography.getFloors({ buildingId: 7033 })) as unknown as Floor[];

          const fullBuilding: Building = {
            ...targetBuilding,
            pois: pois,
            corners: targetBuilding.corners,
            floors: targetBuilding.floors,
            geofences: targetBuilding.geofences,
            paths: { nodes: [], links: [] }
          };

          setData({ building: fullBuilding, pois });

          // Selecciona por defecto la planta baja (level 0) o la primera que haya
          const defaultFloor = fullBuilding.floors.find(f => f.level === 0) || fullBuilding.floors[0];
          setSelectedFloor(defaultFloor);
        } else {
          setError("Conexión exitosa, pero no encuentra el edificio 7033 en la lista.");
        }

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al conectar con la API.");
        }
      }
    };

    //Llama a la función de busqueda
    fetchData();

  }, []);

  // FILTRADO: Solo pasamos al mapa y a la lista los POIs de la planta actual
  const filteredPois = useMemo(() => {
    if (!data || !selectedFloor) return [];
    console.log("SELECTED FLOOR", selectedFloor);
    return data.pois.filter(poi => poi.floorId === selectedFloor.id);
  }, [data, selectedFloor]);
  // const situmColor = '#283380'

  return (
    <div className="p-10 w-full">
      <div>
        <h1 className="text-2xl font-bold mb-8">Prueba Técnica Situm (Juan Fuente)</h1>
      </div>
      <div className="flex p-10 font-sans w-full border border-gray-800 rounded-lg gap-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        )}

        {!data && !error && <p>Cargando datos de la API...</p>}


        {data && (
          <div className="border border-gray-800 w-1/3 bg-gray-200 p-6 rounded">
            {/* COLUMNA IZQUIERDA */}
            {/* <div className="border p-4 rounded shadow bg-gray-50"> */}
            <div className="bg-white border rounded-lg shadow p-2 gap-2 flex-1 flex flex-col overflow-hidden">
              <h2 className="text-xl font-semibold text-[#283380]">{data.building.name}</h2>
              <p className="text-gray-600">Edificio ID: {data.building.id}</p>

              {/* Selector de Plantas */}
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">Plantas</h3>
                <div className="flex flex-wrap gap-2">
                  {data.building.floors.map(floor => (
                    <button
                      key={floor.id}
                      onClick={() => setSelectedFloor(floor)}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${selectedFloor?.id === floor.id
                        ? 'bg-[#283380] text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {floor.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* <div className="mt-4">
                <h3 className="font-bold">POIs Encontrados: {data.pois.length}</h3>
                <ul className="mt-2 space-y-1">
                  {data.pois.slice(0, 5).map((poi: Poi) => (
                    
                    <li key={poi.id} className="text-sm bg-white p-2 border rounded">
                      {poi.name} (Planta: {poi.floorId})
                    </li>
                  ))}
                </ul>
                {data.pois.length > 5 && <p className="text-sm text-gray-500 mt-2">... y más</p>}
              </div> */}
            </div>
            {/* Lista Filtrada */}
            <div className="bg-white mt-4 border rounded-lg shadow flex-1 flex flex-col  overflow-y-auto max-h-[665px] pr-2">
              <div className="p-4 border-b bg-gray-50">
                 {/* <h2 className="font-bold text-blue-800">{data.building.name}</h2> */}
                 <h2 className="font-bold text-bg-[#283380]">Planta {selectedFloor?.name}</h2>
                 <p className="text-xs text-gray-500">
                   {filteredPois.length} POIs en planta {selectedFloor?.name}
                 </p>
               </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {/* {filteredPois.slice(0, 10).map(poi => { */}
                 {filteredPois.map(poi => (
                   <div
                     key={poi.id}
                     className="p-3 border rounded hover:bg-[#283380]/30 cursor-pointer transition-colors bg-white"
                     onClick={() => setSelectedPoi(poi)}
                   >
                     <div className="font-medium text-gray-700">{poi.name}</div>
                   </div>
                 ))}
                 {filteredPois.length === 0 && (
                   <div className="p-4 text-center text-gray-400 text-sm">
                     No hay puntos de interés en esta planta.
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
        {/* <div className="w-full border border-gray-800 rounded">
          <MapComponent building={data?.building} pois={data?.pois} />
        </div> */}
        {/* COLUMNA DERECHA: Mapa */}
        {/* <div className="w-full border border-gray-800 rounded shadow-lg relative overflow-hidden bg-gray-200"> */}
        <div className="w-full h-fit border border-gray-800 rounded shadow-lg bg-gray-200 relative overflow-hidden p-2">
          <MapComponent
            building={data?.building} //Pasa el edificio
            pois={filteredPois} // Pasa los Pois filtrados
            currentFloor={selectedFloor} // Pasa la planta para pintar el plano
            selectedPoi={selectedPoi}
            setSelectedPoi={setSelectedPoi}
          />
        </div>
      </div>
    </div>
  );
}


// El Wrapper recibe App protegiéndola con el ErrorBoundary
const AppWrapper = () => {
  return (
    <ErrorBoundary fallback={<FallbackComponent />}>
      <App />
    </ErrorBoundary>
  );
};

export default AppWrapper;