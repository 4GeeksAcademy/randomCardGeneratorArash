import "bootstrap";                     
import "./style.css";                  

import "./assets/img/rigo-baby.jpg";     
import "./assets/img/4geeks.ico";       
// data base

const SUITS = ["♦", "♥", "♠", "♣"];     // ashkal
const VALUES = [                        // shomare haye cards
  "A", "2", "3", "4", "5", "6", "7",
  "8", "9", "10", "J", "Q", "K"
];

const TABLE_COLORS = [                 
  "tapate-green",                       // tapete verde
  "tapate-brown",                       // tapete marrón
  "tapate-darkBlue",                    // tapete azul oscuro
  "tapete-black"                        // tapete negro
];

let currentTableColor = 0;              // start of the color of the table
let blackjackMode = false;              // if we are in the blackjack mode(true) o normal mode(false)

// Referencias a elementos que crearemos
let tableDiv;                           // guardaremos el contenedor donde van las cartas
let messageDiv;                         // mostraremos los mensajes del juego (puntos, ganar, perder, etc.)
let buttonsDiv;                         // Contenedor para todos los botones
let btnHit;                             // Boton "Pedir carta" (solo para Blackjack)
let btnStand;                           // Boton "Plantarse" (solo para Blackjack)


// Función que devuelve un elemento aleatorio de un array
const randomFrom = array => {
  const index = Math.floor(Math.random() * array.length); // Genera un índice aleatorio entre 0 y array.length - 1 
  return array[index];                                    // Devuelve el valor que está en ese índice
};

// Crear una carta DOM aleatoria
function createCardElement() {
  const suit = randomFrom(SUITS);       // Elige un palo aleatorio de SUITS
  const value = randomFrom(VALUES);     // Elige un valor aleatorio de VALUES

  const card = document.createElement("div"); // Crea un <div> para la carta
  card.className =
    "playing-card d-flex flex-column justify-content-between align-items-center bg-white"; 
    // Añade clases para estilo y layout: carta blanca, flex vertical, centrada

  const isRed = suit === "♦" || suit === "♥"; // Mira si el palo debe ser rojo
  const colorClass = isRed ? "text-danger" : "text-dark"; // Clase con color: rojo o negro

 //palo arriba, valor en el centro, palo abajo girado
  card.innerHTML = `
    <div class="card-corner card-corner-top ${colorClass} align-self-start">${suit}</div>
    <div class="card-value ${colorClass}">${value}</div>
    <div class="card-corner card-corner-bottom ${colorClass} align-self-end">${suit}</div>
  `;

  return card; // Devuelve el elemento carta listo para añadir al DOM
}

// Reparte una carta (si clear=true borra las anteriores)
function dealSingleCard(clear = true) {
  if (clear) tableDiv.innerHTML = "";  // if clear was true, clean the table and give a new card

  const card = createCardElement();    // Crea una carta aleatoria
  tableDiv.appendChild(card);          // La añade al contenedor de cartas

  if (blackjackMode) {               
    updateBlackjackMessage();    
  } else {
    messageDiv.textContent = "";// Si no es Blackjack, limpia cualquier mensaje anterior
  }
}

// Añadir carta sin borrar las anteriores
function addCard() {
  const card = createCardElement();// Crea una nueva carta aleatoria
  tableDiv.appendChild(card); // La añade al contenedor, sin borrar las anteriores

  if (blackjackMode) {                
    updateBlackjackMessage();
  }
}

// avaz kardan background (cambiar color del tapete)
function changeTableColor() {
  document.body.classList.remove(TABLE_COLORS[currentTableColor]); // Quita el color actual del body
  currentTableColor = (currentTableColor + 1) % TABLE_COLORS.length; // Avanza al siguiente índice (y vuelve al inicio con %)
  document.body.classList.add(TABLE_COLORS[currentTableColor]);    // Añade la clase del nuevo color
}

