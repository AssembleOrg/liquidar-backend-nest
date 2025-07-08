// apps/external/webpack.config.js
import CopyPlugin from 'copy-webpack-plugin';
import { resolve } from 'path';

export default (config, _webpack) => {
  // Copiamos todas las .hbs de la librería
  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: resolve(__dirname, '../../libs/shared/templates/src'),
          to: 'templates',               // → dist/apps/external/templates/*.hbs
          globOptions: { ignore: ['**/*.ts'] }
        }
      ]
    })
  );
  return config;
};
