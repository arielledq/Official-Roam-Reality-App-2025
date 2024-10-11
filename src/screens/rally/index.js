import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Button, TextInput, ImageBackground } from "react-native";
import UnityView from "@azesmway/react-native-unity";
import { unzip } from 'react-native-zip-archive'
import RNFetchBlob from "rn-fetch-blob";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { getARChallenges } from "../../network";
import { handleError } from "../../util/helpers";
const { config, fs } = RNFetchBlob


const Rally = ({}) => {
  const RNFS = require('react-native-fs')
  const [threshold, setThreshold] = useState('');
  const [intensity, setIntensity] = useState('');
  const [object3dType, setObject3dType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelPath, setModelPath] = useState(null)
  const [sourcesFiles, setSourcesFiles] = useState([])
  const unityRef = useRef(null);
  const route = useRoute()
  const [challengeObj, setChallengeObj] = useState(null)
  const [progress, setProgress] = useState([0, 0, 0])
  const [sponsoredDataAll, setSponsoredDataAll] = useState([])
  const [sponsoredData, setSponsoredData] = useState([])
  let [modelOBJ, setModelOBJ] = useState(null);        // Para guardar el archivo .obj
  let [modelResource, setModelResource] = useState(null); // Para guardar el archivo .mtl
  let [modelTextures, setModelTextures] = useState([]);   // Para guardar las texturas (.jpg, .png)
  let [foldefile, setFoldefile] = useState([]);
  // const challengeObj = route?.params?.challengeObj
  const modelFile = challengeObj?.model_file

  const ARSposored = () => {
    getARChallenges()
      .then(res => {
        if (res.status == 1) {
          // console.log(" obj ===>>>> ", JSON.stringify(res.data.filter(x => x.challenge_requirement == 'PHOTO'), null, 2))

          // setSponsoredDataAll(res.data)
          const obj = res.data.filter(x => x.id == 289)
          setSponsoredData(obj)
          setChallengeObj(obj[0])
        } else {
          res.message.message = 'Error in loading Challenges.'
          handleError(res)
        }
      })
  }
  // useEffect(() => {
  //   if (sponsoredData.length > 0) {
  //     setChallengeObj(sponsoredData[0]);  // Obtener todo el challengeObj
  //   }
  // }, [sponsoredData]);
  //
  // useEffect(() => {
  //   if (challengeObj && challengeObj.model_file) {
  //     checkIfModelExist();  // Verificar model_file una vez que challengeObj esté listo
  //   }
  // }, [challengeObj]);
  //
  // useEffect(()=> {
  //   if (sponsoredData.length > 0) {
  //     setChallengeObj(sponsoredData[0])
  //   }
  //    },[sponsoredData])


  const downloadModelFile = (sourcePath, targetPath) => {
    config({
      fileCache: true,
      path: sourcePath,
    })
      .fetch('GET', modelFile)
      .progress((received, total) => {
        // console.log("progress", received / total)
        setProgress(Math.trunc(Number((received / total) * 100)))
      })
      .then(res => {
        // the temp file path
        // console.log("The file saved to ", res.path())
        unzipModelFile(res.path(), targetPath)
      })
      .catch(error => {
        console.error(error)
      })
  }

  const unzipModelFile = (sourcePath, targetPath) => {
    const charset = 'UTF-8';
    unzip(sourcePath, targetPath, charset)
      .then(path => {
        RNFS.readDir(path).then(result => {
          const sourcesArray = [];
          const texturesArray = []; // Array para almacenar texturas
          let objFile = null;
          let mtlFile = null;

          for (let i = 0; i < result.length; i++) {
            if (result[i].isFile) {
              const filePath = Platform.OS === 'android' ? `file://${result[i].path}` : result[i].path;

              if (result[i].name.includes('.vrx') || result[i].name.includes('.VRX')) {
                setObject3dType('VRX');
                setModelPath(filePath);
              } else if (result[i].name.includes('.obj') || result[i].name.includes('.OBJ')) {
                objFile = filePath; // Guardamos el archivo .obj
              } else if (result[i].name.includes('.mtl') || result[i].name.includes('.MTL')) {
                mtlFile = filePath; // Guardamos el archivo .mtl
              } else if (result[i].name.includes('.jpg') || result[i].name.includes('.JPG') ||
                result[i].name.includes('.png') || result[i].name.includes('.PNG')) {
                texturesArray.push(filePath); // Guardamos las texturas en un array
              } else if (result[i].name.includes('.glb') || result[i].name.includes('.GLB')) {
                setObject3dType('GLB');
                setModelPath(filePath);
              } else if (result[i].name.includes('.gltf') || result[i].name.includes('.GLTF')) {
                setObject3dType('GLTF');
                setModelPath(filePath);
              } else {
                sourcesArray.push({ uri: filePath });
              }
            }
          }

          // Actualizamos los estados con los archivos clasificados
          if (objFile) setModelOBJ(objFile);
          if (mtlFile) setModelResource(mtlFile);
          if (texturesArray.length > 0) setModelTextures(texturesArray);
          if (sourcesArray.length > 0) setSourcesFiles(sourcesArray);

          setFoldefile(result);
          setLoading(false);

          console.log('Contenido descomprimido:', result);
          console.log('OBJ file:', objFile);
          console.log('MTL file:', mtlFile);
          console.log('Textures:', texturesArray);
        });
      })
      .catch(err => {
        console.error('Error descomprimiendo el archivo:', err);
      });
  };

  // useEffect(() => {
  //   if (sponsoredData.length > 0) {
  //     setChallengeObj(sponsoredData[0]);  // Obtener todo ael challengeObj
  //   }
  //
  // }, [sponsoredData]);
  // console.log('SponsoredDATa', JSON.stringify(sponsoredData, null, 2));
  useEffect(() => {
    if (challengeObj && challengeObj.model_file) {
      // Aquí solo ejecutamos si challengeObj no es null
      checkIfModelExist();
    }
  }, [challengeObj]);
console.log(challengeObj)
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

  // useEffect(() => {
  //   if (challengeObj && challengeObj.model_file) {
  //     checkIfModelExist();
  //   }
  // }, [challengeObj]);
  useFocusEffect(
    useCallback(() => {
      ARSposored();
    }, [])
  );

  console.log("modelfile",modelFile)
//UNITY//

  const sendModelDataToUnity = () => {
    if (unityRef.current && modelOBJ) {
      const cleanObjFile = modelOBJ.replace('file://', '');  // Elimina el prefijo 'file://'
      const cleanMtlFile = modelResource ? modelResource.replace('file://', '') : ''; // Si existe el archivo MTL
      const textures = modelTextures ? modelTextures.map(tex => tex.replace('file://', '')) : []; // Texturas si existen

      const modelData = {
        objFile: cleanObjFile,         // Ruta al archivo OBJ sin 'file://'
        mtlFile: cleanMtlFile,         // Ruta al archivo MTL (puede ser null)
        textures: textures,            // Rutas a las texturas (puede ser un array vacío)
      };
      console.log("Enviando a Unity:", JSON.stringify(modelData));
      console.log("OBJ file path (clean):", cleanObjFile);
      if (unityRef.current) {
        console.log("unityRef Encontrado");
        unityRef.current.postMessage('Scripts', 'LoadModelFromReact', JSON.stringify(modelData));
      }else{
        console.log("unityRef NO Encontrado");
      }
    }
  };

  const sendModelDataToUnitySpawn = () => {
    if (unityRef.current && modelOBJ) {
      const cleanObjFile = modelOBJ.replace('file://', '');
      const cleanMtlFile = modelResource ? modelResource.replace('file://', '') : null;
      const textures = modelTextures ? modelTextures.map(tex => tex.replace('file://', '')) : [];

      const modelData = {
        objFile: cleanObjFile,
        mtlFile: cleanMtlFile,
        textures: textures,
      };

      console.log("Enviando a Unity:", JSON.stringify(modelData));
      unityRef.current.postMessage('Object Spawner', 'LoadModelFromReact', JSON.stringify(modelData));
    }
  };


  const sendBloomValuesToUnity = () => {
    const bloomData = {
      threshold: parseFloat(threshold),  // Captura el valor del input
      intensity: parseFloat(intensity),  // Captura el valor del input
    };
    if (unityRef.current) {
      unityRef.current.postMessage('PostProcessing', 'UpdateBloomValues', JSON.stringify(bloomData));
    } else {
      console.log("UnityView no está disponible");
    }
  };
  return (
    <ImageBackground source={require('../../assets/images/Background.png')} style={styles.background}>
      <UnityView ref={unityRef} style={styles.unityView} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Threshold"
          keyboardType="numeric"
          value={threshold}
          onChangeText={setThreshold}
        />
        <TextInput
          style={styles.input}
          placeholder="Intensity"
          keyboardType="numeric"
          value={intensity}
          onChangeText={setIntensity}
        />
        <Button title="Enviar" onPress={sendBloomValuesToUnity} />
        <Button title="Enviar" onPress={sendModelDataToUnitySpawn} />
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
    height: '60%',
    width: '100%',
  },
  inputContainer: {
    width: '80%',
    marginTop: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    paddingLeft: 8,
  },
});
