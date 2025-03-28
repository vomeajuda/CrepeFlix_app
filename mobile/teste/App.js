import React, { useState, useEffect } from 'react';
import { TextInput, Button, Text, View, StyleSheet } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]); // Changed to an array
  const [socket, setSocket] = useState(null);
  
  // WebSocket URL to your server
  const socketUrl = 'ws://192.168.0.163:8080';

  useEffect(() => {
    // Create a WebSocket connection on mount
    const socketConnection = new WebSocket(socketUrl);

    socketConnection.onopen = () => {
      console.log('WebSocket connection established');
    };

    socketConnection.onmessage = (event) => {
      let messageData = event.data;
    
      // Check if the data is an ArrayBuffer and decode it
      if (messageData instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        messageData = decoder.decode(messageData);
      }
    
      console.log('Received message: ', messageData);
      setReceivedMessages((prevMessages) => [...prevMessages, messageData]); // Append new message
    };

    socketConnection.onerror = (error) => {
      console.log('WebSocket error: ', error);
    };

    socketConnection.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setSocket(socketConnection);  // Store the socket connection for later use

    // Cleanup the WebSocket connection when the component unmounts
    return () => {
      if (socketConnection) {
        socketConnection.close();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.receivedMessage}>A preparar:</Text>
      {receivedMessages.map((msg, index) => (
        <Text key={index} style={styles.receivedMessage}>{msg}</Text> // Render all messages
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  receivedMessage: {
    marginTop: 20,
    fontSize: 40,
    color: 'black',
  },
});
