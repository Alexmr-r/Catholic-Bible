const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidExcludeSupport(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = excludeSupportFromBuildGradle(config.modResults.contents);
    }
    return config;
  });
};

function excludeSupportFromBuildGradle(buildGradle) {
  // Añadir una regla global para excluir las librerías de soporte antiguas que causan duplicados
  const exclusionBlock = `
allprojects {
    configurations.all {
        resolutionStrategy {
            force 'androidx.core:core:1.13.1'
            force 'androidx.core:core-ktx:1.13.1'
            force 'androidx.appcompat:appcompat:1.6.1'
            force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
        }
        exclude group: 'com.android.support'
    }
}
`;

  if (!buildGradle.includes('exclude group: \'com.android.support\'')) {
    return buildGradle + exclusionBlock;
  }
  return buildGradle;
}
