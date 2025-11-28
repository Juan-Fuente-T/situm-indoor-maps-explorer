import { useEffect, useState } from 'react';
import type { Poi, Building, BuildingListElement } from "./types/situmTypes";
import SitumSDK from '@situm/sdk-js';


function App() {
  const [data, setData] = useState<{ building: Building; pois: Poi[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inicializar el SDK
    const sdk = new SitumSDK({
      auth: {
        apiKey: '0ab95b2013b876a81dedac18c6f4d1e26bafbe55f22858ba8d543b26882e7412',
      },
    });

    console.log("SDK Inicializado. Pidiendo datos...");

    // Usa promesas (async/await dentro de una función)
    const fetchData = async () => {
      try {
        const buildings: Promise<readonly BuildingListElement[]> = sdk.cartography.getBuildings();
        console.log("Buildings()...", buildings);
        console.log("Llamando a cartography.getBuildings()...");
        const buildingsList = await sdk.cartography.getBuildings();

        console.log("EDIFICIOS RECIBIDOS:", buildingsList);
        // Busca el edificio 7033 (convierte a string para asegurar)
        const targetBuildingSummary = buildingsList.find((b: BuildingListElement) => String(b.id) === '7033');

        if (targetBuildingSummary) {
          console.log("Edificio encontrado en lista:", targetBuildingSummary);

          // Pide el detalle COMPLETO del edificio
          const building = await sdk.cartography.getBuildingById(targetBuildingSummary.id);
          console.log("Buildin: ", building);

          console.log("Pidiendo POIs...");
          // Casting doble para los POIs
          const pois = (await sdk.cartography.getPois({ buildingId: 7033 })) as unknown as Poi[];
          console.log("POIS", pois);

          const fullBuilding: Building = {
            ...targetBuildingSummary,
            pois: pois,
            corners: [], // Rellena para cumplir tipo
            floors: [],
            geofences: [],
            paths: { nodes: [], links: [] }
          };

          setData({ building: fullBuilding, pois });
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


  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Prueba Técnica Situm (Juan Fuente)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      )}

      {!data && !error && <p>Cargando datos de la API...</p>}

      {data && (
        <div className="border p-4 rounded shadow bg-gray-50">
          <h2 className="text-xl font-semibold text-blue-600">{data.building.name}</h2>
          <p className="text-gray-600">ID: {data.building.id}</p>
          <div className="mt-4">
            <h3 className="font-bold">POIs Encontrados: {data.pois.length}</h3>
            <ul className="mt-2 space-y-1">
              {/* Limita la lista de Pois mostrados con Slice*/}
              {data.pois.slice(0, 5).map((poi: Poi) => (

                <li key={poi.id} className="text-sm bg-white p-2 border rounded">
                  {poi.name} (Planta: {poi.floorId})
                </li>
              ))}
            </ul>
            {data.pois.length > 5 && <p className="text-sm text-gray-500 mt-2">... y más</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;