import MapComponent from './components/MapComponent';
import SidebarComponent from './components/SidebarComponent';
import { ErrorBoundary, FallbackComponent } from './components/ErrorBoundary';
import { useUIStore } from './stores/uiStore';
import { useGetBuildingById } from './hooks/useGetBuildingById';
import { useGetPois } from './hooks/useGetPois';

const TARGET_ID = import.meta.env.VITE_APP_SITUM_BUILDING_ID;

/**
 * Componente principal de la aplicación.
 * Se encarga de renderizar el mapa y la barra lateral y manejar los errores
 */
function App() {
  const { isLoading: loadingBuilding, error: errorBuilding } = useGetBuildingById(TARGET_ID);
  const { isLoading: loadingPois, error: errorPois } = useGetPois();

  const building = useUIStore(s => s.building);
  const pois = useUIStore(s => s.pois);

  const isLoading = loadingBuilding || (loadingPois && !pois.length);
  const error = errorBuilding || errorPois;

  if (isLoading && !building)
    return <div className="h-screen flex items-center justify-center animate-pulse text-gray-500">
      Cargando Situm...
    </div>;
  if (error)
    return <div className="p-10 text-red-600 border border-red-200 bg-red-50 rounded m-10">
      Error: {error instanceof Error ? error.message : "Error desconocido"}
    </div>;
  if (!building) return null;


  // const situmColor = '#283380'
  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center p-6 text-[#283380]">

      {/*Título*/}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-8">Prueba Técnica Situm (Juan Fuente)</h1>
      </div>
      <div className="flex p-10 font-sans w-auto m-auto border border-[#283380] rounded-lg gap-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        )}

        {!building && !error && <p>Cargando datos de la API...</p>}

        {building && (
          <div className="flex flex-col md:flex-row gap-4 h-[800px] w-full max-w-[1600px] overflow-hidden  border border-gray-800 bg-gray-200 p-2 rounded">
            {/* COLUMNA IZQUIERDA: Selector de plantas y Lista Filtrada */}
            {/* w-80 o w-1/4 asegura que la lista tenga un ancho sensato */}
            <div className="w-full md:w-1/4 flex-none h-full">
              <SidebarComponent />
            </div>

            {/* COLUMNA DERECHA: Mapa */}
            {/* flex-1 obliga al mapa a ocupar todo el espacio restante */}
            <div className="flex-1 relative w-[1100px] h-full ml-6 border border-gray-800 rounded shadow-lg relative overflow-hidden bg-gray-200">
              <MapComponent />
            </div>
          </div>
        )}
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