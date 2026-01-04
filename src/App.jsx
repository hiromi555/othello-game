import { useState, useEffect } from 'react';
import './App.css';
import {
  getInitialBoard,
  getFlippableStones,
  countStone,
  hasValidMove,
  BLACK,
  WHITE,
  BOARD_WEIGHTS
} from './utils/othelloLogic';

function App() {
  const [board, setBoard] = useState(getInitialBoard());
  const [turn, setTurn] = useState(BLACK);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [winner, setWinner] = useState(null);

  // CPUモードかどうか
  const [isCpuMode, setIsCpuMode] = useState(true);
  // ：難易度設定
//   const [difficulty, setDifficulty] = useState('easy');

  // スコア計算
  useEffect(() => {
    setScores(countStone(board));
  }, [board]);

 // AIの行動（1手読み強化版）
  const cpuMove = () => {
    const validMoves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (getFlippableStones(y, x, WHITE, board).length > 0) {
          validMoves.push({ row: y, col: x });
        }
      }
    }

    if (validMoves.length === 0) {
      passTurn();
      return;
    }

    let selectedMove;

    // if (difficulty === 'easy') {
    //   // Easy: ランダム
    //   const randomIndex = Math.floor(Math.random() * validMoves.length);
    //   selectedMove = validMoves[randomIndex];
   // } else {
      // Hard: 1手先を読んで、危険な手は避ける！
      let bestScore = -9999;

      validMoves.forEach((move) => {
        // 1. 基本点数（場所の良さ）
        let score = BOARD_WEIGHTS[move.row][move.col];
        // 2. 未来予知（シミュレーション）開始！
        // 試しに今の盤面をコピーして、石を置いてみる
        const tempBoard = structuredClone(board);
        const flippable = getFlippableStones(move.row, move.col, WHITE, tempBoard);

        // 仮想の盤面で石を裏返す
        tempBoard[move.row][move.col] = WHITE;
        flippable.forEach(({ row, col }) => {
          tempBoard[row][col] = WHITE;
        });
        // 3. 相手（黒）のターンになったと仮定して、相手に「角」を取られるかチェック
        const corners = [
          { r: 0, c: 0 }, { r: 0, c: 7 },
          { r: 7, c: 0 }, { r: 7, c: 7 }
        ];
        let givesCorner = false;
        corners.forEach((corner) => {
          // もし相手が角に置ける状態になっていたら...
          // (相手の石=BLACK でチェック)
          if (getFlippableStones(corner.r, corner.c, BLACK, tempBoard).length > 0) {
            givesCorner = true;
          }
        });
        // 4. もし角を取られる手なら、点数を激減させる
        if (givesCorner) {
          score -= 1000; // 絶対に選びたくない手にする
        }
        // ベストスコアの更新
        if (score >= bestScore) {
          bestScore = score;
          selectedMove = move;
        }
      });
   // }
    executeMove(selectedMove.row, selectedMove.col);
  };

  const executeMove = (row, col) => {
    const flippable = getFlippableStones(row, col, turn, board);
    if (flippable.length === 0) return;

    const newBoard = structuredClone(board);
    newBoard[row][col] = turn;
    flippable.forEach(({ row, col }) => {
      newBoard[row][col] = turn;
    });

    setBoard(newBoard);

    const nextTurn = turn === BLACK ? WHITE : BLACK;
    checkNextTurn(newBoard, nextTurn);
  };

  const checkNextTurn = (currentBoard, nextTurn) => {
    if (hasValidMove(currentBoard, nextTurn)) {
      setTurn(nextTurn);
    } else {
      const currentTurn = nextTurn === BLACK ? WHITE : BLACK;
      if (hasValidMove(currentBoard, currentTurn)) {
        setTimeout(() => {
            alert(`${nextTurn === BLACK ? "黒" : "白"}は置ける場所がありません！パス！`);
            setTurn(currentTurn);
        }, 10);
      } else {
        finishGame(currentBoard);
      }
    }
  };

  const passTurn = () => {
     setTimeout(() => {
        alert("白は置ける場所がありません！パス！");
        setTurn(BLACK);
     }, 800);
  };

  const finishGame = (finalBoard) => {
    const finalScores = countStone(finalBoard);
    let resultMessage = "引き分け！";

    if (finalScores.black > finalScores.white) {
      resultMessage = isCpuMode ? "あなたの勝ち！🎉" : "黒の勝ち！⚫️";
    } else if (finalScores.white > finalScores.black) {
      resultMessage = isCpuMode ? "機械の勝ち...🤖" : "白の勝ち！⚪️";
    }
    setWinner(resultMessage);
  };

  const handleClick = (row, col) => {
    if (winner || board[row][col] || (isCpuMode && turn === WHITE)) return;
    executeMove(row, col);
  };

  const handleReset = () => {
    setBoard(getInitialBoard());
    setTurn(BLACK);
    setWinner(null);
  };

  // AIの思考
  useEffect(() => {
    if (!isCpuMode || winner || turn === BLACK) return;

    const timer = setTimeout(() => {
      cpuMove();
    }, 2000);

    return () => clearTimeout(timer);
  }, [turn, isCpuMode, winner, board]);


  return (
    <div className="game-container">
      {/* スコア表示 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '10px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="stone black" style={{ width: '30px', height: '30px', position: 'static', animation: 'none' }}></span>
          <span>{scores.black}</span>
        </div>
        <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>vs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{scores.white}</span>
          <span className="stone white" style={{ width: '30px', height: '30px', position: 'static', animation: 'none' }}></span>
        </div>
      </div>

      {winner && <p className="winner-popup" >{winner}</p>}

      {/* 状態表示 */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '1.25rem',
        opacity: 0.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        height: '30px',
      }}>
         {winner ? (
            "ゲーム終了"
         ) : isCpuMode && turn === WHITE ? (
            <>
              <span className="stone white" style={{ width: '20px', height: '20px', animation: 'none' }}></span>
              <span>思考中...</span>
            </>
         ) : (
            <>
              <span className={`stone ${turn}`} style={{ width: '20px', height: '20px', animation: 'none' }}></span>
              <span>の番です</span>
            </>
         )}
      </div>

      <div className="board">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => handleClick(rowIndex, colIndex)}
            >
              {cell && <div className={`stone ${cell}`}></div>}
            </div>
          ))
        ))}
      </div>

      {/* 操作ボタンエリア */}
      <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px', alignItems:'center'}}>
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={handleReset}>はじめから</button>
            <button onClick={() => setIsCpuMode(!isCpuMode)}>
            {isCpuMode ? "モード: vs 機械" : "モード: vs 人間"}
            </button>
        </div>

        {/* 難易度ボタン（CPUモードの時だけ表示） */}
        {/* {isCpuMode && (
            <div style={{display:'flex', gap:'5px', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '20px'}}>
                <span style={{fontSize: '0.8rem', marginRight:'5px'}}>レベル:</span>
                <button
                    style={{
                        backgroundColor: difficulty === 'easy' ? '#27ae60' : '#7f8c8d',
                        opacity: difficulty === 'easy' ? 1 : 0.6,
                        fontSize: '0.8rem', padding: '5px 10px'
                    }}
                    onClick={() => setDifficulty('easy')}
                >弱い</button>
                <button
                    style={{
                        backgroundColor: difficulty === 'hard' ? '#e74c3c' : '#7f8c8d',
                        opacity: difficulty === 'hard' ? 1 : 0.6,
                        fontSize: '0.8rem', padding: '5px 10px'
                    }}
                    onClick={() => setDifficulty('hard')}
                >強い</button>
            </div>
        )} */}
      </div>
    </div>
  );
}

export default App;
