import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Canteen } from '../types';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="blue-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

declare const google: any;

// Decode Google's encoded polyline format
const decodePolyline = (encoded: string): [number, number][] => {
  const poly: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
};

// Convert OSRM maneuver to Thai instruction
const getOSRMInstruction = (step: any) => {
  const m = step.maneuver;
  const type = m.type;
  const mod = m.modifier || '';
  const name = step.name ? `ไปตาม ${step.name}` : 'เดินตามเส้นทาง';
  
  if (type === 'depart') return `เริ่มต้นการเดินทาง ${name}`;
  if (type === 'arrive') return `ถึงเป้าหมายแล้ว!`;
  
  if (type === 'turn' || type === 'roundabout') {
    if (mod.includes('left')) return `เลี้ยวซ้าย ${name}`;
    if (mod.includes('right')) return `เลี้ยวขวา ${name}`;
    return `เดินต่อไป ${name}`;
  }
  
  return `เดินต่อไป ${name}`;
};

// Call OSRM API (OpenStreetMap)
const fetchOSRMRoute = async (
  origin: [number, number],
  dest: [number, number]
): Promise<{ polylinePoints: [number, number][], steps: { instruction: string, distance: string, distanceMeters: number, durationSeconds: number }[], totalDistance: string, totalDuration: string, totalMeters: number, totalSeconds: number } | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('[OSRM API] no routes:', data);
      return null;
    }
    
    const route = data.routes[0];
    const polylinePoints = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    const leg = route.legs[0];
    
    const totalMeters = route.distance;
    const totalSeconds = route.duration;
    
    const totalDistance = totalMeters < 1000 ? `${Math.round(totalMeters)} ม.` : `${(totalMeters / 1000).toFixed(1)} กม.`;
    const totalDuration = totalSeconds < 60 ? `${Math.round(totalSeconds)} วินาที` : `${Math.round(totalSeconds / 60)} นาที`;
    
    const steps = (leg?.steps || []).map((s: any) => ({
      instruction: getOSRMInstruction(s),
      distance: s.distance < 1000 ? `${Math.round(s.distance)} ม.` : `${(s.distance / 1000).toFixed(1)} กม.`,
      distanceMeters: s.distance || 0,
      durationSeconds: s.duration || 0,
    }));

    return { polylinePoints, steps, totalDistance, totalDuration, totalMeters, totalSeconds };
  } catch (err) {
    console.error('[OSRM error]', err);
    return null;
  }
};


// Google Routes Component
const GoogleDirectionsRoute = ({ userLoc, destLoc, onRouteReady }: {
  userLoc: [number, number],
  destLoc: [number, number],
  onRouteReady?: (info: { 
    steps: { instruction: string, distance: string, distanceMeters: number, durationSeconds: number }[], 
    totalDistance: string, 
    totalDuration: string,
    totalMeters: number,
    totalSeconds: number
  }) => void
}) => {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const drawFallbackLine = () => {
      if (polylineRef.current) map.removeLayer(polylineRef.current);
      polylineRef.current = L.polyline([userLoc, destLoc], {
        color: '#f48fb1', weight: 4, opacity: 0.8, dashArray: '10, 10',
      }).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });
    };

    fetchOSRMRoute(userLoc, destLoc).then((result) => {
      if (!result) { drawFallbackLine(); return; }

      if (polylineRef.current) map.removeLayer(polylineRef.current);
      polylineRef.current = L.polyline(result.polylinePoints, {
        color: '#f48fb1', weight: 6, opacity: 0.9,
      }).addTo(map);
      map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });

      if (onRouteReady) {
        onRouteReady({ 
          steps: result.steps, 
          totalDistance: result.totalDistance, 
          totalDuration: result.totalDuration,
          totalMeters: result.totalMeters,
          totalSeconds: result.totalSeconds
        });
      }
    });

    return () => { if (polylineRef.current) map.removeLayer(polylineRef.current); };

  }, [map, userLoc[0], userLoc[1], destLoc[0], destLoc[1]]);

  return null;
};

interface MapViewProps {
  canteens: Canteen[];
  onSelectCanteen: (canteen: Canteen) => void;
  userLocation: { lat: number, lng: number } | null;
  destination: Canteen | null;
  onRouteReady?: (info: { 
    steps: { instruction: string, distance: string, distanceMeters: number, durationSeconds: number }[], 
    totalDistance: string, 
    totalDuration: string,
    totalMeters: number,
    totalSeconds: number
  }) => void;
}

const MapView: React.FC<MapViewProps> = ({ canteens, onSelectCanteen, userLocation, destination, onRouteReady }) => {
  const defaultCenter: [number, number] = [14.072, 100.601];

  return (
    <div className="map-container-wrapper">
      <MapContainer
        center={defaultCenter}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>ตำแหน่งของคุณ</Popup>
          </Marker>
        )}

        {userLocation && destination && destination.lat && destination.lng && (
          <GoogleDirectionsRoute
            userLoc={[userLocation.lat, userLocation.lng]}
            destLoc={[destination.lat, destination.lng]}
            onRouteReady={onRouteReady}
          />
        )}

        {canteens.map((canteen) => (
          canteen.lat && canteen.lng && (
            <Marker key={canteen.id} position={[canteen.lat, canteen.lng]}>
              <Popup>
                <div style={{ padding: '5px' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{canteen.name}</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                    ระยะทาง: <strong>{canteen.distance}</strong>
                  </p>
                  <button
                    onClick={() => onSelectCanteen(canteen)}
                    style={{
                      background: '#f48fb1', color: 'white', border: 'none',
                      padding: '5px 10px', borderRadius: '4px', cursor: 'pointer',
                      fontSize: '12px', width: '100%'
                    }}
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
