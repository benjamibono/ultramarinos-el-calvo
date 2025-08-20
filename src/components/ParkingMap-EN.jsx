import { useEffect, useRef } from 'react';

const ParkingMapEN = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Importar Leaflet dinámicamente para evitar problemas de SSR
    const initMap = async () => {
      if (typeof window === 'undefined') return;
      
      const L = await import('leaflet');
      
      // Configurar iconos por defecto de Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Coordenadas del restaurante Ultramarinos El Calvo (coordenadas exactas de OpenStreetMap)
      const restaurantLat = 36.5283616;
      const restaurantLng = -6.1921863;

      // Crear el mapa con menos zoom para ver tanto el restaurante como los parkings
      const map = L.map(mapRef.current).setView([(restaurantLat - 0.0010), (restaurantLng - 0.0010) ], 17);
      mapInstanceRef.current = map;

      // Añadir capa de mapa (OpenStreetMap gratuito)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Marcador del restaurante
      const restaurantIcon = L.divIcon({
        className: 'restaurant-marker',
        html: `
          <div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      L.marker([restaurantLat, restaurantLng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-sm mb-1">Ultramarinos El Calvo</h3>
            <p class="text-xs text-gray-600 mb-2">149 Plaza Street</p>
            <a 
              href="https://maps.google.com/?q=${restaurantLat},${restaurantLng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-block bg-blue-200 text-white text-xs px-2 py-1 rounded transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        `);

      // Zonas de aparcamiento reales de OpenStreetMap
      const parkingAreas = [
        {
          name: 'Ambulatory Parking',
          coordinates: [
            [36.5270958, -6.1951845], // 7172745375
            [36.5269521, -6.1945120], // 7172745377  
            [36.5272719, -6.1943894], // 11377500029
            [36.5272681, -6.1943657], // 12163299831
            [36.5272612, -6.1943223], // 11377500030
            [36.5271836, -6.1943438], // 11377500031
            [36.5271669, -6.1942822], // 1055488954
            [36.5263792, -6.1945985], // 1055488964
            [36.5265521, -6.1953952]  // 11377500032
          ],
          color: '#22c55e',
          description: 'Free parking next to the ambulatory - Very convenient'
        },
        {
          name: 'Municipal Pavilion Parking',
          coordinates: [
            [36.5271662, -6.1938451], // 1980992072
            [36.5271208, -6.1938621], // 6925262841
            [36.5269300, -6.1939333], // 1072344000
            [36.5265328, -6.1922610], // 7159093773
            [36.5264956, -6.1921948], // 7161362549
            [36.5267585, -6.1920979]  // 1980992080
          ],
          color: '#3b82f6',
          description: 'Free parking at the municipal pavilion - Spacious and safe'
        }
      ];

      // Dibujar las zonas de aparcamiento
      parkingAreas.forEach(area => {
        const polygon = L.polygon(area.coordinates, {
          color: area.color,
          fillColor: area.color,
          fillOpacity: 0.3,
          weight: 2
        }).addTo(map);

        // Calcular el centro del polígono para el enlace de Google Maps
        const centerLat = area.coordinates.reduce((sum, coord) => sum + coord[0], 0) / area.coordinates.length;
        const centerLng = area.coordinates.reduce((sum, coord) => sum + coord[1], 0) / area.coordinates.length;

        polygon.bindPopup(`
          <div class="text-center">
            <h3 class="font-bold text-sm mb-1">${area.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${area.description}</p>
            <a 
              href="https://maps.google.com/?q=${centerLat},${centerLng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-block bg-blue-200 text-white text-xs px-2 py-1 rounded transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        `);
      });

      // Añadir leyenda
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
          <div class="bg-white p-2 rounded shadow-lg text-xs">
            <h4 class="font-bold mb-2 text-center">Available Parking</h4>
            <div class="space-y-1">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Ambulatory</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Pavilion</span>
              </div>
            </div>
            <p class="text-[10px] text-gray-500 mt-2 text-center">Click on areas for more info</p>
          </div>
        `;
        return div;
      };
      legend.addTo(map);
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg sm:text-xl md:text-2xl xxl:text-4xl xxxl:text-5xl font-bold mb-2 flex items-center justify-center">
          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-parking mr-2"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M10 16v-8h2.667c.736 0 1.333 .895 1.333 2s-.597 2 -1.333 2h-2.667" /></svg>
          NEARBY & FREE PARKING
        </h3>
        <p className="text-xs sm:text-sm md:text-base xxl:text-xl xxxl:text-2xl text-gray-600 max-w-3xl mx-auto">
          We live in the heart of the town, but parking can be tricky. <br /> We invite you to use these two free nearby parking areas for your convenience.
        </p>
      </div>
      
      <div 
        ref={mapRef}
        className="w-full h-64 sm:h-80 md:h-96 xxl:h-[500px] xxxl:h-[600px] rounded-lg shadow-lg border border-gray-200"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default ParkingMapEN;
