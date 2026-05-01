import React, { useState, useEffect } from 'react'
import { FaMapMarkedAlt, FaMapMarkerAlt, FaUtensils, FaSearch, FaArrowUp, FaArrowLeft, FaArrowRight, FaFlagCheckered, FaMagic, FaClock, FaWalking, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import './index.css'

// Import Components
import Header from './components/Header'
import SearchSection from './components/SearchSection'
import CanteenCard from './components/CanteenCard'
import BottomNav from './components/BottomNav'
import CanteenDetail from './components/CanteenDetail'
import MapView from './components/MapView'

// Import Types
import { Canteen } from './types'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('current')
  const [activeNav, setActiveNav] = useState<string>('home')
  const [startTime, setStartTime] = useState<string>('08:00')
  const [endTime, setEndTime] = useState<string>('18:00')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false)
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null)
  
  const mockCanteens: Canteen[] = [
    { id: 1, name: 'โรงอาหารทิวสน', hours: '07:00 - 18:00', distance: '350m', density: 'โล่ง', statusClass: 'status-low', open: true, lat: 14.07626, lng: 100.59545, image: '/images/thewson.jpg' },
    { id: 2, name: 'โรงอาหาร SC', hours: '08:00 - 19:00', distance: '200m', density: 'ปานกลาง', statusClass: 'status-med', open: true, lat: 14.06964, lng: 100.60455, image: '/images/sc.jpg' },
    { id: 3, name: 'โรงอาหาร JC', hours: '06:00 - 19:00', distance: '480m', density: 'ปานกลาง', statusClass: 'status-med', open: true, lat: 14.06924, lng: 100.60477, image: '/images/jc.jpg' },
    { id: 4, name: 'กรีนแคนทีน', hours: '07:00 - 14:00', distance: '600m', density: 'หนาแน่น', statusClass: 'status-high', open: false, lat: 14.07335, lng: 100.60114, image: '/images/green.jpg' }
  ]
  const [displayCanteens, setDisplayCanteens] = useState<Canteen[]>([])
  const [mapCanteens, setMapCanteens] = useState<Canteen[]>([])
  const [destination, setDestination] = useState<Canteen | null>(null)
  const [hasSearched, setHasSearched] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>('')
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiModel, setAiModel] = useState<string>('')
  const [routeInfo, setRouteInfo] = useState<{ 
    steps: {instruction: string, distance: string, distanceMeters: number, durationSeconds: number}[], 
    totalDistance: string, 
    totalDuration: string,
    totalMeters: number,
    totalSeconds: number
  } | null>(null)
  const [navStepIndex, setNavStepIndex] = useState<number>(0)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setHasSearched(false);
    setDisplayCanteens([]); // Clear results when switching tabs
  };

  const isCanteenOpen = (hours: string, checkTime?: string): boolean => {
    try {
      // Handle Thai format like "8.30 - 19.00 น." or "07:00-19:00"
      const cleanHours = hours.replace(/\s*น\.?/g, '').replace(/\./g, ':');
      const parts = cleanHours.split(/[-–]/).map(p => p.trim());
      if (parts.length !== 2) return true;

      const now = new Date();
      let currentH, currentM;

      if (checkTime) {
        [currentH, currentM] = checkTime.split(':').map(Number);
      } else {
        currentH = now.getHours();
        currentM = now.getMinutes();
      }

      const [startH, startM] = parts[0].split(':').map(Number);
      const [endH, endM] = parts[1].split(':').map(Number);

      const currentTime = currentH * 60 + currentM;
      const startTime = startH * 60 + (startM || 0);
      const endTime = endH * 60 + (endM || 0);

      return currentTime >= startTime && currentTime <= endTime;
    } catch (e) {
      return true; // Fallback to open
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
  };

  // Fetch walking distance from Google SDK
  const fetchWalkingDistance = (originLat: number, originLng: number, destLat: number, destLng: number): Promise<string> => {
    return new Promise((resolve) => {
      if (typeof google === 'undefined') {
        resolve(calculateDistance(originLat, originLng, destLat, destLng));
        return;
      }

      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(originLat, originLng)],
          destinations: [new google.maps.LatLng(destLat, destLng)],
          travelMode: google.maps.TravelMode.WALKING,
        },
        (response, status) => {
          if (status === 'OK' && response && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            const meters = element.distance.value;
            resolve(meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`);
          } else {
            resolve(calculateDistance(originLat, originLng, destLat, destLng));
          }
        }
      );
    });
  };

  useEffect(() => {
    const fetchMapCanteens = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${baseUrl}/canteens/all`)
        const data = await response.json()
        
        const getImageForCanteen = (id: number) => {
          switch(id) {
            case 1: return '/images/thewson.jpg';
            case 2: return '/images/sc.jpg';
            case 3: return '/images/jc.jpg';
            case 4: return '/images/green.jpg';
            default: return undefined;
          }
        };

        // First pass: use Haversine as placeholder
        const mappedData: Canteen[] = data.map((item: any) => ({
          id: item.canteen_id,
          name: item._name || item.name,
          hours: item.opening_hours,
          distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, item._latitude || item.latitude, item._longitude || item.longitude) : '---',
          density: (item._seat_count || item.seat_count) > 300 ? 'หนาแน่น' : 'ปานกลาง',
          statusClass: (item._seat_count || item.seat_count) > 300 ? 'status-high' : 'status-med',
          open: isCanteenOpen(item.opening_hours),
          lat: item._latitude || item.latitude,
          lng: item._longitude || item.longitude,
          capacity: (item._seat_count || item.seat_count)?.toString(),
          locationDesc: item._location || item.location,
          image: getImageForCanteen(item.canteen_id)
        }))
        
        setMapCanteens(mappedData)

        // Second pass: fetch real walking distances from Google
        if (userLocation) {
          const updated = await Promise.all(mappedData.map(async (c) => {
            const walkDist = await fetchWalkingDistance(userLocation.lat, userLocation.lng, c.lat, c.lng);
            return { ...c, distance: walkDist };
          }));
          setMapCanteens(updated);
        }
      } catch (error) {
        console.error('Failed to fetch map canteens:', error)
      }
    }

    fetchMapCanteens()
  }, [userLocation]) // Refetch/Recalculate when userLocation changes

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่ง')
      return
    }

    setIsLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('ไม่สามารถดึงตำแหน่งได้ กรุณาลองใหม่อีกครั้ง')
        setIsLocationLoading(false)
      }
    )
  }

  const handleNavigate = (canteen: Canteen): void => {
    setDestination(canteen);
    setNavStepIndex(0); // Reset to first step
    setActiveNav('map'); // Switch to map tab
    setSelectedCanteen(null); // Close detail view
  };

  const handleSearch = (): void => {
    if (!userLocation) {
      showToast('กรุณาระบุตำแหน่งก่อนทำการค้นหา')
      return
    }
    setIsLoading(true)
    setHasSearched(true)
    setAiSummary(null) // Reset summary

    setTimeout(async () => {
      try {
        const checkTime = activeTab === 'range' ? startTime : undefined;
        
        // 1. Filter locally for display
        const filtered = mapCanteens.filter(c => isCanteenOpen(c.hours, checkTime));
        setDisplayCanteens(filtered);

        // 2. Only call AI if there are open canteens
        if (userLocation && filtered.length > 0) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
          const today = new Date().toISOString().split('T')[0];
          
          // Use actual current time for 'current' tab, or user-selected time for 'range' tab
          let queryStart: string, queryEnd: string;
          if (activeTab === 'current') {
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMin = now.getMinutes().toString().padStart(2, '0');
            const nextHour = ((now.getHours() + 1) % 24).toString().padStart(2, '0');
            queryStart = `${today} ${currentHour}:${currentMin}`;
            queryEnd = `${today} ${nextHour}:${currentMin}`;
          } else {
            queryStart = `${today} ${startTime}`;
            // Set end time to 1 hour after start time to get a good sample for that point in time
            const [h, m] = startTime.split(':').map(Number);
            const endH = (h + 1) % 24;
            queryEnd = `${today} ${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
          }
          
          const recommendUrl = `${baseUrl}/canteens/recommend?lat=${userLocation.lat}&lng=${userLocation.lng}&start_time=${queryStart}&end_time=${queryEnd}`;
          const response = await fetch(recommendUrl);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // 1. Merge backend data first
            const ranked = filtered.map(c => {
              const aiMatch = data.results.find((r: any) => r.canteen_id === c.id);
              if (aiMatch) {
                const statusMap: Record<string, string> = { 'น้อย': 'status-low', 'ปานกลาง': 'status-med', 'หนาแน่น': 'status-high' };
                return { 
                  ...c, 
                  rank: aiMatch.rank, 
                  density: aiMatch.crowd_level, 
                  statusClass: statusMap[aiMatch.crowd_level] || 'status-med',
                  trend: aiMatch.trend_status
                };
              }
              return { ...c, rank: 99 };
            });

            // 2. ENHANCE with Google Places API (New) - ดึงพิกัดที่เป๊ะที่สุดและ Rating
            const enhanced = await Promise.all(ranked.map(async (c) => {
              try {
                const googleUrl = 'https://places.googleapis.com/v1/places:searchText';
                const gRes = await fetch(googleUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
                    'X-Goog-FieldMask': 'places.location,places.rating'
                  },
                  body: JSON.stringify({ 
                    textQuery: `${c.name} ธรรมศาสตร์ รังสิต`, 
                    maxResultCount: 1,
                    locationBias: {
                      circle: {
                        center: { latitude: userLocation.lat, longitude: userLocation.lng },
                        radius: 2000.0
                      }
                    }
                  })
                });
                const gData = await gRes.json();
                if (gData.places && gData.places.length > 0) {
                  const p = gData.places[0];
                  return {
                    ...c,
                    lat: p.location.latitude,
                    lng: p.location.longitude,
                    density: c.density // Just use original density
                  };
                }
              } catch (e) { console.error('Google Enhance Error:', e); }
              return c;
            }));

            setDisplayCanteens(enhanced.sort((a, b) => (a.rank || 99) - (b.rank || 99)));
            if (data.gemini_summary) setAiSummary(data.gemini_summary);
            if (data.recommenderEngine) setAiModel(data.recommenderEngine);
          }
        }
      } catch (error) {
        console.error('Failed to fetch AI recommendation:', error);
      } finally {
        setIsLoading(false)
      }
    }, 600)
  }

  const resetCanteens = (): void => setDisplayCanteens(mapCanteens.filter(c => c.open))

  if (selectedCanteen) {
    return (
      <div className="app-container" style={{ paddingBottom: '20px' }}>
        <CanteenDetail 
          canteen={selectedCanteen} 
          onBack={() => setSelectedCanteen(null)} 
          onNavigate={handleNavigate}
        />
      </div>
    )
  }

  return (
    <div className={`app-container ${activeNav === 'map' ? 'map-mode' : ''}`}>
      <Header resetCanteens={resetCanteens} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <FaMapMarkerAlt size={16} style={{ flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeNav === 'home' ? (
        <>
          <SearchSection 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            onSearch={handleSearch}
            onGetLocation={handleGetLocation}
            isLoading={isLoading}
            isLocationLoading={isLocationLoading}
            hasLocation={!!userLocation}
          />

          {hasSearched && aiSummary && (
            <div className="ai-summary-card animate-in">
              <div className="ai-summary-header">
                <div className="ai-badge">
                  <FaMagic /> <span>AI Recommendation</span>
                </div>
                {aiModel && <span className="ai-model-tag">{aiModel}</span>}
              </div>
              <p className="ai-text">{aiSummary}</p>
            </div>
          )}

          <section className="results-section">
            <div className="results-header">
              <h2>โรงอาหารแนะนำทั้งหมด</h2>
              {!isLoading && <span className="count-badge">พบ {displayCanteens.length} แห่ง</span>}
            </div>
            <div className="canteen-list animate-in">
              {isLoading ? (
                <div className="no-results-container">
                  <div className="loading-spinner"></div>
                  <p>กำลังโหลด...</p>
                </div>
              ) : (hasSearched && displayCanteens.length > 0) ? (
                displayCanteens.map(canteen => (
                  <CanteenCard 
                    key={canteen.id} 
                    canteen={canteen} 
                    onClick={setSelectedCanteen}
                  />
                ))
              ) : (
                <div className="no-results-container">
                  <div className="no-results-icon">
                    {!userLocation ? (
                      <FaMapMarkerAlt size={48} color="var(--primary-pink)" />
                    ) : !hasSearched ? (
                      <FaSearch size={48} color="var(--primary-pink)" />
                    ) : (
                      <FaUtensils size={48} color="#ccc" />
                    )}
                  </div>
                  <p>
                    {!userLocation 
                      ? 'ระบุตำแหน่งเพื่อเริ่มค้นหาโรงอาหาร' 
                      : !hasSearched 
                        ? 'กดปุ่มค้นหาโรงอาหารเพื่อเริ่มต้น' 
                        : 'ไม่พบโรงอาหารที่เปิดให้บริการในช่วงเวลานี้'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="map-view animate-in">
          <MapView 
            canteens={destination ? [destination] : mapCanteens} 
            onSelectCanteen={setSelectedCanteen} 
            userLocation={userLocation}
            destination={destination}
            onRouteReady={setRouteInfo}
          />
          {destination && routeInfo && (() => {
            let remainingMeters = 0;
            let remainingSeconds = 0;
            for (let i = navStepIndex; i < routeInfo.steps.length; i++) {
              remainingMeters += routeInfo.steps[i].distanceMeters;
              remainingSeconds += routeInfo.steps[i].durationSeconds;
            }
            const distStr = remainingMeters < 1000 ? `${Math.round(remainingMeters)} ม.` : `${(remainingMeters / 1000).toFixed(1)} กม.`;
            const timeStr = remainingSeconds < 60 ? `${remainingSeconds} วินาที` : `${Math.round(remainingSeconds / 60)} นาที`;

            return (
              <div className="nav-panel">
                <div className="nav-panel-header">
                  <div className="nav-summary">
                    <span className="nav-dest"><FaFlagCheckered /> {destination.name}</span>
                    <span className="nav-meta">เหลือระยะทาง {navStepIndex === 0 ? routeInfo.totalDistance : distStr}</span>
                  </div>
                  <button className="nav-close-btn" onClick={() => { setDestination(null); setRouteInfo(null); }}>✕</button>
                </div>
                <div className="nav-steps-list">
                {routeInfo.steps.map((step, i) => {
                  if (i !== navStepIndex) return null;
                  
                  // Logic for Direction Icons
                  let DirectionIcon = FaArrowUp;
                  const m = step.maneuver?.toLowerCase() || '';
                  if (m.includes('left')) DirectionIcon = FaArrowLeft;
                  else if (m.includes('right')) DirectionIcon = FaArrowRight;
                  else if (m.includes('straight')) DirectionIcon = FaArrowUp;
                  else if (m.includes('merge') || m.includes('fork')) DirectionIcon = FaArrowUpRight;

                  return (
                    <div key={i} className="nav-step nav-step-active">
                      <div className="nav-step-icon">
                        {i === 0 ? <FaMapMarkerAlt /> : i === routeInfo.steps.length - 1 ? <FaFlagCheckered /> : <DirectionIcon />}
                      </div>
                      <div className="nav-step-body">
                        <div className="nav-step-instruction" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                        <div className="nav-step-distance">{step.distance}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="nav-controls">
                <button 
                  className="nav-control-btn" 
                  disabled={navStepIndex === 0} 
                  onClick={() => setNavStepIndex(prev => Math.max(0, prev - 1))}
                >
                  ก่อนหน้า
                </button>
                <span className="nav-step-counter">{navStepIndex + 1} / {routeInfo.steps.length}</span>
                <button 
                  className={`nav-control-btn ${navStepIndex === routeInfo.steps.length - 1 ? 'finish' : 'next'}`}
                  onClick={() => {
                    if (navStepIndex === routeInfo.steps.length - 1) {
                      setDestination(null); setRouteInfo(null);
                    } else {
                      setNavStepIndex(prev => Math.min(routeInfo.steps.length - 1, prev + 1))
                    }
                  }}
                >
                  {navStepIndex === routeInfo.steps.length - 1 ? 'เสร็จสิ้น' : 'ถัดไป'}
                </button>
              </div>
            </div>
            );
          })()}
        </section>
      )}

      <BottomNav 
        activeNav={activeNav} 
        setActiveNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'map') {
            setDestination(null); // Clear routing when clicking Map tab normally
          }
        }} 
      />
    </div>
  )
}

export default App