// Calcular puntos del jugador a partir de las cartas en pantalla
function calculatePlayerPoints() {
  const valueEls = tableDiv.querySelectorAll(".card-value"); // Selecciona todos los elementos con el valor de la carta
  let points = 0;                                             // Acumulador de puntos
  let aces = 0;                                               // ace

  valueEls.forEach(el => {        // Recorre cada carta para sumar sus puntos
    const v = el.textContent;   

    if (v === "J" || v === "Q" || v === "K") { // J, Q, K valen 10
      points += 10;
    } else if (v === "A") {                    // A inicialmente vale 11
      points += 11;
      aces++;                                  // Contamos el as para poder bajarlo a 1 si nos pasamos
    } else {
      points += parseInt(v, 10);               // Para números, los convertimos a entero y sumamos
    }
  });

  // Ajuste de As: de 11 a 1 si nos pasamos de 21
  while (points > 21 && aces > 0) { // Mientras los puntos sean > 21 y tengamos ases como 11...
    points -= 10;                
    aces--;                     
  }

  return points;                    // Devolvemos la puntuación final del jugador
}

// Actualiza el mensaje del modo Blackjack
function updateBlackjackMessage() {
  const player = calculatePlayerPoints(); // Calcula los puntos del jugador con las cartas actuales

  if (player === 21) {                    // Si tiene exactamente 21 puntos
    messageDiv.innerHTML = `Tienes 21 puntos.<br>¡BLACKJACK!<br>Pulsa "Jugar Blackjack" para empezar otra vez.`;
    btnHit.disabled = true;              // Desactiva el botón "Pedir carta"
    btnStand.disabled = true;            // Desactiva el botón "Plantarse"
  } else if (player > 21) {              // Si se ha pasado de 21
    const house = Math.floor(Math.random() * 5) + 17; // Genera puntos de la casa (17 a 21)
    messageDiv.innerHTML = `Te has pasado con ${player}.<br>La casa tenía ${house}.<br>Pulsa "Jugar Blackjack" para volver a jugar.`;
    btnHit.disabled = true;              // Desactiva "Pedir carta"
    btnStand.disabled = true;            // Desactiva "Plantarse"
  } else {                               // Si sigue por debajo de 21
    messageDiv.innerHTML = `Tienes ${player} puntos.<br>Pide carta o plántate.`; // Mensaje informativo
  }
}

// Inicia partida de Blackjack
function startBlackjack() {
  blackjackMode = true;                  // active Blackjack
  tableDiv.innerHTML = "";              // clear la mesa de cartas
  messageDiv.textContent = "";          // clear mensajes anteriores

  btnHit.classList.remove("d-none");    //show el botón "Pedir carta"
  btnStand.classList.remove("d-none");  //show el botón "Plantarse"
  btnHit.disabled = false;            
  btnStand.disabled = false;            

  // Mano inicial: 2 cartas
  dealSingleCard(false);                // Reparte la primera carta sin limpiar (ya está vacío)
  dealSingleCard(false);                // Reparte la segunda carta sin limpiar
  updateBlackjackMessage();             // Actualiza el mensaje con los puntos iniciales
}

//compara puntos con la casa
function stand() {
  const player = calculatePlayerPoints();           // Puntos del jugador
  const house = Math.floor(Math.random() * 5) + 17; // Puntos de la casa (17 a 21)

  let msg = "";                                     // Mensaje a mostrar

  if (player > 21) {                                // Si el jugador ya está pasado
    msg = `Te has pasado con ${player}.<br>La casa tenía ${house}.`;
  } else if (house > 21 || player > house) {        // Si la casa se pasa o el jugador tiene más
    msg = `Te plantas con ${player}.<br>La casa tenía ${house}.<br>¡Has ganado!`;
  } else if (player === house) {                    // Empate
    msg = `Empate: tú ${player}, la casa ${house}.`;
  } else {                                          // En cualquier otro caso, pierde el jugador
    msg = `Te plantas con ${player}.<br>La casa tenía ${house}.<br>Has perdido.`;
  }

  messageDiv.innerHTML = msg + `<br>Pulsa "Jugar Blackjack" para intentarlo de nuevo.`; // Mensaje final
  btnHit.disabled = true;                          // Desactiva "Pedir carta"
  btnStand.disabled = true;                        // Desactiva "Plantarse"
}

// ==== Layout y botones ====

