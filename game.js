
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;
//Load images
const char = new Image(); char.src = 'assets/character/char.png';
const bg   = new Image(); bg.src   = 'assets/background/Bg-5.png';
const tobs = new Image(); tobs.src = 'assets/obstacles/top obs.png';
const bobs = new Image(); bobs.src = 'assets/obstacles/bottom obs.png';

//Game state 
let score = 100;
let gamerunning = false;


const minScore=75;
const penalty=5;
const imagew = 100;
const imageh = 100;
let charY = (canvas.height - imageh) / 3;
let velocity = 0;
const gravity = 0.5;
const jumpStrength = -5;

let obstacles = [];
const obstacleWidth = 200;
const obstacleGap = 150;
const obstacleSpeed = 3;

let frameCount = 0;

// Image loading 
let imagesLoaded = 0;
const totalImages = 4;
function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    console.log('All images loaded');
    gamerunning = true;
    frameCount = 0;
    gameloop();
  }
}
[bg, char, tobs, bobs].forEach(img => img.onload = imageLoaded);

// Input 
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gamerunning) {
    velocity = jumpStrength;
  }
});
document.addEventListener('touchstart', (e) => {
    if(e.code === 'touchstart' && gamerunning){ 
        velocity = jumpStrength;
    }   
});

// Spawn obstacle 
function spawnObstacle() {
  const minHeight = 50;
  const maxHeight = canvas.height - obstacleGap - 100;
  const topH = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  obstacles.push({
    top: {
      x: canvas.width,
      y: 0,
      width: obstacleWidth,
      height: topH
    },
    bottom: {
      x: canvas.width,
      y: topH + obstacleGap,
      width: obstacleWidth,
      height: canvas.height - (topH + obstacleGap)
    },
    passed: false
  });
}

//  Game over 
function gameOver() {
  gamerunning = false;
  alert(`Game Over! Your Attendance is below 75% \nRefresh to play again.`);
}

//  Main loop 
function gameloop() {
  if (!gamerunning) return;

  //Physics
  velocity += gravity;
  charY += velocity;

  if (charY + imageh > canvas.height) {
    charY = canvas.height - imageh;
    gameOver();
    return;
  }
  if (charY < 0) {
    charY = 0;
    velocity = 0;
  }

  // Obstacles 
  frameCount++;
  if (frameCount % 90 === 0) spawnObstacle();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.top.x -= obstacleSpeed;
    o.bottom.x -= obstacleSpeed;

    if (o.top.x + obstacleWidth < 0) obstacles.splice(i, 1);
  }

  //  Collision
  const padding = 40; // Shrink hitbox for fair collisions
  const charRect = {
    x: canvas.width / 2 - imagew / 2 + padding,
    y: charY + padding,
    width: imagew - padding * 2,
    height: imageh - padding * 2
  };

  for (const obs of obstacles) {
    const top = {
      x: obs.top.x + 5,
      y: obs.top.y,
      width: obs.top.width - 10,
      height: obs.top.height
    };
    const bottom = {
      x: obs.bottom.x + 15,
      y: obs.bottom.y,
      width: obs.bottom.width - 30,
      height: obs.bottom.height
    };

    const hitTop =
      charRect.x < top.x + top.width &&
      charRect.x + charRect.width > top.x &&
      charRect.y < top.y + top.height &&
      charRect.y + charRect.height > top.y;

    const hitBottom =
      charRect.x < bottom.x + bottom.width &&
      charRect.x + charRect.width > bottom.x &&
      charRect.y < bottom.y + bottom.height &&
      charRect.y + charRect.height > bottom.y;

      if (hitTop || hitBottom) {
        score -= penalty;

        // Ensure the game ends only if score drops below minScore
        if (score < minScore) {
            gameOver();
            return;
        }
    }

    // Scoring for passing obstacle
    if (!obs.passed && charRect.x > top.x + top.width) {
        obs.passed = true;
    }
  }

  // Draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // Character
  ctx.drawImage(char, canvas.width / 2 - imagew / 2, charY, imagew, imageh);

  // Obstacles
  for (const o of obstacles) {
    ctx.drawImage(tobs, o.top.x, o.top.y, o.top.width, o.top.height);
    ctx.drawImage(bobs, o.bottom.x, o.bottom.y, o.bottom.width, o.bottom.height);
  }

  // Score display
  ctx.fillStyle = 'black';
  ctx.font = '30px Arial';
  ctx.fillText(`Attendance: ${score}`, 10, 50);


  /*ctx.strokeStyle = 'red';
  ctx.strokeRect(charRect.x, charRect.y, charRect.width, charRect.height);
  for (const obs of obstacles) {
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(obs.top.x + 15, obs.top.y, obs.top.width - 30, obs.top.height);
    ctx.strokeRect(obs.bottom.x + 15, obs.bottom.y, obs.bottom.width - 30, obs.bottom.height);
  }
  */
  

  requestAnimationFrame(gameloop);
}
