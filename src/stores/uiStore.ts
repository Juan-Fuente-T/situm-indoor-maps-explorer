import { create } from 'zustand';
import type { Poi } from '@situm/sdk-js';
import type { RealBuilding, RealFloor } from '../types/situmTypes';

// Define la interfaz del estado GLOBAL
interface UIState {
    // --- DATOS PRINCIPALES del edificio ---
    building: RealBuilding | null;
    pois: Poi[]; // Lista completa de POIs

    // --- ESTADO DE UI - Lo que el usuario está mirando ---
    currentFloor: RealFloor | null;
    selectedPoi: Poi | null;
    isPopupOpen: boolean;

    // --- ACCIONES ---
    setBuilding: (building: RealBuilding | null) => void;
    setPois: (pois: Poi[]) => void;
    setCurrentFloor: (floor: RealFloor | null) => void;
    setSelectedPoi: (poi: Poi | null) => void;
    setIsPopupOpen:(isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Valores iniciales
    building: null,
    pois: [],
    currentFloor: null,
    selectedPoi: null,
    isPopupOpen: false,

    // Setters de Datos
    setBuilding: (building) => set({ building }),
    setPois: (pois) => set({ pois }),

    // Setters de Selección
    // Al cambiar de planta, limpia el POI seleccionado para evitar incoherencias visuales
    setCurrentFloor: (floor) => set({ currentFloor: floor, selectedPoi: null }),

    setSelectedPoi: (poi) => set({ selectedPoi: poi }),
    setIsPopupOpen: (isOpen) => set({ isPopupOpen: isOpen }),
}));