import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';


export const useGetFloorImage = () => {
    const currentFloor = useUIStore(state => state.currentFloor);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const url = currentFloor?.maps?.mapUrl;
        if (!url) {
            // setBlobUrl(null);
            // setLoading(false);
            // setError(null);
            return;
        }

        let active = true;
        let createdUrl: string | null = null;

        fetch(url)
            .then(async (response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                //Obtiene el blob de la imagen
                const blob = await response.blob();

                if (active) {
                    //Crea la url de la imagen a partir del blob
                    createdUrl = URL.createObjectURL(blob);
                    console.log("✅ Imagen lista para mapa:", createdUrl);
                    setBlobUrl(createdUrl);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("❌ Error descarga:", err);
                if (active) {
                    setError(err instanceof Error ? err.message : 'Error desconocido'); // Marcamos que hubo error
                    setLoading(false);
                }
            });

        // CLEANUP: Se ejecuta al cambiar de piso o desmontar
        return () => {
            active = false;
            // Limpia la url que creó esta instancia
            if (createdUrl) {
                URL.revokeObjectURL(createdUrl);
            }
            setBlobUrl(null);
        };
    }, [currentFloor?.maps?.mapUrl]);

    return { blobUrl, loading, error };
}