function setupLayout() {
  document.body.classList.add(
    "min-vh-100",                
    "d-flex",                  
    "flex-column",               
    "align-items-center",        
    "py-4",                      
    TABLE_COLORS[currentTableColor] // Aplica la primera clase de color de tapete
  );

  const title = document.createElement("h1"); 
  title.textContent = "Generador de Cartas";  
  title.className = "text-light mb-3";       
  document.body.appendChild(title);           

  const subtitle = document.createElement("p"); // Crea un subtítulo
  subtitle.textContent =
    "Carta aleatoria, varias cartas, cambio de tapete y modo Blackjack."; 
  subtitle.className = "text-light-50 mb-4"; 
  document.body.appendChild(subtitle);         // Lo añade al body

  // Mesa de cartas
  tableDiv = document.createElement("div");    // Crea el contenedor de cartas
  tableDiv.id = "card-table";                
  tableDiv.className =
    "d-flex flex-wrap justify-content-center gap-3 mb-3"; 
  document.body.appendChild(tableDiv);       

  // Mensajes de juego
  messageDiv = document.createElement("div"); // Crea el contenedor de mensajes
  messageDiv.id = "game-message";            // id para referenciarlo
  messageDiv.className = "text-light text-center mb-3 fs-5"; 
  document.body.appendChild(messageDiv);     

  // Contenedor de botones
  buttonsDiv = document.createElement("div"); // contenedor de botones
  buttonsDiv.className =
    "d-flex flex-wrap justify-content-center gap-2"; 
  document.body.appendChild(buttonsDiv);      

  createButtons();                             // Llama a la función que crea todos los botones
}

function createButtons() {
  //  Carta aleatoria (borra las anteriores)
  const btnSingle = document.createElement("button"); // Crea botón para carta aleatoria
  btnSingle.className = "btn btn-light";            
  btnSingle.textContent = "Carta aleatoria";         
  btnSingle.addEventListener("click", () => {         // Evento al hacer click
    blackjackMode = false;                            // Sale de modo Blackjack
    btnHit.classList.add("d-none");                   // Oculta botón "Pedir carta"
    btnStand.classList.add("d-none");                 // Oculta botón "Plantarse"
    dealSingleCard(true);                             // Genera una nueva carta borrando las anteriores
  });
  buttonsDiv.appendChild(btnSingle);                  // Añade el botón al contenedor

  // Añadir carta (no borra las anteriores)
  const btnAdd = document.createElement("button");    // Crea botón para añadir carta
  btnAdd.className = "btn btn-outline-light";       
  btnAdd.textContent = "Añadir carta";                // Texto del botón
  btnAdd.addEventListener("click", () => {            // Acción al click
    addCard();                                        // Añade otra carta sin borrar las que hay
  });
  buttonsDiv.appendChild(btnAdd);                     // Añade el botón

  // avaz kardane backround (cambiar color del tapete)
  const btnTable = document.createElement("button");  // Botón para cambiar el tapete
  btnTable.className = "btn btn-outline-warning";    
  btnTable.textContent = "Cambiar tapete";           
  btnTable.addEventListener("click", changeTableColor); // Al hacer click, cambia el color del tapete
  buttonsDiv.appendChild(btnTable);                   // Añade el botón

  // Jugar Blackjack
  const btnBlackjack = document.createElement("button"); // Botón para iniciar Blackjack
  btnBlackjack.className = "btn btn-danger";             // Estilo rojo
  btnBlackjack.textContent = "Jugar Blackjack";        
  btnBlackjack.addEventListener("click", startBlackjack); // Inicia el juego Blackjack
  buttonsDiv.appendChild(btnBlackjack);                  // Añade el botón

  //  Pedir carta (solo Blackjack)
  btnHit = document.createElement("button");             // Botón "Pedir carta"
  btnHit.className = "btn btn-success d-none";           // Estilo verde + oculto al principio
  btnHit.textContent = "Pedir carta";                    // Texto del botón
  btnHit.addEventListener("click", () => {               // Al hacer click...
    addCard();                                           // ...añade una nueva carta
  });
  buttonsDiv.appendChild(btnHit);                        // Añade el botón

  // 6) Plantarse (solo Blackjack)
  btnStand = document.createElement("button");         
  btnStand.className = "btn btn-secondary d-none";      
  btnStand.textContent = "Plantarse";                   
  btnStand.addEventListener("click", stand);            
  buttonsDiv.appendChild(btnStand);                   
}


window.onload = function() {               // Esta función se ejecuta cuando la página termina de cargar
  console.log("Proyecto de cartas cargado"); // Muestra un mensaje en la consola
  setupLayout();                           // Configura el layout inicial (título, mesa, botones, ...)
  dealSingleCard(true);                    // Reparte una carta al cargar la página
};