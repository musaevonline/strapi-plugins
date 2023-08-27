import {
  MapLibreMap,
  MlFillExtrusionLayer,
  MlNavigationTools,
  useMap,
} from '@musaev/react-maplibre';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';
import { TextInput, Checkbox } from '@strapi/design-system';

export interface IMapPickerProps {
  name: string;
  attribute: any;
  required: boolean;
  value: string;
  onChange: Function;
}

export const LocationPicker: React.FC<IMapPickerProps> = (props) => {
  const { name, attribute, required, value: defaultValue, onChange } = props;
  const mapHook = useMap({ mapId: 'map' });
  const markerRef = useRef<maplibregl.Marker>();
  const parsed = tryParse(defaultValue) || {};
  const [coords, setCoords] = useState<[number, number] | undefined>(
    parsed.lng && parsed.lat ? [parsed.lng, parsed.lat] : undefined,
  );
  const [address, setAddress] = useState<string>(parsed.address);
  const [manual, setManual] = useState(parsed.manual);
  const changed = useRef(false);

  const mapOptions = {
    zoom: coords?.length === 2 ? 15 : 7,
    style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
    center:
      coords?.length === 2 ? coords : ([47.9155, 42.467] as [number, number]),
  };

  useEffect(() => {
    if (!mapHook?.map) return;
    if (coords?.length === 2) {
      markerRef.current = new maplibregl.Marker()
        .setLngLat(coords)
        .addTo(mapHook.map);
    }

    const handler = (e: any) => {
      if (!mapHook?.map) return;
      if (!e?.lngLat?.lng || !e?.lngLat?.lat) return;

      const lngLat = [e.lngLat.lng, e.lngLat.lat] as [number, number];
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = new maplibregl.Marker()
        .setLngLat(lngLat)
        .addTo(mapHook.map);
      syncAddress([e.lngLat.lng, e.lngLat.lat]);
    };

    mapHook.map.on('click', handler);

    return () => {
      if (!mapHook?.map) return;
      mapHook.map.off('click', handler);
      markerRef.current?.remove();
      mapHook.cleanup();
    };
  }, [mapHook.map]);

  useEffect(() => {
    if (!manual && coords?.length === 2) syncAddress(coords);
  }, [manual]);

  useEffect(() => {
    if (address !== parsed.address) changed.current = true;
  }, [address]);

  useEffect(() => {
    if (!address || coords?.length !== 2 || !changed.current) return;

    const result = {
      address,
      lng: coords[0],
      lat: coords[1],
      manual,
    };
    console.log(result);
    onChange({
      target: {
        name,
        value: JSON.stringify(result),
        type: attribute.type, // json
      },
    });
  }, [address, coords, manual]);

  const syncAddress = ([lng, lat]: [number, number]) => {
    fetch(
      `https://nominatim.openstreetmap.org/reverse.php?lat=${lat}&lon=${lng}&zoom=18&format=jsonv2`,
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        const houseNumber = res?.address?.house_number;
        const street = res?.address?.road || res?.address?.suburb;
        const city =
          res?.address?.city ||
          res?.address?.town ||
          res?.address?.city_district ||
          res?.address?.county ||
          res?.address?.state ||
          res?.address?.region;
        console.log(city, street, res?.lat, res?.lon);
        if (!city || !res?.lat || !res?.lon) return;
        setAddress([city, street, houseNumber].filter(Boolean).join(', '));
        setCoords([+res.lon, +res.lat]);
      })
      .catch(console.error);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div>
        <TextInput
          label="Адрес"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Поставьте точку на карте"
          disabled={!manual}
          required={required}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 8,
            marginTop: 8,
          }}
        >
          <Checkbox
            value={manual}
            disabled={coords?.length !== 2}
            onValueChange={(v) => setManual(v)}
          >
            Задать адрес вручную
          </Checkbox>
        </div>
      </div>
      <MapLibreMap
        options={mapOptions}
        mapId="map"
        style={{ width: '100%', height: '400px' }}
      />
      <MlFillExtrusionLayer mapId="map" />
      <div style={{ position: 'absolute', right: 20, bottom: 30 }}>
        <MlNavigationTools mapId="map" />
      </div>
    </div>
  );
};

const tryParse = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};
