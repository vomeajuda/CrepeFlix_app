import React, { useState, useEffect } from 'react';
import { TextInput, Button, Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [serverIp, setServerIp] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(true);

  const connectToServer = () => {
    const socketUrl = `ws://${serverIp}:8090`;
    const socketConnection = new WebSocket(socketUrl);

    socketConnection.onopen = () => {
      console.log('WebSocket connection established');
      setIsModalVisible(false); // Close the modal only on successful connection
    };

    socketConnection.onmessage = (event) => {
      let messageData = event.data;

      if (messageData instanceof ArrayBuffer) {
        const decoder = new TextDecoder('utf-8');
        messageData = decoder.decode(messageData);
      }

      console.log('Received message: ', messageData);

      try {
        if (typeof messageData === 'string' && messageData.trim().startsWith('{') && messageData.trim().endsWith('}')) {
          const parsedData = JSON.parse(messageData);

          if (parsedData.forwardedToCozinha) {
            const formattedMessage = `Nome: ${parsedData.Nome} \nProdutos: ${parsedData.Produtos}`;
            setReceivedMessages((prevMessages) => [...prevMessages, formattedMessage]);
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
      alert('Falha ao conectar, cheque o ip.');
      setIsModalVisible(true); // Reopen the modal on connection error
    };

    socketConnection.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setSocket(socketConnection);
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>IP do Servidor</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira o IP do servidor"
            value={serverIp}
            onChangeText={setServerIp}
          />
          <Button
            title="Connect"
            onPress={() => {
              connectToServer();
            }}
          />
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    width: '80%',
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
