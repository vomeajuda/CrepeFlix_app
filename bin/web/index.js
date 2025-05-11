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

const descriptions = {
  "Jerry": "Esse piranho é o melhor crepe de queijo muçarela que já provei.",
  "Tom E Jerry": "A duplinha que se acha, presunto e queijo?? Delicioso até demais.",
  "João Frango": "Vou nem falar desse porpeta, recheado demais com frango e requeijão cremoso.",
  "Bridgadeiton": "Quem ele pensa que é para ser tão bom assim, brigadeiro melhore.",
  "The Nutella Academy": "Até parece que essa nutella merece a fama que tem, só porque é ridiculamente gostosa, quem liga pra todo esse delicioso chocolate com avelã.",
  "Especial": "Aqui você é a estrela, monte seu mean trio perfeito escolhendo qualquer um dos recheios."
};

const updateTotalPrice = () => {
  const total = cart.reduce((sum, item) => {
    const basePrice = prices[item.flavor] || 0;
    const additionalPrice = item.ingredients.reduce((ingredientSum, ingredient) => {
      return ingredientSum + (ingredient === "M&Ms" ? 3.00 : 2.00); // R$ 3,00 for M&Ms, R$ 2,00 for others
    }, 0);
    return sum + basePrice + additionalPrice;
  }, 0);
  totalPriceElement.textContent = `Total: R$ ${total.toFixed(2)}`;
};

let selectedFlavor = null;

const ingredientOptions = {
  salgados: [
    { value: "Calabresa", label: "Calabresa: R$ 2,00" },
    { value: "Bacon", label: "Bacon: R$ 2,00" }
  ],
  doces: [
    { value: "Kit Kat", label: "Kit Kat: R$ 2,00" },
    { value: "M&Ms", label: "M&Ms: R$ 3,00" },
    { value: "Cobertura de Chocolate", label: "Cobertura de Chocolate: R$ 2,00" }
  ],
  combos: []
};

document.querySelectorAll('.flavor-card').forEach(card => {
  card.addEventListener('click', () => {
    selectedFlavor = card.getAttribute('data-flavor');
    const category = card.closest('.tab-pane').id;
    const description = descriptions[selectedFlavor] || "Descrição não disponível.";
    document.getElementById('itemDescription').textContent = description;

    // Populate ingredient options
    const ingredientContainer = document.getElementById('ingredientOptions');
    ingredientContainer.innerHTML = '';
    ingredientOptions[category].forEach(option => {
      const div = document.createElement('div');
      div.className = 'form-check';
      div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${option.value}" id="${option.value}">
        <label class="form-check-label" for="${option.value}">${option.label}</label>
      `;
      ingredientContainer.appendChild(div);
    });

    // Show the modal
    const customizeModal = new bootstrap.Modal(document.getElementById('customizeModal'));
    customizeModal.show();
  });
});

document.getElementById('addToCartButton').addEventListener('click', () => {
  if (!selectedFlavor) return;

  const selectedIngredients = Array.from(document.querySelectorAll('#customizeModal .form-check-input:checked'))
    .map(input => input.value);

  const itemWithIngredients = {
    flavor: selectedFlavor,
    ingredients: selectedIngredients
  };

  cart.push(itemWithIngredients);

  const listItem = document.createElement('li');
  listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
  listItem.textContent = `${selectedFlavor} (${selectedIngredients.join(', ')})`;

  const removeButton = document.createElement('button');
  removeButton.className = 'btn btn-danger btn-sm';
  removeButton.textContent = 'Remover';
  removeButton.addEventListener('click', () => {
    const index = cart.indexOf(itemWithIngredients);
    if (index > -1) {
      cart.splice(index, 1);
      cartElement.removeChild(listItem);
      updateTotalPrice();
    }
  });

  listItem.appendChild(removeButton);
  cartElement.appendChild(listItem);
  updateTotalPrice();

  // Hide the modal
  const customizeModal = bootstrap.Modal.getInstance(document.getElementById('customizeModal'));
  customizeModal.hide();
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

  const total = cart.reduce((sum, item) => {
    const basePrice = prices[item.flavor] || 0;
    const additionalPrice = item.ingredients.reduce((ingredientSum, ingredient) => {
      return ingredientSum + (ingredient === "M&Ms" ? 3.00 : 2.00);
    }, 0);
    return sum + basePrice + additionalPrice;
  }, 0);

  const order = { 
    Nome: name, 
    Produtos: cart.map(item => ({
      flavor: item.flavor,
      ingredients: item.ingredients.join(', ')
    })),
    Total: total.toFixed(2) // Include total price
  };

  socket.send(JSON.stringify(order));
  alert('Order sent!');
  cart.length = 0; // Clear the cart
  cartElement.innerHTML = ''; // Clear the cart UI
  nameInput.value = ''; // Clear the name input
  updateTotalPrice(); // Reset total price
});
