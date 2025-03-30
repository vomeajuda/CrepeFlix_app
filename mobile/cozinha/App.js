import React, { useState, useEffect } from 'react';
import { TextInput, Button, Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]); // Changed to an array
  const [socket, setSocket] = useState(null);
  
  // WebSocket URL to your server
  const socketUrl = 'ws://192.168.0.194:8090'; // Updated port to 8090

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
    
      try {
        // Ensure the message is valid JSON before parsing
        if (typeof messageData === 'string' && messageData.trim().startsWith('{') && messageData.trim().endsWith('}')) {
          const parsedData = JSON.parse(messageData);

          // Only process messages forwarded to "cozinha"
          if (parsedData.forwardedToCozinha) {
            const formattedMessage = `Nome: ${parsedData.Nome} \nProdutos: ${parsedData.Produtos}`;
            setReceivedMessages((prevMessages) => [...prevMessages, formattedMessage]); // Append formatted message
          } else {
            console.warn('Message not intended for cozinha: ', parsedData);
          }
        } else {
          console.warn('Received non-JSON message: ', messageData);
        }
      } catch (error) {
        console.error('Error parsing JSON: ', error);
      }
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
        <View key={index} style={styles.messageContainer}>
          <Text style={styles.receivedMessage}>{msg}</Text> 
          <TouchableOpacity 
            style={styles.finishedButton} 
            onPress={() => {
              setReceivedMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
            }}
          >
            <Text style={styles.buttonText}>Concluído</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 30,
    color: 'black',
  },
  messageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  finishedButton: {
    width: '100%',
    backgroundColor: 'red',
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
