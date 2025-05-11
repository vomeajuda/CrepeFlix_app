const socket = new WebSocket('ws://localhost:8090'); // Updated port to 8090

socket.onopen = () => {
  console.log('WebSocket connection established');
};

socket.onerror = (error) => {
  console.log('WebSocket error: ', error);
};

socket.onclose = () => {
  console.log('WebSocket connection closed');
};

const cart = [];
const cartElement = document.getElementById('cart');
const totalPriceElement = document.getElementById('totalPrice');
const sendOrderButton = document.getElementById('sendOrderButton');
const nameInput = document.getElementById('nameInput');

const prices = {
  "Jerry": 8.00,
  "Tom E Jerry": 8.00,
  "João Frango": 10.00,
  "Bridgadeiton": 8.00,
  "The Nutella Academy": 10.00,
  "Jerry + Tom e Jerry + Bridgadeiton": 20.00,
  "Jerry + João Frango + Bridgadeiton": 22.00,
  "Especial": 25.00
};

const updateTotalPrice = () => {
  const total = cart.reduce((sum, item) => sum + prices[item], 0);
  totalPriceElement.textContent = `Total: R$ ${total.toFixed(2)}`;
};

document.querySelectorAll('.flavor-card').forEach(card => {
  card.addEventListener('click', () => {
    const selectedFlavor = card.getAttribute('data-flavor');
    cart.push(selectedFlavor);

    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.textContent = `${selectedFlavor} - R$ ${prices[selectedFlavor].toFixed(2)}`;

    // Create a "Remove" button
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger btn-sm';
    removeButton.textContent = 'Remover';
    removeButton.addEventListener('click', () => {
      const index = cart.indexOf(selectedFlavor);
      if (index > -1) {
        cart.splice(index, 1); // Remove item from cart array
        cartElement.removeChild(listItem); // Remove item from UI
        updateTotalPrice(); // Update total price
      }
    });

    listItem.appendChild(removeButton); // Add the button to the list item
    cartElement.appendChild(listItem);
    updateTotalPrice(); // Update total price
  });
});

sendOrderButton.addEventListener('click', () => {
  const name = nameInput.value;
  if (!name) {
    alert('Insira seu nome.');
    return;
  } else if (cart.length === 0) {
    alert('Adicione um crepe ao carrinho.');
    return;
  }

  const order = { Nome: name, Produtos: cart };
  socket.send(JSON.stringify(order));
  alert('Order sent!');
  cart.length = 0; // Clear the cart
  cartElement.innerHTML = ''; // Clear the cart UI
  nameInput.value = ''; // Clear the name input
  updateTotalPrice(); // Reset total price
});
