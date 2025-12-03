import { useQuery } from "@tanstack/react-query"
import { useEffect } from 'react';
import SitumSDK from '@situm/sdk-js';
import type { RealBuilding } from '../types/situmTypes';
import { useUIStore } from '../stores/uiStore';

const sdk = new SitumSDK({
  auth: {
    apiKey: import.meta.env.VITE_APP_SITUM_API_KEY,
  },
});
// El SDK espera un objeto para el ID{ buildingId: number }
export const useGetBuildingById = (buildingId: number) => {
  const setBuilding = useUIStore(state => state.setBuilding);
  const setCurrentFloor = useUIStore(state => state.setCurrentFloor);

  const { data, isLoading, error } = useQuery({
    queryKey: ['getBuildingById', buildingId],
    queryFn: async () => {
      const result = await sdk.cartography.getBuildingById(buildingId);
      // ⚠️ WORKAROUND: El SDK define `map_url` pero la API devuelve `mapUrl`
    // Bug en Situm SDK o Api de pruebas. Forzamos el tipo correcto.
    return result as unknown as RealBuilding;
    },
    enabled: !!buildingId, //solo se llama si hay id de edificio
    staleTime: Infinity, // solo se actualiza si cambia el edificio
  });

  // Sincronización con Zustand
  useEffect(() => {
    const defaultFloor = data?.floors.find(f => f.level === 0) || data?.floors[0];
    if (data!== undefined && defaultFloor != undefined) {
      setBuilding(data);
      setCurrentFloor(defaultFloor);
    }
  }, [data, setBuilding, setCurrentFloor]);

  return { building: data, isLoading, error };
}
