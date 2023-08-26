import React from 'react';
import { MapComponentsProvider } from '@musaev/react-maplibre';
import { MapPicker } from './MapPicker';

function Input(props) {
  const { name, attribute, value, onChange } = props;
  return (
    <MapComponentsProvider>
      <MapPicker
        name={name}
        attribute={attribute}
        value={value}
        onChange={onChange}
      />
    </MapComponentsProvider>
  );
}

export default Input;
