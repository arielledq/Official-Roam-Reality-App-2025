import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Button, TextInput, Text, ImageBackground, TouchableOpacity } from "react-native";
import UnityView from "@azesmway/react-native-unity";
import { unzip } from 'react-native-zip-archive';
import Share from 'react-native-share';
import RNFetchBlob from "rn-fetch-blob";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getARChallenges } from "../../network";
import { handleError } from "../../util/helpers";
const { config, fs } = RNFetchBlob;

const Rally = ({}) => {
  const RNFS = require('react-native-fs');
  const [object3dType, setObject3dType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelPath, setModelPath] = useState(null);
  const [sourcesFiles, setSourcesFiles] = useState([]);
  const unityRef = useRef(null);
  const route = useRoute();
  const [challengeObj, setChallengeObj] = useState(null);
  const challengeParams = challengeObj?.parameters;
  const [progress, setProgress] = useState([0, 0, 0]);
  const [sponsoredData, setSponsoredData] = useState([]);
  const [fileFound, setFileFound] = useState(null);
  const [captureData, setCaptureData] = useState('');
  let [modelOBJ, setModelOBJ] = useState(null);
  let [modelResource, setModelResource] = useState(null);
  let [textureBase, setTextureBase] = useState(null);
  let [textureEmission, setTextureEmission] = useState(null);
  let [foldefile, setFoldefile] = useState([]);
  const modelFile = challengeObj?.model_file
  
  // Inicializamos los estados con valores predeterminados
  const [threshold, setThreshold] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [emissionValue, setEmissionValue] = useState(1);

  // Actualizamos los estados cuando challengeParams esté disponible
  useEffect(() => {
    if (challengeParams) {
      setThreshold(challengeParams?.bloom_threshold || 0);
      setIntensity(challengeParams?.image_opacity_value || 1);
      setPosition({
        x: challengeParams?.positionX || 0,
        y: challengeParams?.positionY || 0,
        z: challengeParams?.positionZ || 0,
      });
      setScale({
        x: challengeParams?.scale_object || 1,
        y: challengeParams?.scale_object || 1,
        z: challengeParams?.scale_object || 1,
      });
      setEmissionValue(challengeParams?.diffuse_intensity || 1);
    }
  }, [challengeParams]);

  const ARSposored = () => {
    getARChallenges()
      .then(res => {
        if (res.status === 1) {
          const obj = res.data.filter(x => x.id === 289);
          setSponsoredData(obj);
          setChallengeObj(obj[0]);
        } else {
          handleError(res);
        }
      })
      .catch(error => {
        console.error("Error en la obtención de datos: ", error);
      });
  };

  useFocusEffect(
    useCallback(() => {
      ARSposored();
    }, [])
  );

  const downloadModelFile = (sourcePath, targetPath) => {
    config({
      fileCache: true,
      path: sourcePath,
    })
      .fetch('GET', modelFile)
      .progress((received, total) => {
        setProgress(Math.trunc(Number((received / total) * 100)));
      })
      .then(res => {
        unzipModelFile(res.path(), targetPath);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const unzipModelFile = (sourcePath, targetPath) => {
    const charset = 'UTF-8';
    unzip(sourcePath, targetPath, charset)
      .then(path => {
        RNFS.readDir(path).then(result => {
          const sourcesArray = [];
          let objFile = null;
          let mtlFile = null;
          let baseTexture = null;
          let emissionTexture = null;

          result.forEach(file => {
            const filePath = Platform.OS === 'android' ? `file://${file.path}` : file.path;

            if (file.name.includes('.vrx')) {
              setObject3dType('VRX');
              setModelPath(filePath);
            } else if (file.name.includes('.obj')) {
              objFile = filePath;
            } else if (file.name.includes('.mtl')) {
              mtlFile = filePath;
            } else if (file.name.toLowerCase().includes('diffuse')) {
              baseTexture = filePath;
            } else if (file.name.toLowerCase().includes('emission')) {
              emissionTexture = filePath;
            } else if (file.name.includes('.glb')) {
              setObject3dType('GLB');
              setModelPath(filePath);
            } else if (file.name.includes('.gltf')) {
              setObject3dType('GLTF');
              setModelPath(filePath);
            } else {
              sourcesArray.push({ uri: filePath });
            }
          });

          if (objFile) setModelOBJ(objFile);
          if (mtlFile) setModelResource(mtlFile);
          if (baseTexture) setTextureBase(baseTexture);
          if (emissionTexture) setTextureEmission(emissionTexture);
          if (sourcesArray.length > 0) setSourcesFiles(sourcesArray);

          setFoldefile(result);
          setLoading(false);
        });
      })
      .catch(err => {
        console.error('Error descomprimiendo el archivo:', err);
      });
  };

  useEffect(() => {
    if (challengeObj && challengeObj.model_file) {
      checkIfModelExist();
    }
  }, [challengeObj]);

  const checkIfModelExist = () => {
    if (challengeObj && challengeObj.model_file) {
      const modelFile = challengeObj.model_file;
      let filename = modelFile.split('/').pop();
      filename = filename.split('?')[0];
      const withoutExtFilename = filename.split('.')[0];
      const sourcePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${withoutExtFilename}`;

      RNFS.exists(sourcePath)
        .then(exists => {
          if (exists) {
            unzipModelFile(sourcePath, targetPath);
          } else {
            downloadModelFile(sourcePath, targetPath);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const sendModelDataToUnitySpawn = () => {

    if (unityRef.current && modelOBJ) {
      const modelData = {
        objFile: modelOBJ.replace('file://', ''),
        mtlFile: modelResource ? modelResource.replace('file://', '') : null,
        textureBase: textureBase ? textureBase.replace('file://', '') : '',
        textureEmission: textureEmission ? textureEmission.replace('file://', '') : '',
        position: {
          x: parseFloat(position.x) || 0,
          y: parseFloat(position.y) || 0,
          z: parseFloat(position.z) || 0,
        },
        scale: {
          x: parseFloat(scale.x) || 1,
          y: parseFloat(scale.y) || 1,
          z: parseFloat(scale.z) || 1,
        },
        rotation: {
          x: parseFloat(rotation.x) || 0,
          y: parseFloat(rotation.y) || 0,
          z: parseFloat(rotation.z) || 0,
        },
        emissionIntensity: parseFloat(emissionValue) || 0,
      };

      console.log("Enviando a Unity:", JSON.stringify(modelData));
      unityRef.current.postMessage('OBJImport', 'LoadModelFromReact', JSON.stringify(modelData));
    }else {console.log("No encontrado")
    }

  };

  const sendBloomValuesToUnity = () => {
    const bloomData = {
      threshold: parseFloat(threshold),  // Captura el valor del input
      intensity: parseFloat(intensity),  // Captura el valor del input
    };
    if (unityRef.current) {
      unityRef.current.postMessage('PosProcessing', 'UpdateBloomValues', JSON.stringify(bloomData));
    } else {
      console.log("UnityView no está disponible");
    }
    console.log('BloomValues:', bloomData);
  };

  const captureScreenshot = () => {
    if (unityRef.current) {
      unityRef.current.postMessage('ScreenCapture', 'CaptureScreenshotFromReact', '');

      const path = "/storage/emulated/0/Android/data/com.roam_reality/files/";
      RNFS.readDir(path)
        .then(files => {
          const foundFile = files.find(file => file.isFile() && file.name.includes(".png"));
          if (foundFile) {
            setFileFound(foundFile.path);
            setCaptureData(foundFile.path);
          }
        })
        .catch(error => {
          console.error("Error al leer el directorio:", error);
        });
    }
  };

  const shareScreenshot = async () => {
    if (!fileFound) {
      console.log('Primero captura una imagen antes de compartir.');
      return;
    }

    try {
      const shareOptions = {
        title: 'Compartir captura',
        url: `file://${fileFound}`,
        type: 'image/png',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/Background.png')} style={styles.background}>
      <UnityView ref={unityRef} style={styles.unityView} />

      <View style={styles.inputContainer}>
        <Button title="Enviar Bloom" onPress={sendBloomValuesToUnity} />
        <Button title="Capturar Pantalla" onPress={captureScreenshot} />
        <TouchableOpacity style={styles.shareButton} onPress={shareScreenshot}>
          <Text style={styles.shareButtonText}>Compartir Captura</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <TextInput
            style={styles.inputRow}
            placeholder="Rotation X"
            keyboardType="numeric"
            value={(rotation.x)}
            onChangeText={(value) => setRotation({ ...rotation, x: parseFloat(value) })}
          />
          <TextInput
            style={styles.inputRow}
            placeholder="Rotation Y"
            keyboardType="numeric"
            value={(rotation.y)}
            onChangeText={(value) => setRotation({ ...rotation, y: parseFloat(value) })}
          />
          <TextInput
            style={styles.inputRow}
            placeholder="Rotation Z"
            keyboardType="numeric"
            value={(rotation.z)}
            onChangeText={(value) => setRotation({ ...rotation, z: parseFloat(value) })}
          />
        </View>
        <View style={styles.row}>
          <Button title="Enviar Modelo a Unity" onPress={sendModelDataToUnitySpawn} />
        </View>
        <View style={{height:80}}></View>
      </View>
    </ImageBackground>
  );
};

export default Rally;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  unityView: {
    borderRadius: 50,
    marginHorizontal: 20,
    flex:1,
    width: '100%',
  },
  inputContainer: {
    width: '80%',
    marginTop: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputRow: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: 'auto',
    marginBottom: 10,
    paddingLeft: 8,
  },
});
