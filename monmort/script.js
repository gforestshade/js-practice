'use strict';

///////////////// gloval functions /////////////////////
function OnClicked()
{
  const N = document.input.N.value;
  const tileContObj = document.getElementById('tile-container');
  const messageObj = document.getElementById('message');
  
  tileContObj.innerText = '';
  tileContObj.style.gridTemplate = `repeat(${N}, 80px) / repeat(${N}, 80px)`;

  let {d, g} = furiwake(N, 100);

  for (let i = 0; i < N; i++)
  {
    for (let j = 0; j < N; j++)
    {
      let cell = document.createElement('div');
      cell.innerText = g[i][j] + 1;
      cell.className = 'cell z-depth-2';
      tileContObj.appendChild(cell);
    }
  }

  messageObj.innerText = `スコア: ${d}`;
}

function shuffle(a)
{
  for (let i = a.length - 1; i > 1; i--)
  {
    const rnd = Math.floor(Math.random() * i);
    [a[rnd], a[i-1]] = [a[i-1], a[rnd]];
  }
}

function clone2d(a, m, n)
{
  return init2d(m, n, (i, j) => a[i][j]);
}

function init2d(m, n, gen)
{
  let a = new Array(m);
  for (let i = 0; i < m; i++)
  {
    a[i] = new Array(n);
    for (let j = 0; j < n; j++)
    {
      a[i][j] = gen(i, j);
    }
  }
  return a;
}

function furiwake(n, loop_count)
{
  let g = init2d(n, n, (i, j) => j);
  let min_g = null;

  let r = new Array(n-1);
  for(let i = 0; i < n; i++)
  {
    r[i] = i + 1;
  }

  let min_d = n;
  for (let l = 0; l < loop_count; l++)
  {
    shuffle(r);
    let d = 0;
    let bucket = new Array(n);
    for (let i = 0; i < n; i++)
    {
      bucket[i] = 0;
    }

    for (let i = 1; i < n; i++)
    {
      const from = g[i-1].indexOf(r[i-1]);
      if (bucket[from]++ > 0) d++;
      for (let j = 0; j < n; j++)
      {
        g[i][j] = (r[i-1] + j) % n;
      }
    }

    if (d < min_d)
    {
      min_d = d;
      min_g = clone2d(g, n, n);
    }
  }

  return {d: min_d, g: min_g};
}
