// -------------------
// Tic-Tac-Toe Game JS
// -------------------

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameMode = 'pvp';    // 'pvp' or 'pve'
let difficulty = 'easy'; // 'easy', 'medium', 'hard'
let gameOver = false;

// Score counters
let scoreX = 0, scoreO = 0, scoreDraw = 0;

// Winning combinations
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// DOM elements
const squares = document.querySelectorAll('.square');
const statusEl = document.getElementById('status');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const resetBtn = document.getElementById('reset');
const newGameBtn = document.getElementById('newGame');
const modeInputs = document.querySelectorAll('input[name="mode"]');
const diffInputs = document.querySelectorAll('input[name="difficulty"]');
const diffContainer = document.getElementById('difficulty-select');

// Sounds
const sound = document.getElementById('sound');
// -------------------
// Initialize game
// -------------------

function resetBoard() {
  board.fill(null);
  gameOver = false;
  currentPlayer = 'X';
  statusEl.textContent = "X's Turn";
  squares.forEach(sq => sq.textContent = '');
  squares.forEach(sq => sq.classList.remove('x','o','win','clicked'));
}

function newGame() {
  scoreX = 0; scoreO = 0; scoreDraw = 0;
  scoreXEl.textContent = 'X: 0';
  scoreOEl.textContent = 'O: 0';
  scoreDrawEl.textContent = 'Draws: 0';
  resetBoard();
}

resetBtn.addEventListener('click', resetBoard);
newGameBtn.addEventListener('click', newGame);

// -------------------
// Mode and difficulty
// -------------------

modeInputs.forEach(radio => {
  radio.addEventListener('change', () => {
    gameMode = document.querySelector('input[name="mode"]:checked').value;
    diffContainer.style.display = (gameMode === 'pve') ? 'block' : 'none';
    resetBoard();
  });
});

diffInputs.forEach(radio => {
  radio.addEventListener('change', () => {
    difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    resetBoard();
  });
});

// -------------------
// Game logic
// -------------------

function makeMove(index, player) {
  if(board[index] || gameOver) return;

  // Place mark and animation
  board[index] = player;
  const sq = document.querySelector(`.square[data-index="${index}"]`);
  sq.textContent = player;
  sq.classList.add(player.toLowerCase(), 'clicked');
  setTimeout(()=> sq.classList.remove('clicked'), 500);

  // Play click sound
 sound.play();

  // Check for win
  const winCombo = checkWin(player);
  if(winCombo){
    gameOver = true;
    winCombo.forEach(i => document.querySelector(`.square[data-index="${i}"]`).classList.add('win'));
    statusEl.textContent = `${player} Wins!`;
    sound.play();
    if(player==='X'){ scoreX++; scoreXEl.textContent = `X: ${scoreX}`; }
    else { scoreO++; scoreOEl.textContent = `O: ${scoreO}`; }
    return;
  }

  // Check for draw
  if(board.every(c=>c)){
    gameOver = true;
    statusEl.textContent = "Draw!";
    sound.play();
    scoreDraw++; scoreDrawEl.textContent = `Draws: ${scoreDraw}`;
    return;
  }

  // Switch turn
  if(gameMode==='pvp' || player==='O'){
    currentPlayer = (player==='X')?'O':'X';
    statusEl.textContent = `${currentPlayer}'s Turn`;
  }

  // AI move if needed
  if(gameMode==='pve' && player==='X' && !gameOver){
    currentPlayer = 'O';
    statusEl.textContent = "O's Turn (AI)";
    setTimeout(aiMove, 300);
  }
}

function checkWin(player){
  for(let combo of winPatterns){
    if(combo.every(i=>board[i]===player)) return combo;
  }
  return null;
}

// -------------------
// AI logic
// -------------------

function aiMove(){
  if(gameOver) return;
  let idx;
  const avail = board.map((v,i)=>v?null:i).filter(i=>i!==null);

  if(difficulty==='easy'){
    idx = avail[Math.floor(Math.random()*avail.length)];
  }
  else if(difficulty==='medium'){
    idx = findBestMove('O') || findBestMove('X') || avail[Math.floor(Math.random()*avail.length)];
  }
  else { // hard
    idx = minimax(board, 'O').index;
  }

  if(idx!=null){
    makeMove(idx, 'O');
  }
}

function findBestMove(player){
  for(let i=0;i<9;i++){
    if(!board[i]){
      board[i]=player;
      if(checkWin(player)){ board[i]=null; return i; }
      board[i]=null;
    }
  }
  return null;
}

function minimax(newBoard, player){
  const avail = newBoard.map((v,i)=>v?null:i).filter(i=>i!==null);
  if(checkWin('X')) return {score:-10};
  if(checkWin('O')) return {score:10};
  if(avail.length===0) return {score:0};

  let moves = [];
  for(let i of avail){
    newBoard[i]=player;
    let result = (player==='O')? minimax(newBoard,'X') : minimax(newBoard,'O');
    moves.push({index:i, score:result.score});
    newBoard[i]=null;
  }

  if(player==='O') return moves.reduce((best,m)=>m.score>best.score?m:best,{score:-Infinity});
  else return moves.reduce((best,m)=>m.score<best.score?m:best,{score:Infinity});
}

// -------------------
// Event listeners for squares
// -------------------

squares.forEach(sq => sq.addEventListener('click', ()=>{
  if(gameMode==='pvp' || currentPlayer==='X') makeMove(parseInt(sq.getAttribute('data-index')), currentPlayer);
}));

// Initialize
resetBoard();
