export const BLACK = 'black';
export const WHITE = 'white';

// 初期盤面を作成
export const getInitialBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][4] = WHITE;
  board[4][3] = BLACK;
  return board;
};

// 石を数える
export const countStone = (board) => {
  let black = 0;
  let white = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (cell === BLACK) black++;
      if (cell === WHITE) white++;
    });
  });
  return { black, white };
};

// 指定した方向を検索
const searchDirection = (row, col, myColor, board, dy, dx) => {
  const opponentColor = myColor === BLACK ? WHITE : BLACK;
  let y = row + dy;
  let x = col + dx;
  const flippable = [];

  if (y < 0 || y > 7 || x < 0 || x > 7) return [];
  if (board[y][x] === null) return [];
  if (board[y][x] === myColor) return [];

  while (board[y][x] === opponentColor) {
    flippable.push({ row: y, col: x });
    y += dy;
    x += dx;
    if (y < 0 || y > 7 || x < 0 || x > 7) return [];
  }

  if (board[y][x] === myColor) {
    return flippable;
  }
  return [];
};

// クリックした場所から裏返せる石を探す
export const getFlippableStones = (row, col, myColor, board) => {
  if (board[row][col] !== null) return [];

  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  let allFlippable = [];
  directions.forEach(([dy, dx]) => {
    const found = searchDirection(row, col, myColor, board, dy, dx);
    allFlippable = [...allFlippable, ...found];
  });

  return allFlippable;
};

// パス判定用
export const hasValidMove = (board, turnColor) => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (getFlippableStones(y, x, turnColor, board).length > 0) {
        return true;
      }
    }
  }
  return false;
};


// 盤面の価値（重みづけ）
export const BOARD_WEIGHTS = [
  [ 120, -20,  20,   5,   5,  20, -20, 120],
  [ -20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [  20,  -5,  15,   3,   3, 15,  -5,  20],
  [   5,  -5,   3,   3,   3,   3,  -5,   5],
  [   5,  -5,   3,   3,   3,   3,  -5,   5],
  [  20,  -5,  15,   3,   3, 15,  -5,  20],
  [ -20, -40,  -5,  -5,  -5,  -5, -40, -20],
  [ 120, -20,  20,   5,   5,  20, -20, 120],
];
