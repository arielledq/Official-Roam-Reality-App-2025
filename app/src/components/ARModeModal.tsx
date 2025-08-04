// import React, {useState, useRef, useEffect, useContext} from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Linking,
//   Alert,
//   Platform,
//   Dimensions,
//   StyleSheet,
//   FlatList,
//   ScrollView
// } from "react-native";
// import RNFS from "react-native-fs";
//
// import Share from "react-native-share";
// import ReactNativeModal from "react-native-modal";
//
// import AppButton from "./button";
// import theme from "assets/theme";
// import { FontFamily, FontSizes } from "util/FontUtils";
//
// import FullScreenLoadingSpinner from "./FullScreenLoadingSpinner";
//
// import ArrowIcon from "assets/svg/ArrowIcon.tsx";
// import FastImage from "react-native-fast-image";
// import styles from "screens/home/styles";
// import Images from "assets/images";
// import {Dropdown} from "react-native-element-dropdown";
// import Icon from "components/Icon";
// import useStyles from "screens/editProfile/styles.ts";
// import AppDropdown from "components/Dropdown";
// import {LockIcon} from "assets/svg";
// import RefreshIcon from "assets/svg/Refresh.tsx";
// import {MODES, ModeType} from "../constants"
// import PinIcon from "assets/svg/Pin.tsx";
// import WalkingIcon from "assets/svg/Walking.tsx";
// import pinRosa from "assets/Icons/pinrosa.svg";
// import {getNextStar as getNextStarApi} from "network";
// import {GeolocationContext} from "GeolocationProvider";
// // CAMBIO CLAVE: Agregada la propiedad 'description' a cada patrocinador.
// // const SPONSORS_DATA = [
// //   { id: '1', name: 'Coca-Cola', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/coca_cola_logo_icon_147253.png' }, description: 'Disfruta de la chispa de la vida con Coca-Cola. Refresca tus momentos.' },
// //   { id: '2', name: 'Red Bull', logo: { uri: 'https://cdn.icon-icons.com/icons2/2386/PNG/512/red_bull_logo_icon_145453.png' }, description: 'Red Bull te da aaalas. Despierta tu potencial con nuestra bebida energética.' },
// //   { id: '3', name: 'Shell', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/shell_icon_147252.png' }, description: 'Shell: Energía para tus viajes. Calidad y confianza en cada carga.' },
// //   { id: '4', name: 'KFC', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/kfc_logo_icon_147251.png' }, description: 'KFC: El sabor original del pollo frito. Una tradición que deleita.' },
// //   { id: '5', name: 'Pepsi', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/pepsi_logo_icon_147250.png' }, description: 'Pepsi: Elige tu propio ritmo. El sabor que desafía lo convencional.' },
// //   { id: '6', name: 'McDonalds', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/mcdonalds_logo_icon_147249.png' }, description: 'McDonalds: Un clásico para todos. Hamburguesas, papas y momentos felices.' },
// //   { id: '7', name: 'Adidas', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/adidas_logo_icon_147248.png' }, description: 'Adidas: Imposible es nada. Ropa y calzado deportivo para tu mejor rendimiento.' },
// //   { id: '8', name: 'Nike', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/nike_logo_icon_147247.png' }, description: 'Nike: Just Do It. Innovación y estilo en cada paso.' },
// //   { id: '9', name: 'Samsung', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/samsung_logo_icon_147246.png' }, description: 'Samsung: Desbloquea tu mundo. Tecnología que transforma la experiencia.' },
// //   { id: '10', name: 'Apple', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/apple_logo_icon_147245.png' }, description: 'Apple: Piensa diferente. Diseño y simplicidad que inspiran.' },
// //   { id: '11', name: 'Microsoft', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/microsoft_logo_icon_147244.png' }, description: 'Microsoft: Potenciando a cada persona y organización. Software que impulsa el futuro.' },
// //   { id: '12', name: 'Google', logo: { uri: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/google_logo_icon_147243.png' }, description: 'Google: Organizando la información mundial. Innovación al alcance de tu mano.' },
// // ];
// // const mapAllDestinationsToSponsors = (destinations = []) => {
// //   return destinations.map(destination => ({
// //     id: destination.id.toString(),
// //     location: destination.name,
// //     backgroundImage: {
// //       uri: destination.image,
// //     },
// //     hunts: 5,  // Valor estático
// //     miles: 100, // Valor estático
// //     challenges: (destination.star_ar_sites || [])
// //         .filter(site => site.pin_challenge && site.sponsored)
// //         .map(site => ({
// //           id: site.id.toString(),
// //           title: site.name,
// //           points: site.pin_challenge.points || 0,
// //           captures: { current: 0, total: 100 }, // Placeholder
// //           cooldownHours: 0,
// //           logo: {
// //             uri: site.pin_challenge.sponsored.image || '',
// //           },
// //         })),
// //   }));
// // };
// // const SPONSORS_DATA = [
// //   {
// //     id: '1',
// //     location: 'Maracas Beach',
// //     backgroundImage: {
// //       uri: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/ed/a4/da/maracas-beach.jpg?w=900&h=500&s=1',
// //     },
// //     hunts: 5,
// //     miles: 1.2,
// //     challenges: [
// //       {
// //         id: '1-1',
// //         title: 'Hurricane Reef',
// //         points: 3,
// //         captures: { current: 4, total: 12 },
// //         cooldownHours: 0,
// //         logo: {
// //           uri: 'https://caribbrewery.com/wp-content/uploads/2021/10/272044718_481837386793374_8756052260638106341_n-scaled.jpeg',
// //         },
// //       },
// //       {
// //         id: '1-2',
// //         title: 'TRIBE',
// //         points: 5,
// //         captures: { current: 3, total: 5 },
// //         cooldownHours: 4,
// //         logo: {
// //           uri: 'https://t4.ftcdn.net/jpg/02/82/43/55/360_F_282435535_Yzi6J1yZYdZlM3R2KOHhSZpNTqXvuVtJ.jpg',
// //         },
// //       },
// //     ],
// //   },
// //   {
// //     id: '2',
// //     location: 'Santa Monica Pier',
// //     backgroundImage: {
// //       uri: 'https://www.exp1.com/wp-content/uploads/sites/7/2020/08/Santa-Monica-Pier-e1597077705511.jpg',
// //     },
// //     hunts: 5,
// //     miles: 1.2,
// //     challenges: [
// //       {
// //         id: '2-1',
// //         title: 'Ocean Warriors',
// //         points: 4,
// //         captures: { current: 2, total: 10 },
// //         cooldownHours: 1,
// //         logo: {
// //           uri: 'https://m.media-amazon.com/images/S/pv-target-images/5d6735df1a7a0820627a1704f8b1bc8b845c4c88e1942f292009272e7739bdd4.jpg',
// //         },
// //       },
// //       {
// //         id: '2-2',
// //         title: 'Pier Legends',
// //         points: 6,
// //         captures: { current: 1, total: 8 },
// //         cooldownHours: 2,
// //         logo: {
// //           uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Santa_Monica_Pier_logo.png/800px-Santa_Monica_Pier_logo.png',
// //         },
// //       },
// //     ],
// //   },
// //   {
// //     id: '3',
// //     location: 'Copacabana',
// //     backgroundImage: {
// //       uri: 'https://cdn.britannica.com/23/94423-050-DF0A1C51/Copacabana-beach-Rio-de-Janeiro-Brazil.jpg',
// //     },
// //     hunts: 3,
// //     miles: 0.8,
// //     challenges: [
// //       {
// //         id: '3-1',
// //         title: 'Samba Clash',
// //         points: 7,
// //         captures: { current: 0, total: 5 },
// //         cooldownHours: 3,
// //         logo: {
// //           uri: 'https://static.vecteezy.com/system/resources/previews/019/520/842/original/carnival-mask-icon-free-vector.jpg',
// //         },
// //       },
// //       {
// //         id: '3-2',
// //         title: 'Beach Blitz',
// //         points: 4,
// //         captures: { current: 2, total: 6 },
// //         cooldownHours: 0,
// //         logo: {
// //           uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Rio_Copacabana_Beach_2010.JPG/800px-Rio_Copacabana_Beach_2010.JPG',
// //         },
// //       },
// //       {
// //         id: '3-3',
// //         title: 'Sunset Charge',
// //         points: 6,
// //         captures: { current: 1, total: 4 },
// //         cooldownHours: 1,
// //         logo: {
// //           uri: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
// //         },
// //       },
// //       {
// //         id: '3-4',
// //         title: 'Rio Showdown',
// //         points: 5,
// //         captures: { current: 3, total: 7 },
// //         cooldownHours: 2,
// //         logo: {
// //           uri: 'https://cdn-icons-png.flaticon.com/512/168/168885.png',
// //         },
// //       },
// //       {
// //         id: '3-5',
// //         title: 'Carnival Clash',
// //         points: 8,
// //         captures: { current: 0, total: 10 },
// //         cooldownHours: 4,
// //         logo: {
// //           uri: 'https://cdn-icons-png.flaticon.com/512/727/727803.png',
// //         },
// //       },
// //     ],
// //   },
// // ];
// //
// // const SITE = SPONSORS_DATA.map(site => ({
// //   label: site.location,
// //   value: site.id,
// // }));
// //
//
// interface ShareToSocialsModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   onPointsGranted: (selectedSSNN: string, grantSocialPointsHandler: (selectedSSNN: string) => void) => void;
//   fileUri?: string | undefined;
//   fileExt?: string | undefined;
//   sponsor?: { description: string; tags: string; id?: string } | undefined;
//   isMemory?: boolean;
//   selectedDestination? : []
// }
//
// const ARModeModal: React.FC<ShareToSocialsModalProps> = ({
//                                                                    isVisible = false,
//                                                                    onClose,
//                                                                    onPointsGranted,
//                                                                    fileUri,
//                                                                    fileExt,
//                                                                    sponsor,
//                                                                    isMemory = false,
//                                                                     selectedDestination,
//                                                                  }) => {
//   const [showChooseIGPostType, setShowChooseIGPostType] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [arMode, setARMode] = useState(false);
//   const [ScanMode, setScanMode] = useState(false);
//   const [huntMode, setHuntMode] = useState(false);
//   const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
//   const [selectedDropdownValue, setSelectedDropdownValue] = useState<number | null>(null);
//   const [expandedSites, setExpandedSites] = useState<string[]>([]);
//   const [selectedChallengeData, setSelectedChallengeData] = useState(null);
//
//   const [updatedSponsorsData, setUpdatedSponsorsData] = useState([]);
//   const { userLocation } = useContext(GeolocationContext);
//   const [idSiteGeo, setIdSiteGeo] = useState()
//   const [dataGeoStar, setDataGeoStar] = useState({})
//
//
//   console.log("selectedChallengeData", selectedChallengeData);
//   const destinationData = selectedDestination
//   console.log("selectedDestinationAAAAAAAA",selectedDestination);
//   const [mode, setMode] = useState<ModeType>(MODES.AR);
//   const MODE_TITLES: Record<ModeType, string> = {
//     ar: "AR MODE",
//     scan: "SCAN MODE",
//     hunt: "HUNT MODE",
//     checkin: "CHECK-IN MODE",
//   };
//   const mapAllDestinationsToSponsors = (destinations = []) => {
//     return destinations.map(destination => ({
//       id: destination?.id.toString(),
//       location: destination?.name,
//       backgroundImage: { uri: destination?.image },
//       hunts: 5,
//       miles: 100,
//       challenges: (destination?.star_ar_sites || [])
//           .filter(site => site?.pin_challenge && site?.pin_challenge?.sponsored)
//           .map(site => ({
//             ...site, // 🔥 Aquí incluimos toda la data del sitio original
//             id: site?.id.toString(),
//             title: site?.name,
//             points: site?.pin_challenge?.points || 0,
//             captures: { current: 0, total: 100 },
//             cooldownHours: 0,
//             logo: { uri: site?.pin_challenge?.sponsored?.image || '' },
//           }))
//     }));
//   };
//
//   const SPONSORS_DATA = mapAllDestinationsToSponsors(destinationData);
//
//   useEffect(() => {
//     if (SPONSORS_DATA.length > 0 && selectedSponsors.length === 0 && !selectedDropdownValue) {
//       const allIds = SPONSORS_DATA.map(sponsor => sponsor.id);
//       setSelectedSponsors(allIds);
//     }
//   }, [SPONSORS_DATA]);
//   const selectAllSponsors = () => {
//     const allIds = SPONSORS_DATA.map(sponsorItem => sponsorItem.id);
//     setSelectedSponsors(allIds);
//   };
//   const SITE = [
//     { label: 'All Sponsors', value: 'ALL' },
//     ...SPONSORS_DATA.map(site => ({
//       label: site.location,
//       value: site.id,
//     })),
//   ];
//
//   const currentSponsors = mode === MODES.HUNT ? updatedSponsorsData : SPONSORS_DATA;
//
//   const filteredSponsors = (() => {
//     if (selectedDropdownValue) {
//       return currentSponsors.filter(sponsor => sponsor.id === selectedDropdownValue.toString());
//     } else if (selectedSponsors.length > 0) {
//       return currentSponsors.filter(sponsor => selectedSponsors.includes(sponsor.id));
//     } else {
//       return currentSponsors;
//     }
//   })();
//   useEffect(() => {
//     if (sponsor?.id) {
//       setSelectedSponsors([sponsor.id]);
//       setSelectedDropdownValue(parseInt(sponsor.id));
//     } else {
//       setSelectedSponsors([]);
//       setSelectedDropdownValue(null);
//     }
//   }, [sponsor]);
//
//
//   const toggleSiteAccordion = (siteId: string) => {
//     setExpandedSites(prev =>
//         prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
//     );
//   };
//
//
//
//   const isSelected = (sponsorId: string) => selectedSponsors.includes(sponsorId);
//
//   useEffect(() => {
//     if (isVisible) {
//       setMode(MODES.AR); // Reiniciar al modo AR cuando se abre el modal
//     }
//   }, [isVisible]);
//
//   if (!isVisible) return null;
//
//
//   useEffect(() => {
//     const fetchNextStarData = async () => {
//       if (mode === MODES.HUNT && userLocation) {
//         const allSponsors = mapAllDestinationsToSponsors(destinationData);
//
//         const updatedData = await Promise.all(
//             allSponsors.map(async sponsor => {
//               const siteWithUpdates = await Promise.all(
//                   sponsor.challenges.map(async challenge => {
//                     const params = {
//                       geo_site_id: challenge.id,
//                       lat: userLocation.latitude,
//                       lon: userLocation.longitude,
//                     };
//
//                     try {
//                       const response = await getNextStarApi(params);
//                       if (response?.id) {
//                         return {
//                           ...challenge,
//                           starData: response, // agregar la estrella si existe
//                         };
//                       }
//                     } catch (e) {
//                       console.error("Error en getNextStar", e);
//                     }
//                     return challenge;
//                   })
//               );
//
//               return {
//                 ...sponsor,
//                 challenges: siteWithUpdates,
//               };
//             })
//         );
//
//         console.log("⭐ Updated sponsors with stars:", updatedData);
//         setUpdatedSponsorsData(updatedData);
//       }
//     };
//
//     fetchNextStarData();
//   }, [mode]);
//
//   const ChooseARMode = (
//       <>
//         <Text
//             style={{ fontSize: FontSizes.S20, fontWeight: "bold", color: '#fff'}}
//         >
//           {MODE_TITLES[mode]}
//         </Text>
//         {mode === 'ar' && (
//             <>
//               <AppButton
//                   buttonStyle={{ width: '100%', }}
//                   customColors={["#B816E0", "#8516e0", "#1158F4",]}
//                   onPress={() => setMode('checkin')}
//                   titleStyle={{width: '100%', fontWeight:'700',}}
//                   title={'Check-in Mode'}
//               />
//               <AppButton
//                   buttonStyle={{ height: 45, width: '100%' }}
//                   titleStyle={{width: '100%', fontWeight:'700'}}
//                   onPress={() => setMode('scan') }
//                   customColors={["#B816E0", "#8516e0", "#1158F4",]}
//                   title={'Scan Mode'}
//               />
//
//               <AppButton
//                   buttonStyle={{ width: '100%', }}
//                   customColors={["#B816E0", "#8516e0", "#1158F4",]}
//                   onPress={() => setMode('hunt')}
//                   titleStyle={{width: '100%', fontWeight:'700',}}
//                   title={'Hunt Mode'}
//               />
//
//               <AppButton
//                   onPress={()=>{ setARMode(true); setHuntMode(false); setScanMode(false); onClose;}}
//                   customColors={["transparent", "transparent"]}
//                   titleStyle={{color: 'red'}}
//                   title={"Cancel"}
//               />
//             </>
//         )}
//         {mode === 'scan' && (
//             <>
//               <View style={{ maxHeight: '60%', width: '100%' }}>
//
//                 <View style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
//
//                   <View style={{display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'space-between', width: '100%'}}>
//                     <View style={{flex: 1, zIndex:1,display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
//                       <Image source={Images.Instagram} style={{ height: 60, width: 60 }} />
//                       <AppDropdown
//                           data={SITE}
//                           maxHeight={300}
//                           labelField="label"
//                           valueField="value"
//                           selectedTextStyle={{fontSize:14}}
//                           placeholder="Select Sponsor"
//                           activeColor = '#3D3E58'
//                           value={selectedDropdownValue}
//                           containerStyle={{flex: 1, }}
//                           onChange={(item) => {
//                             if (item.value === 'ALL') {
//                               selectAllSponsors();
//                               setSelectedDropdownValue(null); // ← esto es importante
//                             } else {
//                               setSelectedDropdownValue(item.value);
//                               setSelectedSponsors([item.value.toString()]);
//                             }
//                           }}
//                       />
//                     </View>
//                   </View>
//                   <View style={{display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'space-between', width: '100%', marginTop: 25 }}>
//                     <Text style={{ fontSize: 18, fontWeight: "bold", color: 'white'}}>
//                       Hidden Gems Available
//                     </Text>
//                     <AppButton
//                         customColors={['#222','#222']}
//                         containerStyle={localStyles.selectAllButtonContainer}
//                         buttonStyle={localStyles.selectAllButton}
//                         titleStyle={localStyles.selectAllButtonText}
//                         onPress={selectAllSponsors}
//                         title={'Select All'}
//                         icon={<RefreshIcon />}
//
//                     />
//                   </View>
//
//                 </View>
//                 <View style={{display:'flex', height:'100%', marginTop:15}}>
//                   <ScrollView showsVerticalScrollIndicator>
//                     {filteredSponsors.map(site => {
//                       const isExpanded = expandedSites.includes(site.id);
//                       return (
//                           <View key={site.id} style={{ marginBottom: 15 }}>
//                             {/* Accordion Header */}
//                             <TouchableOpacity
//                                 onPress={() => toggleSiteAccordion(site.id)}
//                                 style={{
//                                   backgroundColor: '#2C2D3F',
//                                   borderRadius: 10,
//                                   padding: 12,
//                                   flexDirection: 'row',
//                                   alignItems: 'center',
//                                 }}
//                             >
//                               <Image
//                                   source={site.backgroundImage}
//                                   style={{ width: 50, height: 50, borderRadius: 6, marginRight: 10 }}
//                               />
//                               <View style={{ flex: 1 }}>
//                                 <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
//                                   {site.location}
//                                 </Text>
//                                 <View style={{ flexDirection: 'row', gap: 10, }}>
//                                   <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//                                     <Icon name={'pinrosa'} family={'custom'} size={20} />
//                                     <Text style={{ color: '#C881F0', fontSize: 12, alignItems:'center', }}> {site.hunts} Gems </Text>
//                                   </View>
//                                   <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//                                     <Icon name={'walkingIcon'} color="#C881F0" family={'custom'} size={20}/>
//                                     <Text style={{ color: '#C881F0', fontSize: 12, alignSelf:'center', }}>
//                                     {site.miles} Miles
//                                     </Text>
//                                   </View>
//                                 </View>
//                               </View>
//                               <Text style={{ color: 'white', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</Text>
//                             </TouchableOpacity>
//
//                             {/* Accordion Body */}
//                             {isExpanded && (
//                                 <View style={{ marginTop: 10 }}>
//                                   {site.challenges.map((challenge) => (
//                                       <TouchableOpacity
//                                           key={challenge.id}
//                                           activeOpacity={0.8}
//                                           disabled={mode !== MODES.SCAN}
//                                           onPress={() => {
//                                             if (mode === MODES.SCAN) {
//                                               const challengeData = {
//                                                 lat_long: challenge.lat_long,
//                                                 challenge_requirement: challenge.pin_challenge?.challenge_requirement,
//                                                 challenge_id: challenge.id,
//                                                 model_file: challenge.pin_challenge?.model_file,
//                                                 parameters: challenge.pin_challenge?.parameters,
//                                                 points: challenge.pin_challenge?.points,
//                                               };
//                                               setSelectedChallengeData(challengeData);
//                                               onClose();
//                                               onPointsGranted("scan", () => challengeData);
//                                             }
//                                           }}
//                                           style={{
//                                             backgroundColor: '#1E1F30',
//                                             borderRadius: 10,
//                                             flexDirection: 'row',
//                                             alignItems: 'center',
//                                             padding: 12,
//                                             marginBottom: 10,
//                                             opacity: mode === MODES.SCAN ? 1 : 0.5,
//                                           }}
//                                       >
//                                         <View
//                                             style={{
//                                               backgroundColor: '#7A32F4',
//                                               borderRadius: 5,
//                                               padding: 6,
//                                               alignItems: 'center',
//                                               justifyContent: 'center',
//                                               width: 50,
//                                             }}
//                                         >
//                                           <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
//                                             {challenge.points}
//                                           </Text>
//                                           <Text style={{ color: 'white', fontSize: 10 }}>Points</Text>
//                                         </View>
//                                         <View style={{ flex: 1, marginLeft: 10 }}>
//                                           <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
//                                             {challenge.title}
//                                           </Text>
//                                           <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//                                             <Text style={{ color: '#C881F0', fontSize: 12 }}>
//                                               {challenge.captures.current}/{challenge.captures.total} Captures
//                                             </Text>
//                                             <Text style={{ color: '#C881F0', fontSize: 12, marginLeft: 10 }}>
//                                               ⏱ {challenge.cooldownHours}Hrs Cooldown
//                                             </Text>
//                                           </View>
//                                         </View>
//                                         <Image
//                                             source={challenge.logo}
//                                             style={{ width: 40, height: 40, borderRadius: 20 }}
//                                         />
//                                       </TouchableOpacity>
//                                   ))}
//                                 </View>
//                             )}
//                           </View>
//                       );
//                     })}
//                   </ScrollView>
//                 </View>
//
//
//                 <View style={{width: '100%', alignItems: 'center', marginTop: 20}}>
//                   <AppButton
//                       onPress={onClose}
//                       customColors={["transparent", "transparent"]}
//                       titleStyle={{color: 'red', marginTop: 10}}
//                       title={"Cancel"}
//                   />
//                 </View>
//
//               </View>
//             </>
//         )}
//
//         {mode === 'hunt' && (
//             <>
//               <View style={{ maxHeight: '60%', width: '100%' }}>
//
//                 <View style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
//
//                   <View style={{display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'space-between', width: '100%'}}>
//                     <View style={{flex: 1, zIndex:1,display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
//                       <Image source={Images.Instagram} style={{ height: 60, width: 60 }} />
//                       <AppDropdown
//                           data={SITE}
//                           maxHeight={300}
//                           labelField="label"
//                           valueField="value"
//                           selectedTextStyle={{fontSize:14}}
//                           placeholder="Select Sponsor"
//                           activeColor = '#3D3E58'
//                           value={selectedDropdownValue}
//                           containerStyle={{flex: 1, }}
//                           onChange={(item) => {
//                             if (item.value === 'ALL') {
//                               selectAllSponsors();
//                               setSelectedDropdownValue(null); // ← esto es importante
//                             } else {
//                               setSelectedDropdownValue(item.value);
//                               setSelectedSponsors([item.value.toString()]);
//                             }
//                           }}
//                       />
//                     </View>
//                   </View>
//                   <View style={{display: 'flex', flexDirection:'row', alignItems:'center', justifyContent: 'space-between', width: '100%', marginTop: 25 }}>
//                     <Text style={{ fontSize: 18, fontWeight: "bold", color: 'white', }}>
//                       Hunts Available
//                     </Text>
//                     <AppButton
//                         customColors={['#222','#222']}
//                         containerStyle={localStyles.selectAllButtonContainer}
//                         buttonStyle={localStyles.selectAllButton}
//                         titleStyle={localStyles.selectAllButtonText}
//                         onPress={selectAllSponsors}
//                         title={'Select All'}
//                         icon={<RefreshIcon />}
//
//                     />
//                   </View>
//
//                 </View>
//                 <View style={{display:'flex', height:'100%', marginTop:15}}>
//                   <ScrollView showsVerticalScrollIndicator>
//                     {filteredSponsors.map(site => {
//                       const isExpanded = expandedSites.includes(site.id);
//                       return (
//                           <View key={site.id} style={{ marginBottom: 15 }}>
//                             {/* Accordion Header */}
//                             <TouchableOpacity
//                                 onPress={() => toggleSiteAccordion(site.id)}
//                                 style={{
//                                   backgroundColor: '#2C2D3F',
//                                   borderRadius: 10,
//                                   padding: 12,
//                                   flexDirection: 'row',
//                                   alignItems: 'center',
//                                 }}
//                             >
//                               <Image
//                                   source={site.backgroundImage}
//                                   style={{ width: 50, height: 50, borderRadius: 6, marginRight: 10 }}
//                               />
//                               <View style={{ flex: 1 }}>
//                                 <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
//                                   {site.location}
//                                 </Text>
//                                 <View style={{ flexDirection: 'row', gap: 10, }}>
//                                   <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//                                     <Icon name={'pinrosa'} family={'custom'} size={20} />
//                                     <Text style={{ color: '#C881F0', fontSize: 12, alignItems:'center', }}> {site.hunts} Hunts </Text>
//                                   </View>
//                                   <View style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
//                                     <Icon name={'walkingIcon'} color="#C881F0" family={'custom'} size={20}/>
//                                     <Text style={{ color: '#C881F0', fontSize: 12, alignSelf:'center', }}>
//                                       {site.miles} Miles
//                                     </Text>
//                                   </View>
//                                 </View>
//                               </View>
//                               <Text style={{ color: 'white', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</Text>
//                             </TouchableOpacity>
//
//                             {/* Accordion Body */}
//                             {isExpanded && (
//                                 <View style={{ marginTop: 10 }}>
//                                   {site.challenges.map((challenge) => (
//                                       <View
//                                           key={challenge.id}
//                                           style={{
//                                             backgroundColor: '#1E1F30',
//                                             borderRadius: 10,
//                                             flexDirection: 'row',
//                                             alignItems: 'center',
//                                             padding: 12,
//                                             marginBottom: 10,
//                                           }}
//                                       >
//                                         <View
//                                             style={{
//                                               backgroundColor: '#7A32F4',
//                                               borderRadius: 5,
//                                               padding: 6,
//                                               alignItems: 'center',
//                                               justifyContent: 'center',
//                                               width: 50,
//                                             }}
//                                         >
//                                           <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
//                                             {challenge.points}
//                                           </Text>
//                                           <Text style={{ color: 'white', fontSize: 10 }}>Points</Text>
//                                         </View>
//                                         <View style={{ flex: 1, marginLeft: 10 }}>
//                                           <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
//                                             {challenge.title}
//                                           </Text>
//                                           <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//                                             <Text style={{ color: '#C881F0', fontSize: 12 }}>
//                                               {challenge.captures.current}/{challenge.captures.total} Captures
//                                             </Text>
//                                             <Text style={{ color: '#C881F0', fontSize: 12, marginLeft: 10 }}>
//                                               ⏱ {challenge.cooldownHours}Hrs Cooldown
//                                             </Text>
//                                           </View>
//                                         </View>
//                                         <Image
//                                             source={challenge.logo}
//                                             style={{ width: 40, height: 40, borderRadius: 20 }}
//                                         />
//                                       </View>
//                                   ))}
//                                 </View>
//                             )}
//                           </View>
//                       );
//                     })}
//                   </ScrollView>
//                 </View>
//
//
//                 <View style={{width: '100%', alignItems: 'center', marginTop: 20}}>
//                   <AppButton
//                       onPress={onClose}
//                       customColors={["transparent", "transparent"]}
//                       titleStyle={{color: 'red', marginTop: 10}}
//                       title={"Cancel"}
//                   />
//                 </View>
//
//               </View>
//             </>
//         )}
//         {mode === 'checkin' && (
//            <>
//
//            </>
//         )}
//       </>
//   );
//
//   return (
//       <View style={{ flex: 1, position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}>
//         <ReactNativeModal isVisible={isVisible} onDismiss={onClose} onBackdropPress={onClose}>
//           <View
//               style={[
//                 sharedStyles.modalContent,
//                 { backgroundColor: theme.lightColors?.grey4 },
//               ]}
//           >
//             {ChooseARMode}
//             <FullScreenLoadingSpinner isLoading={loading} />
//           </View>
//         </ReactNativeModal>
//       </View>
//   );
// };
//
// const sharedStyles = StyleSheet.create({
//   modalContent: {
//     backgroundColor: 'transparent',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 24,
//     alignItems: "center",
//     gap: 16,
//     flex: 1,
//     maxHeight: '60%',
//   },
// });
//
// const localStyles = StyleSheet.create({
//   sponsorHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     width: '100%',
//   },
//   sponsorHeaderText: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: 'white',
//   },
//   selectAllButtonContainer: {
//     height:30,
//     minHeight: 10,
//     paddingVertical: 1,
//     paddingHorizontal: 5,
//   },
//   selectAllButton: {
//     padding: 0,
//     paddingHorizontal: 0,
//     // backgroundColor: theme.lightColors?.purple,
//     borderRadius: 15,
//   },
//   selectAllButtonText: {
//     fontSize: 10,
//     padding: 0,
//     paddingHorizontal: 0,
//     color: '#7e8493'
//   },
//   carouselRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   arrowButton: {
//     paddingHorizontal: 5,
//     paddingVertical: 5,
//   },
//   flatListContent: {
//     alignItems: 'center',
//     paddingHorizontal: 5,
//   },
//   sponsorItem: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 5,
//     borderWidth: 2,
//     borderColor: 'transparent',
//     overflow: 'hidden',
//   },
//   selectedSponsorItem: {
//     borderColor: theme.lightColors?.purple,
//   },
//   sponsorLogo: {
//     width: 50,
//     height: 50,
//     resizeMode: 'contain',
//   },
//   selectedSponsorsDescriptionContainer: {
//     marginTop: 10,
//     gap: 20,
//     width: '100%',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 8,
//   },
//   selectedSponsorDescriptionText: {
//     color: 'white',
//     fontSize: 12,
//     marginBottom: 3,
//   },
// });
//
// export default ARModeModal;
