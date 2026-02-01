'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// --- CONFIG ICON (Biar gambarnya muncul) ---
// Kita pakai gambar marker dari internet karena default leaflet suka error di Next.js
const iconUser = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconOffice = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapWithRadius({ userLocation, officeLocation }: any) {
    
    // Auto Center Peta ke User
    function ChangeView({ coords }: any) {
        const map = useMap();
        map.setView(coords, map.getZoom());
        return null;
    }

    // Jika user belum dapat lokasi, tampilkan loading/default
    if (!userLocation) return <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">Menunggu Lokasi GPS...</div>;

    return (
        <MapContainer 
            center={[userLocation.lat, userLocation.long]} 
            zoom={16} 
            scrollWheelZoom={false} 
            style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 1. MARKER USER (BIRU) */}
            <Marker position={[userLocation.lat, userLocation.long]} icon={iconUser}>
                <Popup>Lokasi Kamu</Popup>
            </Marker>

            {/* 2. MARKER KANTOR (MERAH) + LINGKARAN RADIUS */}
            {officeLocation && (
                <>
                    <Marker position={[officeLocation.lat, officeLocation.lng]} icon={iconOffice}>
                        <Popup>Lokasi Kantor</Popup>
                    </Marker>
                    
                    {/* Lingkaran Radius (Warna Merah Transparan) */}
                    <Circle 
                        center={[officeLocation.lat, officeLocation.lng]}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                        radius={officeLocation.radiusKm * 1000} // Convert KM ke Meter
                    />
                </>
            )}
        </MapContainer>
    );
}

// Helper hook untuk akses map instance (biar bisa auto center)
import { useMap } from 'react-leaflet';