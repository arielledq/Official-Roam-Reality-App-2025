import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ViroARSceneNavigator,
  ViroARScene,
  ViroMaterials,
  ViroBox,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroTrackingStateConstants,
  ViroSpotLight, ViroQuad, ViroSphere, ViroAnimatedImage, ViroOmniLight, ViroSkyBox,
} from "@viro-community/react-viro";

const RallyScene = () => {
  function onInitialized(state, reason) {
    console.log('Tracking status:', state, reason);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      // Tracking normal
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroSkyBox
        source={{
          nx: require('../../assets/images/black.jpg'),
          px: require('../../assets/images/black.jpg'),
          ny: require('../../assets/images/black.jpg'),
          py: require('../../assets/images/black.jpg'),
          nz: require('../../assets/images/black.jpg'),
          pz: require('../../assets/images/black.jpg')
        }}
      />
      <ViroAmbientLight color="#FFFFFF" intensity={250} />
      {/*<ViroDirectionalLight color="#FFFFFF" direction={[0, -1,  0]}/>*/}
      {/*<ViroDirectionalLight color="#FFFFFF" direction={[0,  0, -1]}/>*/}

      <ViroOmniLight
        color="#ffffff"
        attenuationStartDistance={0.1}
        attenuationEndDistance={6}
        position={[0, 0.9, -0.1]}
        intensity={5000}
      />
      <ViroOmniLight
        color="#ffffff"
        attenuationStartDistance={0.1}
        attenuationEndDistance={6}
        position={[0.5, 0.5, -0.1]}
        intensity={5000}
      />

      {/*<ViroSpotLight*/}
      {/*  color="#ffff00"*/}
      {/*  attenuationStartDistance={2}*/}
      {/*  attenuationEndDistance={6}*/}
      {/*  position={[0, -1, -1]}*/}
      {/*  direction={[0, 1, 0]}*/}
      {/*  innerAngle={0}*/}
      {/*  outerAngle={45}*/}
      {/*  intensity={25000}*/}
      {/*/>*/}


      {/*<ViroAnimatedImage*/}
      {/*  // imageClipMode={'None'}*/}
      {/*  loop={true}*/}
      {/*  position={[0, 0.2, -1]}*/}
      {/*  height={1}*/}
      {/*  width={1}*/}
      {/*  placeholderSource={require('../../assets/images/texture.jpg')}*/}
      {/*  source={require('../../assets/images/fire.gif')}*/}
      {/*/>*/}
      {/*<ViroSphere*/}
      {/*  facesOutward={false}*/}
      {/*  // heightSegmentCount={20}*/}
      {/*  // widthSegmentCount={20}*/}
      {/*  radius={0.5}*/}
      {/*  position={[0, 0.5, -1]}*/}
      {/*  // scale={[.3, .3, .3]}*/}
      {/*  materials={["glowEffect"]} />*/}

      <ViroBox
        position={[0, 0.9, -1]}
        rotation={[0, 45, 0]}
        scale={[.1, .3, .3]}
        materials={["bliin3"]} />

      <ViroBox
        position={[0, 0.5, -1]}
        rotation={[0, 45, 0]}
        scale={[.1, .3, .3]}
        materials={["lamber"]} />

      <ViroBox
        position={[0, 0.1, -1]}
        rotation={[0, 45, 0]}
        scale={[.3, .3, .1]}
        materials={["bliin2"]} />

      <ViroBox
        position={[0, -.4, -1]}
        rotation={[0, 45, 0]}
        scale={[.3, .3, .1]}
        materials={["bliin"]} />



      {/*<ViroQuad*/}
      {/*  height={2}*/}
      {/*  width={2}*/}
      {/*  position={[0, 0.0, -1]}*/}
      {/*  scale={[.2, .4, .4]}*/}
      {/*  rotation={[-90, 0, 0]}*/}
      {/*  materials={['glowEffect']}*/}
      {/*/>*/}


      {/*<ViroSpotLight*/}
      {/*  color="#ffff00"*/}
      {/*  attenuationStartDistance={2}*/}
      {/*  attenuationEndDistance={6}*/}
      {/*  position={[0, 3, 0]}*/}
      {/*  direction={[0, -1, 0]}*/}
      {/*  innerAngle={0}*/}
      {/*  outerAngle={90}*/}
      {/*  intensity={25000}*/}
      {/*/>*/}


    </ViroARScene>

  );
};

const Rally = () => {
  return (
    <View style={{ flex: 1 }}>
      <ViroARSceneNavigator
        // hdrEnabled={false}
        // bloomThreshold={false}
        // bloomEnabled={false}

        initialScene={{ scene: RallyScene }} // Define la escena inicial
        style={{ flex: 1 }}
      />
    </View>
  );
};

// Definición de materiales
ViroMaterials.createMaterials({
  lamber: {
    diffuseTexture: require('../../assets/images/texture.jpg'),
    lightingModel: "Lambert",
    bloomThreshold: 0.0,
    shininess: 10,
    diffuseColor: "#FFFFFF",
    metalness: 0.5,
    roughness: 0.1,
    // blendMode:'Add'
  },

  glowEffect: {
    diffuseTexture: require('../../assets/images/texture2.png'),
    // blendMode: "Add",
    lightingModel: "Phong",
    diffuseColor: "#FFFFFF",
    intensity: 0.5,
  },

  phong: {
    // diffuseTexture: require('../../assets/images/texture2.png'),
    lightingModel: "Phong",
    bloomThreshold: 0.0,
    diffuseColor: "rgba(138, 221, 45, 0.05)",
    blendMode: 'Add',
    diffuseIntensity: 0.1,
  },
  bliin: {
    diffuseTexture: require('../../assets/images/texture.jpg'),
    lightingModel: "Constant",
    bloomThreshold: 1,
    fresnelExponent: 0.0,
  },
  bliin2: {
    diffuseTexture: require('../../assets/images/texture.jpg'),
    lightingModel: "Constant",
    bloomThreshold: 0.0,
    fresnelExponent: 0.0,
  },
  bliin3: {
    diffuseTexture: require('../../assets/images/texture.jpg'),
    lightingModel: "Phong",
    bloomThreshold: 0.0,
    fresnelExponent: 0.0,
  },
});

export default Rally;

const styles = StyleSheet.create({});
