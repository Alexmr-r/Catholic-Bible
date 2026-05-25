const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidReplaceAppComponentFactory(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    const mainApplication = androidManifest.application[0];

    // Añadir el atributo tools:replace y el valor correcto para evitar conflictos
    mainApplication.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';
    mainApplication.$['tools:replace'] = 'android:appComponentFactory';
    
    return config;
  });
};
