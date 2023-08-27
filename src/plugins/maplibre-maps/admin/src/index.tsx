import pluginPkg from '../../package.json';
import Initializer from './components/Initializer';
import pluginId from './pluginId';
import { PinMap } from '@strapi/icons';

const name = pluginPkg.strapi.name;

export default {
  register(app: any) {
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      icon: PinMap,
      isReady: false,
      name,
    };
    app.registerPlugin(plugin);

    app.customFields.register({
      name: 'location-picker',
      pluginId,
      type: 'json', // the color will be stored as a string
      intlLabel: {
        id: 'maplibre-maps.location-picker.label',
        defaultMessage: 'Location picker',
      },
      intlDescription: {
        id: 'maplibre-maps.location-picker.description',
        defaultMessage: 'Maplibre based location picker',
      },
      components: {
        Input: async () =>
          import(
            /* webpackChunkName: "input-component" */ './components/Input'
          ),
      },
      options: {
        advanced: [
          {
            name: 'required',
            type: 'checkbox',
            intlLabel: {
              id: 'form.attribute.item.requiredField',
              defaultMessage: 'Required field',
            },
            description: {
              id: 'form.attribute.item.requiredField.description',
              defaultMessage:
                "You won't be able to create an entry if this field is empty",
            },
          },
        ],
      },
    });
  },

  bootstrap(app: any) {},
};
