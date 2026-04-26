import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  readOnly?: boolean;
}

export default function MapPicker({ value, onChange, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = value ? [value.lat, value.lng] : [40.4093, 49.8671];
    const zoom = value ? 14 : 12;

    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    if (value) {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map);
    }

    if (!readOnly) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        onChange({ lat, lng });
      });
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker when value changes externally
  useEffect(() => {
    if (!mapRef.current || !value) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng]);
    } else {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(mapRef.current);
    }
    mapRef.current.setView([value.lat, value.lng], 14);
  }, [value?.lat, value?.lng]);

  return <div ref={containerRef} style={{ height: '220px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} />;
}
