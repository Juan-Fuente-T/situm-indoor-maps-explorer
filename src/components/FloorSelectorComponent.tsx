import { useUIStore } from '../stores/uiStore';
import { ErrorBoundary, FallbackComponent } from '../components/ErrorBoundary';


// --- SUB-COMPONENTE 1 de SidebarComponent: El Selector de Pisos ---
const FloorSelectorComponent = () => {
    const building = useUIStore(s => s.building);
    const currentFloor = useUIStore(s => s.currentFloor);
    const setCurrentFloor = useUIStore(s => s.setCurrentFloor);
    const setIsPopupOpen = useUIStore((state) => state.setIsPopupOpen);

    if (!building) return null;

    return (
        <div className="bg-white py-1 lg:p-2 lg:gap-2 flex-none flex flex-col m-1">
            <div className="flex flex-row-reverse lg:flex-row justify-between items-center lg:items-start">
                <div className="flex lg:flex-col items-center lg:items-start gap-4">
                    <h2 className="text-lg lg:text-xl font-semibold">{building.name}</h2>
                    <p className="text-gray-600">Edificio ID: {building.id}</p>
                </div>
                <img src="/situm-icon.svg" alt="situm logo" className="w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12" />
            </div>

            <div className="flex lg:flex-col items-end lg:items-start gap-2 justify-end bg-white lg:p-2 lg:p-4 rounded-lg lg:border lg:border-gray-200">
                <h3 className="text-xs lg:text-sm font-bold text-gray-500 lg:mb-1 lg:mb-2 uppercase">Plantas</h3>
                <div className="flex flex-nowrap overflow-x-auto gap-2 lg:pb-1 no-scrollbar items-center">
                    {building.floors.map(floor => (
                        <button
                            key={floor.id}
                            onClick={() => { setCurrentFloor(floor); setIsPopupOpen(false); }}
                            className={`whitespace-nowrap flex-shrink-0 px-3 lg:px-3 xl-px-4 py-1.5 rounded text-sm font-medium border border-gray-800 transition-colors ${currentFloor?.id === floor.id
                                ? 'bg-[#283380] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {floor.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const FloorSelectorComponentWrapper = () => {
    return (
        <ErrorBoundary fallback={<FallbackComponent />}>
            <FloorSelectorComponent />
        </ErrorBoundary>
    );
};

export default FloorSelectorComponentWrapper;