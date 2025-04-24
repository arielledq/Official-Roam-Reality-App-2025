import React, {useState, useEffect} from "react";
import {View, Text, Button, ActivityIndicator} from "react-native";
import {Request} from "./src/network/request"; // Adjust the path to your request.js
import axios from "axios";

const App = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelTokenSource, setCancelTokenSource] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching data...");

    try {
      const source = axios.CancelToken.source();
      setCancelTokenSource(source);
      const response = await Request.call({
        url: "https://jsonplaceholder.typicode.com/todos/1",
        method: "GET",
        cancelToken: source.token,
      });

      console.log("Fetch response:", response);
      if (response.status === 1) {
        setData(response);
      } else {
        setError(response);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err);
    } finally {
      console.log("Fetch finally block executed");
      setLoading(false);
      setCancelTokenSource(null);
    }
  };

  const cancelRequest = () => {
    if (cancelTokenSource) {
      console.log("Cancelling request...");
      cancelTokenSource.cancel("Request cancelled by user.");
      setCancelTokenSource(null);
      setLoading(false);
      console.log("Cancellation initiated, loading set to false");
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel("Component unmounted.");
      }
    };
  }, []);

  console.log("rendering new app component");

  return (
    <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Simple Axios Test</Text>
      {loading && <ActivityIndicator size="large" />}
      {data && <Text style={{marginBottom: 10}}>Data: {JSON.stringify(data.data)}</Text>}
      {error && (
        <Text style={{color: "red", marginBottom: 10}}>Error: {JSON.stringify(error)}</Text>
      )}
      {loading && <Button title="Cancel Request" onPress={cancelRequest} />}
      {!loading && <Button title="Fetch Data" onPress={fetchData} />}
    </View>
  );
};

export default App;
