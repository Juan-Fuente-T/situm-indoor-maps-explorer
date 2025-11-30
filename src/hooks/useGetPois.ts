import { useQuery } from "@tanstack/react-query"
import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import SitumSDK from '@situm/sdk-js';
import type { Poi, PoiSearch } from "../types/situmTypes";

const sdk = new SitumSDK({
  auth: {
    apiKey: import.meta.env.VITE_APP_SITUM_API_KEY,
  },
});
export const useGetPois = () => {
  const building = useUIStore(state => state.building);
  const setPois = useUIStore(state => state.setPois);

  const buildingId = building?.id;
  const poiSe: PoiSearch = {
    buildingId: buildingId,
    // type: "indoor",
    // view: "compact",
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['getPois', buildingId],
    queryFn: async () => {
      // El SDK espera un objeto { poisearch: Poisearch }
      const result = await sdk.cartography.getPois(poiSe);
      return result as Poi[];
    },
    enabled: !!buildingId, //solo se llama si hay id de edificio
    staleTime: Infinity, // solo se actualiza si cambia el edificio
  });

  // Sincronizacon Zustand
  useEffect(() => {
    if (data && data.length > 0) {
      setPois(data);
    }
  }, [data, setPois]);

  return { pois: data, isLoading, error };
}