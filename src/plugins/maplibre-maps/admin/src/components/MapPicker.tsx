import { MapLibreMap, MlFillExtrusionLayer, MlNavigationTools } from '@musaev/react-maplibre';
import React from 'react';

const mapOptions = {
  zoom: 11,
  style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
  center: [55, 55] as [number, number],
};

function MapPicker() {
    return (
        <div style={{ position: 'relative', height: '100%' }}>
        <MapLibreMap
          options={mapOptions}
          mapId="map"
          style={{ width: '100%', height: '100%' }}
        />
        <MlFillExtrusionLayer mapId="map" />
  
        <div style={{ position: 'absolute', right: 20, bottom: 30 }}>
          <MlNavigationTools mapId="map" />
        </div>
      </div>
    )
}

export default MapPicker;