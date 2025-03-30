import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [socket, setSocket] = useState(null);

  const socketUrl = 'ws://192.168.0.194:8090'; // Updated port to 8090

  useEffect(() => {
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

          // Ignore messages forwarded to cozinha
          if (!parsedData.forwardedToCozinha) {
            setReceivedOrders((prevOrders) => [...prevOrders, parsedData]);
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

    setSocket(socketConnection);

    return () => {
      if (socketConnection) {
        socketConnection.close();
      }
    };
  }, []);

  const handleSendToKitchen = (index) => {
    const order = receivedOrders[index];
    if (socket) {
      const orderForCozinha = { ...order, forwardedToCozinha: true };
      socket.send(JSON.stringify(orderForCozinha));
      
      setReceivedOrders((prevOrders) => prevOrders.filter((_, i) => i !== index));
    }
  };

  const handleCancelOrder = (index) => {
    setReceivedOrders((prevOrders) => prevOrders.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pedidos Recebidos:</Text>
      {receivedOrders.map((order, index) => (
        <View key={index} style={styles.orderContainer}>
          <Text style={styles.orderText}>Nome: {order.Nome}</Text>
          <Text style={styles.orderText}>Produtos: {order.Produtos.join(', ')}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSendToKitchen(index)}
            >
              <Text style={styles.buttonText}>Mandar para cozinha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(index)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderContainer: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sendButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
