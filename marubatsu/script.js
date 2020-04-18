'use strict';

var cellObjs;
var playerTimeOutId;
var playerTimeOutSec;
var messageObj;
var board;

class Board
{
  constructor(nTiles, nPlayer)
  {
    this.nTiles = nTiles;
    this.nPlayer = nPlayer;
  
    this.cells = new Array(nTiles);
    for (let i = 0; i < nTiles; i++)
    {
      this.cells[i] = new Array(nTiles);
      for (let j = 0; j < nTiles; j++)
      {
        this.cells[i][j] = 0;
      }
    }
  
    this.winner = 0;
    this.alreadyPut = 0;
  }
  
  clone()
  {
    let newBoard = new Board(this.nTiles, this.nPlayer);
    
    newBoard.cells = new Array(this.nTiles);
    for (let i = 0; i < this.nTiles; i++)
    {
      newBoard.cells[i] = new Array(this.nTiles);
      for (let j = 0; j < this.nTiles; j++)
      {
        newBoard.cells[i][j] = this.cells[i][j];
      }
    }
    
    newBoard.winner = this.winner;
    newBoard.alreadyPut = this.alreadyPut;
    return newBoard;
  }

  nextPlayer(currentPlayer)
  {
    return currentPlayer % this.nPlayer + 1;
  }

  tryPut(row, column, p)
  {
    if (this.winner != 0) return false;
    if (this.cells[row][column] != 0) return false;

    this.cells[row][column] = p;
    this.alreadyPut++;
    return true;
  }

  AIPut(putMethod, p)
  {
    const cell = putMethod.call(this, p);
    this.cells[cell[0]][cell[1]] = p;

    this.alreadyPut++;
    this.winner = this.judge();
    refresh(this);
  }
  
  getVacantList()
  {
    const N = this.nTiles;
    let retList = [];
    for (let i = 0; i < N; i++)
    {
      for (let j = 0; j < N; j++)
      {
        if (this.cells[i][j] == 0)
          retList.push([i,j]);
      }
    }
    return retList;
  }

  putRandom(p)
  {
    const vacantList = this.getVacantList();
    return randomChoice(vacantList);
  }
  
  putHard(p)
  {
    if (this.cells[1][1] == 0)
    {
      return [1,1];
    }
    else if (this.alreadyPut == 1)
    {
      return randomChoice([[0,0],[0,2],[2,0],[2,2]]);
    }
    else
    {
      const depth = this.nTiles * this.nTiles - this.alreadyPut;
      const {te} = dfs(this, p, p, depth);
      return randomChoice(te);
    }
  }

  judge()
  {
    if (this.judge1(1)) return 1;
    else if (this.judge1(2)) return 2;
    else if (this.alreadyPut == this.nTiles * this.nTiles) return 12;
    else return 0;
  }

  judge1(p)
  {
    const N = this.nTiles;
    for (let i = 0; i < N; i++)
    {
      let rowComp = true;
      for (let j = 0; j < N; j++)
      {
        rowComp = rowComp && (this.cells[i][j] == p);
      }
      if (rowComp) return true;
    }

    for (let j = 0; j < N; j++)
    {
      let colComp = true;
      for (let i = 0; i < N; i++)
      {
        colComp = colComp && (this.cells[i][j] == p);
      }
      if (colComp) return true;
    }

    let ldComp = true;
    let luComp = true;
    for (let i = 0; i < N; i++)
    {
      ldComp = ldComp && (this.cells[i][i] == p);
      luComp = luComp && (this.cells[i][N-1-i] == p);
    }
    if (ldComp || luComp) return true;
  }
}


///////////////// gloval functions /////////////////////
function randomChoice(a)
{
  const rnd = Math.floor(Math.random() * a.length);
  return a[rnd];
}


function dfs(board, me, turnPlayer, leftDepth)
{
  const winner = board.judge();
  if (winner == me)
    return {score: 1000};
  else if (winner > 0 && winner < 10)
    return {score: -1000};
  else if (leftDepth <= 0)
    return {score: 0};


  let m = {};
  if (turnPlayer == me)
    m.score = -Infinity;
  else
    m.score = Infinity;
  
  let vList = board.getVacantList();
  let nextPlayer = board.nextPlayer(turnPlayer);
  for (const v of vList)
  {
    let newBoard = board.clone();
    newBoard.cells[v[0]][v[1]] = turnPlayer;
    newBoard.alreadyPut++;
    const mm = dfs(newBoard, me, nextPlayer, leftDepth - 1);

    if ((turnPlayer == me && mm.score > m.score) || (turnPlayer != me && mm.score < m.score))
    {
      m.score = mm.score;
      m.te = [v];
    }
    else if (mm.score == m.score)
    {
      m.te.push(v);
    }
  }
  return m;
}

function onClick(row, column)
{
  if (!board.tryPut(row, column, 1)) return;
  board.winner = board.judge();
  refresh(board);

  if (board.winner != 0) return;
  
  board.AIPut(board.putHard, 2);
  
  if (playerTimeOutId > 0)
    clearTimeout(playerTimeOutId);

  playerTimeOutId = setTimeout(timeOut, playerTimeOutSec * 1000);
}

function timeOut()
{
  if (board.winner == 0)
  {
    board.winner = 11;
    refresh(board);
  }
}

function refresh(board)
{
  let N = 3;
  for (let i = 0; i < N; i++)
  {
    for (let j = 0; j < N; j++)
    {
      if (board.cells[i][j] == 0)
        cellObjs[i][j].innerText = '';
      else if (board.cells[i][j] == 1)
        cellObjs[i][j].innerText = '○';
      else if (board.cells[i][j] == 2)
        cellObjs[i][j].innerText = '×';
    }
  }

  if (board.winner == 1)
    messageObj.innerText = '○の勝ちー';
  else if (board.winner == 2)
    messageObj.innerText = '×の勝ちー';
  else if (board.winner == 11)
    messageObj.innerText = `${playerTimeOutSec}秒経ったので△の勝ちー`;
  else if (board.winner == 12)
    messageObj.innerText = '漁夫の利を得た△の勝ちー';
  // console.log(board.alreadyPut + "個置かれた");
}

function init(nTiles, nPlayer, sec)
{
  board = new Board(nTiles, nPlayer);
  cellObjs = new Array(nTiles);
  for (let i = 0; i < nTiles; i++)
  {
    cellObjs[i] = new Array(nTiles);
    for (let j = 0; j < nTiles; j++)
    {
      let cellId = `${i}${j}`;
      cellObjs[i][j] = document.getElementById(cellId);
      cellObjs[i][j].onclick = (e) => onClick(i, j);
    }
  }

  messageObj = document.getElementById('message');
  playerTimeOutId = -1;
  playerTimeOutSec = sec;
}



init(3, 2, 5.0);
