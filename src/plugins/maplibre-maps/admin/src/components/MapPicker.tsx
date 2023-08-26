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
  value: any;
  onChange: Function;
}

export const MapPicker: React.FC<IMapPickerProps> = (props) => {
  const { name, attribute, value: defaultValue, onChange } = props;
  const mapHook = useMap({ mapId: 'map' });
  const markerRef = useRef<maplibregl.Marker>();
  const addressRef = useRef<any>(null);
  const [value, setValue] = useState<any>(tryParse(defaultValue) || {});
  const [manual, setManual] = useState(false);

  const mapOptions = {
    zoom: value.coords.length === 2 ? 15 : 7,
    style: 'https://wms.wheregroup.com/tileserver/style/osm-bright.json',
    center:
      value.coords.length === 2
        ? value.coords
        : ([47.9155, 42.467] as [number, number]),
  };

  useEffect(() => {
    if (!mapHook?.map) return;
    if (value?.coords?.length === 2) {
      markerRef.current = new maplibregl.Marker()
        .setLngLat(value.coords)
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
      fetch(
        `https://nominatim.openstreetmap.org/reverse.php?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&zoom=18&format=jsonv2`,
      )
        .then((res) => res.json())
        .then((address) => {
          const houseNumber = address?.address?.house_number;
          const street = address?.address?.road || address?.address?.suburb;
          const city =
            address?.address?.city ||
            address?.address?.county ||
            address?.address?.state ||
            address?.address?.region;

          if (!city || !street || !address?.lat || !address?.lon) return;
          setValue({
            address: [city, street, houseNumber].join(', '),
            coords: [+address.lon, +address.lat],
          });
        })
        .catch(console.error);
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
    applyChange();
    if (!value?.address || !addressRef.current?.input?.current || manual)
      return;
    addressRef.current.input.current.value = value.address;
  }, [value, manual]);

  const applyChange = () => {
    const address = manual
      ? addressRef?.current?.input?.current?.value
      : value?.address;

    if (!address || !value?.coords?.length) return;

    const result = {
      address,
      coords: value.coords,
    };

    onChange({
      target: {
        name,
        value: JSON.stringify(result),
        type: attribute.type, // json
      },
    });
  };

  return (
    <div>
      <div>
        <TextInput
          ref={addressRef}
          label="Адрес"
          defaultValue={value?.address}
          placeholder="Поставьте точку на карте"
          disabled={!manual}
          onChange={applyChange}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 8,
            marginTop: 8,
          }}
        >
          <Checkbox value={manual} onValueChange={(v) => setManual(v)}>
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
