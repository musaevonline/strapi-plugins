import React from 'react';
import { MapComponentsProvider } from '@musaev/react-maplibre';
import { LocationPicker } from './LocationPicker';

function Input(props) {
  const { name, attribute, value, onChange, required } = props;
  return (
    <MapComponentsProvider>
      <LocationPicker
        name={name}
        attribute={attribute}
        required={required}
        value={value}
        onChange={onChange}
      />
    </MapComponentsProvider>
  );
}

export default Input;
