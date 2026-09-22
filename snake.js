(function(){
  var canvas = document.getElementById('snake-canvas');
  var ctx = canvas.getContext('2d');
  var cols = 20, rows = 20, cell = 20;
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var hintEl = document.getElementById('hint');
  var restartBtn = document.getElementById('restart');

  var best = 0;
  try { best = parseInt(localStorage.getItem('snakeBest'), 10) || 0; } catch (e) {}
  bestEl.textContent = best;

  var snake, dir, nextDir, food, score, running, started, tickMs, timer;

  function reset(){
    snake = [{x:9,y:10},{x:8,y:10},{x:7,y:10}];
    dir = {x:1,y:0};
    nextDir = dir;
    score = 0;
    tickMs = 130;
    running = false;
    started = false;
    scoreEl.textContent = score;
    hintEl.textContent = 'Press an arrow key (or W A S D) to start!';
    placeFood();
    draw();
  }

  function placeFood(){
    var free = [];
    for (var x = 0; x < cols; x++){
      for (var y = 0; y < rows; y++){
        if (!snake.some(function(s){ return s.x === x && s.y === y; })){
          free.push({x:x,y:y});
        }
      }
    }
    food = free[Math.floor(Math.random() * free.length)];
  }

  function drawCell(x, y, color, radius){
    ctx.fillStyle = color;
    var px = x * cell, py = y * cell, r = radius || 5;
    ctx.beginPath();
    ctx.moveTo(px + r, py);
    ctx.arcTo(px + cell, py, px + cell, py + cell, r);
    ctx.arcTo(px + cell, py + cell, px, py + cell, r);
    ctx.arcTo(px, py + cell, px, py, r);
    ctx.arcTo(px, py, px + cell, py, r);
    ctx.closePath();
    ctx.fill();
  }

  function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e3fbf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCell(food.x, food.y, '#ff5c5c', 8);

    snake.forEach(function(seg, i){
      drawCell(seg.x, seg.y, i === 0 ? '#0e7c86' : '#3fae5e', 6);
    });

    if (!running && started){
      ctx.fillStyle = 'rgba(28,34,48,.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '16px sans-serif';
      ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    }
  }

  function tick(){
    dir = nextDir;
    var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(function(s){ return s.x === head.x && s.y === head.y; })){
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y){
      score++;
      scoreEl.textContent = score;
      if (score > best){
        best = score;
        bestEl.textContent = best;
        try { localStorage.setItem('snakeBest', String(best)); } catch (e) {}
      }
      placeFood();
      if (tickMs > 60) tickMs -= 3;
      clearInterval(timer);
      timer = setInterval(tick, tickMs);
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver(){
    running = false;
    clearInterval(timer);
    hintEl.textContent = 'Press Space or the button below to play again!';
    draw();
  }

  function start(initialDir){
    if (running) return;
    reset();
    if (initialDir){
      dir = initialDir;
      nextDir = initialDir;
    }
    running = true;
    started = true;
    hintEl.textContent = 'Good luck out there!';
    clearInterval(timer);
    timer = setInterval(tick, tickMs);
  }

  var KEY_DIR = {
    ArrowUp: {x:0,y:-1}, w: {x:0,y:-1}, W: {x:0,y:-1},
    ArrowDown: {x:0,y:1}, s: {x:0,y:1}, S: {x:0,y:1},
    ArrowLeft: {x:-1,y:0}, a: {x:-1,y:0}, A: {x:-1,y:0},
    ArrowRight: {x:1,y:0}, d: {x:1,y:0}, D: {x:1,y:0}
  };

  window.addEventListener('keydown', function(e){
    var d = KEY_DIR[e.key];
    if (!d) {
      if (e.key === ' ' && !running) start();
      return;
    }
    e.preventDefault();
    if (!started){ start(d); return; }
    if (!running) { start(d); return; }
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  });

  restartBtn.addEventListener('click', function(){ start(); });

  var touchStart = null;
  canvas.addEventListener('touchstart', function(e){
    var t = e.changedTouches[0];
    touchStart = {x: t.clientX, y: t.clientY};
  });
  canvas.addEventListener('touchend', function(e){
    if (!touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    var d;
    if (Math.abs(dx) > Math.abs(dy)) d = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
    else d = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
    if (!started || !running){ start(d); return; }
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
    touchStart = null;
  });

  reset();
})();
