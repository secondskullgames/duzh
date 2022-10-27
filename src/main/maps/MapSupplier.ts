import MapInstance from './MapInstance';

export type MapSupplier = () => Promise<MapInstance>;