import { useState } from "react";

function Square({value, onSquareClick, isGreen}) {
  return (
	  <button className="square" onClick={onSquareClick} style={{backgroundColor: isGreen ? '#00ff00' : '#ffffffff'}}>
		{value}
	  </button>
  )
}

function Board({xIsNext, squares, onPlay}) {
  
  function handleClick(i) {
	if(calculateWinner(squares) || squares[i]){
	  return;
	}
	const nextSquares = squares.slice();
	if(xIsNext){
	  nextSquares[i] = "X";
	} else {
	  nextSquares[i] = "O";
	}
	onPlay(nextSquares);
  }

  const winner = calculateWinner(squares)
  const winnerSquares = calculateWinnerSquares(squares)
  let status
  if(winner=="X" || winner=="O"){
	status = "Winner: " + winner;
  } else if(winner=="T"){// T for tie
	status = "Tie"
  } else {
	status = "Next player: " + (xIsNext ? "X" : "O")
  }
  
  return (
  <div style={{backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px'}}>
	<div className="status">{status}</div>
	<div className="board-row">
	  <Square value={squares[0]} onSquareClick={() => handleClick(0)} isGreen={winnerSquares.includes(0)}/>
	  <Square value={squares[1]} onSquareClick={() => handleClick(1)} isGreen={winnerSquares.includes(1)}/>
	  <Square value={squares[2]} onSquareClick={() => handleClick(2)} isGreen={winnerSquares.includes(2)}/>
	</div>
	<div className="board-row">
	  <Square value={squares[3]} onSquareClick={() => handleClick(3)} isGreen={winnerSquares.includes(3)}/>
	  <Square value={squares[4]} onSquareClick={() => handleClick(4)} isGreen={winnerSquares.includes(4)}/>
	  <Square value={squares[5]} onSquareClick={() => handleClick(5)} isGreen={winnerSquares.includes(5)}/>
	</div>
	<div className="board-row">
	  <Square value={squares[6]} onSquareClick={() => handleClick(6)} isGreen={winnerSquares.includes(6)}/>
	  <Square value={squares[7]} onSquareClick={() => handleClick(7)} isGreen={winnerSquares.includes(7)}/>
	  <Square value={squares[8]} onSquareClick={() => handleClick(8)} isGreen={winnerSquares.includes(8)}/>
	</div>
  </div>
  );
}

export default function Game(){

  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];
  const [reverted, setReverted] = useState(false)

  function handlePlay(nextSquares) {
	const nextHistory = [...history.slice(0, currentMove + 1), nextSquares] 
	setHistory(nextHistory);
	setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove){
	setCurrentMove(nextMove);
  }

  function getListOfMoves(){
	let theMoves =  history.map( (squares, move) => {
	  let description;
	  if(move == 0){
		description = "Restart Game";
	  } else if (move != currentMove) {
		description = "Go to move # " + move;
	  } else {
		return (
		  <li key={move}>
			<div>{"Current Move"}</div>
		  </li>
		)
	  }
	  return (
		<li key={move}>
		  <button onClick={() => jumpTo(move)}>{description}</button>
		</li>
	  )
	});
	if (reverted) {
	  theMoves.reverse()
	}
	return theMoves
  }

  function handleRevert(){
	setReverted(!reverted)
  }

  const moves = getListOfMoves()

  return (
	<div className="game">
	  <div className="game-board">
		<Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
	  </div>
	  <div className="game-info">
		<div className="inverter">
		  <button onClick={handleRevert}>⬆️⬇️</button>
		</div>
		<ol>{moves.reverse()}</ol>
	  </div>
	</div>
  )
}

function calculateWinner(squares) {
  const lines = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
	const [a,b,c] = lines[i];
	if (squares[a] && squares[b] == squares[c] && squares[a] == squares[b]){
	  return squares[a];
	}
  }
  if(squares.includes(null))
	return null
  else
	return "T"
}

function calculateWinnerSquares(squares) {
  const lines = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
	const [a,b,c] = lines[i];
	if (squares[a] && squares[b] == squares[c] && squares[a] == squares[b]){
	  return [a, b, c];
	}
  }
  return [9, 9, 9]
}