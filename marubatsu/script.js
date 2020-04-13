
var messageObj;
var cellObjs;
var cells;
var gameOver;


function onClick(row, column)
{
  if (winner != 0) return;
  if (cells[row][column] != 0) return;

  cells[row][column] = 1;

  judge();
  refresh();

  if (winner != 0) return;
  
  putRandom();
}

function putRandom()
{
  let kouho = [];
  for (let i = 0; i < 3; i++)
  {
    for (let j = 0; j < 3; j++)
    {
      if (cells[i][j] == 0)
        kouho.push([i,j]);
    }
  }
  let rnd = Math.floor(Math.random() * kouho.length);
  cells[kouho[rnd][0]][kouho[rnd][1]] = 2;

  judge();
  refresh();
}

function judge()
{
  if (judge1(1)) winner = 1;
  else if (judge1(2)) winner = 2;
}

function judge1(p)
{
  let N = 3;
  for (let i = 0; i < N; i++)
  {
    let rowComp = true;
    for (let j = 0; j < N; j++)
    {
      rowComp = rowComp && (cells[i][j] == p);
    }
    if (rowComp) return true;
  }

  for (let j = 0; j < N; j++)
  {
    let colComp = true;
    for (let i = 0; i < N; i++)
    {
      colComp = colComp && (cells[i][j] == p);
    }
    if (colComp) return true;
  }

  let ldComp = true;
  let luComp = true;
  for (let i = 0; i < N; i++)
  {
    ldComp = ldComp && (cells[i][i] == p);
    luComp = luComp && (cells[i][N-1-i] == p);
  }
  if (ldComp || luComp) return true;
}

function refresh()
{
  for (let i = 0; i < 3; i++)
  {
    for (let j = 0; j < 3; j++)
    {
      if (cells[i][j] == 0)
        cellObjs[i][j].innerText = '';
      else if (cells[i][j] == 1)
        cellObjs[i][j].innerText = '○';
      else if (cells[i][j] == 2)
        cellObjs[i][j].innerText = '×';
    }
  }

  if (winner == 1)
    messageObj.innerText = '○の勝ちー';
  else if (winner == 2)
    messageObj.innerText = '×の勝ちー';
}

function init(N)
{
  cellObjs = new Array(N);
  cells = new Array(N);

  for (let i = 0; i < N; i++)
  {
    cellObjs[i] = new Array(N);
    cells[i] = new Array(N);

    for (let j = 0; j < N; j++)
    {
      cells[i][j] = 0;
      let cellId = "" + i + j;
      cellObjs[i][j] = document.getElementById(cellId);
      cellObjs[i][j].onclick = (e) => onClick(i, j);
    }
  }

  messageObj = document.getElementById('message');
  winner = 0;
}


init(3);
