import React from 'react';
import { MapComponentsProvider } from '@musaev/react-maplibre';
import { LocationPicker } from './LocationPicker';

function Input(props) {
  const { name, attribute, value, onChange } = props;
  return (
    <MapComponentsProvider>
      <LocationPicker
        name={name}
        attribute={attribute}
        value={value}
        onChange={onChange}
      />
    </MapComponentsProvider>
  );
}

export default Input;
