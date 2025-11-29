import type { Poi, Floor } from '../types/situmTypes';
import { Popup } from 'react-map-gl/maplibre';


interface PoupProps {
    selectedPoi: Poi | undefined | null,
    currentFloor: Floor | undefined | null,
    onClose: () => void
}
export default function PopupComponent({ selectedPoi, currentFloor, onClose }: PoupProps) {
    if (!selectedPoi?.location.lat && !selectedPoi?.location.lng) return null;
    return (
        <Popup
            longitude={selectedPoi?.location.lng}
            latitude={selectedPoi?.location.lat}
            // anchor="top" //obliga a crecer hacia abajo
            onClose={onClose}
            closeOnClick={false}
            maxWidth="300px"
            className="z-50"
            offset={15} //margen respecto al marker
            focusAfterOpen={false}
        >
            <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg text-blue-800 mb-1">{selectedPoi?.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Planta:</strong> {currentFloor?.name || selectedPoi?.floorId}</p>
                    {/* Muestra información HTML si existe */}
                    {selectedPoi?.categoryName && (
                        // <div dangerouslySetInnerHTML={{ __html: selectedPoi.infoHtml }} className="mt-2 text-xs" />
                        <p><strong>Categoría: </strong>{selectedPoi?.categoryName}</p>
                    )}
                    {selectedPoi?.info && (
                        // <div dangerouslySetInnerHTML={{ __html: selectedPoi.infoHtml }} className="mt-2 text-xs" />
                        <p><strong>Info: </strong>{selectedPoi?.info}</p>
                    )}
                    {selectedPoi?.infoUnsafe && (
                        // <div dangerouslySetInnerHTML={{ __html: selectedPoi.infoHtml }} className="mt-2 text-xs" />
                        <p><strong>Info: </strong>{selectedPoi?.infoUnsafe}</p>
                    )}
                    {/* {selectedPoi?.icon && (
                        // <div dangerouslySetInnerHTML={{ __html: selectedPoi.infoHtml }} className="mt-2 text-xs" />
                        <img className='w-8 h-8'>{selectedPoi?.icon}</img>
                    )} */}
                    {/* <button onClick={onClose} className="cursor-pointer">
                        <img src="/x-circle.svg" alt="close icon" className="w-8 h-8" />
                    </button> */}
                </div>
            </div>
        </Popup>

    )
}