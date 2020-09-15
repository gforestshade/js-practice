'use strict';

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
  
  const vList = board.getVacantList();
  const nextPlayer = board.nextPlayer(turnPlayer);
  for (const v of vList)
  {
    let newBoard = board.clone();
    newBoard.cells[v[0]][v[1]] = turnPlayer;
    newBoard.alreadyPut++;
    const mm = dfs(newBoard, me, nextPlayer, leftDepth - 1);

    if ((turnPlayer == me && mm.score > m.score) || (turnPlayer != me && mm.score < m.score))
    {
      m.score = mm.score;
      m.move = [v];
    }
    else if (mm.score == m.score)
    {
      m.move.push(v);
    }
  }
  return m;
}

function asyncTimeOut(tick)
{
  return new Promise(resolve => setTimeout(resolve, tick));
}



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
    else if (this.nTiles == 3 && this.alreadyPut == 1)
    {
      return randomChoice([[0,0],[0,2],[2,0],[2,2]]);
    }
    else
    {
      const depth = this.nTiles * this.nTiles - this.alreadyPut;
      const {move} = dfs(this, p, p, depth);
      return randomChoice(move);
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


class StatusMessage
{
  constructor(sec)
  {
    this.message = {
      1: '○の勝ちー',
      2: '×の勝ちー',
      11: `${sec}秒経ったので△の勝ちー`,
      12: '漁夫の利を得た△の勝ちー',
    };
  }

  getMessage(i)
  {
    return this.message[i];
  }
}


class Game
{
  refresh()
  {
    const N = this.board.nTiles;
    const texts = ['', '○', '×'];
    for (let i = 0; i < N; i++)
    {
      for (let j = 0; j < N; j++)
      {
        const c = this.board.cells[i][j];
        this.cellObjs[i][j].innerText = texts[c];
      }
    }
  }

  async waitForClick(tick, timeOut)
  {
    const nTick = timeOut * 1000 / tick;
    for (let i = 0; i < nTick; i++)
    {
      if (this.clickQueue.length > 0)
      {
        const c = this.clickQueue[0];
        this.clickQueue = [];
        return c;
      }
      await asyncTimeOut(tick);
    }
    return [-1,-1];
  }

  async mainGameLoop()
  {
    let board = this.board;
    while (true)
    {
      const [row, column] = await this.waitForClick(30, this.timeOutSec);
      
      if (row < 0 || column < 0)
      {
        if (board.alreadyPut > 0 && board.winner == 0)
        {
          board.winner = 11;
          this.refresh();
          break;
        }
        else
        {
          continue;
        }
      }
      
      if (!board.tryPut(row, column, 1)) continue;
      board.winner = board.judge();
      this.refresh();
      if (board.winner != 0) break;
      
      board.AIPut(board.putHard, 2);
      board.winner = board.judge();
      this.refresh();
      if (board.winner != 0) break;
    }
  }

  constructor(nTiles, nPlayer, timeOutSec)
  {
    this.board = new Board(nTiles, nPlayer);
    this.cellObjs = new Array(nTiles);
    this.clickQueue = [];

    for (let i = 0; i < nTiles; i++)
    {
      this.cellObjs[i] = new Array(nTiles);
      for (let j = 0; j < nTiles; j++)
      {
        let cellId = `${i}${j}`;
        this.cellObjs[i][j] = document.getElementById(cellId);
        this.cellObjs[i][j].onclick = e => this.clickQueue.push([i,j]);
      }
    }

    this.messageObj = document.getElementById('message');
    this.messageTexts = new StatusMessage(timeOutSec);
    this.timeOutSec = timeOutSec;
  }

  async go()
  {
    await this.mainGameLoop();

    const message = this.messageTexts.getMessage(this.board.winner);
    if (message) this.messageObj.innerText = message;
  }
}

let game = new Game(3, 2, 5.0);
game.go();
