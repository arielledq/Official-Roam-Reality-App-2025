import React, {useEffect, useState} from 'react'
import { StyleSheet, Text, View } from 'react-native'
// import MapboxGL from '@rnmapbox/maps';



// MapboxGL.setAccessToken("pk.eyJ1IjoiaGJpdHRhcjIiLCJhIjoiY20yMHA5ajVrMGJ0bDJsb2oyeWkxZTlvbyJ9.AMxq1QZvEvEnydL_LIZnxw");


const Rally = () => {
  const [route, setRoute] = useState(null);
  //
  // // Define your start and end points
  // const origin = [-74.0060, 40.7128]; // New York City coordinates
  // const destination = [-73.935242, 40.730610]; // Another point in NYC
  //
  // useEffect(() => {
  //   // Fetch route data from Mapbox Directions API
  //   fetch(
  //     `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.join(',')};${destination.join(',')}?geometries=geojson&steps=true&access_token=pk.eyJ1IjoiaGJpdHRhcjIiLCJhIjoiY20yMHA5ajVrMGJ0bDJsb2oyeWkxZTlvbyJ9.AMxq1QZvEvEnydL_LIZnxw`
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Route Coordinates:", data.routes[0].geometry.coordinates);
  //       if (data.routes.length) {
  //         // Set the route to a valid GeoJSON format
  //         const routeLine = {
  //           type: 'Feature',
  //           geometry: data.routes[0].geometry,
  //         };
  //         setRoute(routeLine);
  //       }
  //     })
  //     .catch((error) => console.error(error));
  // }, []);
  return (
    <View style={styles.page}>
      {/*<MapboxGL.MapView style={styles.map}>*/}
      {/*  <MapboxGL.Camera*/}
      {/*    zoomLevel={15}*/}
      {/*    centerCoordinate={origin}*/}
      {/*    pitch={60} // Sets the 3D pitch angle*/}
      {/*    animationMode="flyTo"*/}
      {/*    animationDuration={4000}*/}
      {/*  />*/}

      {/*  /!* Origin and Destination Markers *!/*/}
      {/*  <MapboxGL.PointAnnotation id="origin" coordinate={origin} />*/}
      {/*  <MapboxGL.PointAnnotation id="destination" coordinate={destination} />*/}

      {/*  /!* Display Route if Available *!/*/}
      {/*  {route && (*/}
      {/*    <MapboxGL.ShapeSource id="routeSource" shape={route}>*/}
      {/*      <MapboxGL.LineLayer*/}
      {/*        id="routeLayer"*/}
      {/*        style={{*/}
      {/*          lineColor: '#812fac',*/}
      {/*          lineWidth: 10,*/}
      {/*          lineJoin: 'round',*/}
      {/*          lineCap: 'round',*/}
      {/*        }}*/}
      {/*      />*/}
      {/*    </MapboxGL.ShapeSource>*/}
      {/*  )}*/}
      {/*</MapboxGL.MapView>*/}
    </View>
  )
}

export default Rally


const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
