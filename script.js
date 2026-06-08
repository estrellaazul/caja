
const canvas = document.getElementById("battleCanvas");
const ctx = canvas.getContext("2d");

// CONFIGURACIONES Y VARIABLES DE ENTORNO
let player, drops, bullets, storm;
let keys = {};
let gameActive = false;
let isLooting = false;
let score = 0;
let hp = 100;
let timeRemaining = 60;
let clockInterval;

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

function initGame() {
    player = { x: 400, y: 250, size: 12, speed: 4 };
    
    // Distribución de las cajas de loot en el mapa vinculadas a las trivias de PHP
    drops = [
        { x: 150, y: 150, size: 16, active: true, trivia: trivias[0] },
        { x: 650, y: 130, size: 16, active: true, trivia: trivias[1] },
        { x: 200, y: 400, size: 16, active: true, trivia: trivias[2] },
        { x: 600, y: 380, size: 16, active: true, trivia: trivias[3] }
    ];
    
    bullets = [];
    storm = { x: 400, y: 250, radius: 320 };
    
    hp = 100;
    score = 0;
    timeRemaining = 60;
    isLooting = false;
    gameActive = true;

    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");

    clearInterval(clockInterval);
    clockInterval = setInterval(() => {
        if(gameActive && !isLooting) {
            timeRemaining--;
           document.getElementById("storm-timer").innerText = `ZONA SEGURA: ${timeRemaining}s`;
            
            // Simulación de Free Fire: El círculo se reduce a los 45 segundos
            if(timeRemaining <= 45) storm.radius = Math.max(storm.radius - 7, 130);
            
            spawnRounds();
            if(timeRemaining <= 0) finishGame(score >= 3);
        }
    }, 1000);

    requestAnimationFrame(gameLoop);
}

function spawnRounds() {
    for (let i = 0; i < 3; i++) {
        bullets.push({
            x: Math.random() * canvas.width,
            y: 0,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 3,
            size: 5
        });
    }
}

function gameLoop() {
    if (!gameActive) return;
    if (!isLooting) {
        updateMovement();
        checkCollisions();
    }
    render();
    requestAnimationFrame(gameLoop);
}

function updateMovement() {
    if (keys["arrowup"] || keys["w"]) player.y = Math.max(player.size, player.y - player.speed);
    if (keys["arrowdown"] || keys["s"]) player.y = Math.min(canvas.height - player.size, player.y + player.speed);
    if (keys["arrowleft"] || keys["a"]) player.x = Math.max(player.size, player.x - player.speed);
    if (keys["arrowright"] || keys["d"]) player.x = Math.min(canvas.width - player.size, player.x + player.speed);
}

function checkCollisions() {
    // Daño de la Tormenta
    let dx = player.x - storm.x;
    let dy = player.y - storm.y;
    if (Math.sqrt(dx * dx + dy * dy) > storm.radius) {
        hp -= 0.5;
        document.getElementById("hp-bar").style.width = Math.max(0, hp) + "%";
    }

    // Impacto de proyectiles
    for(let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        let bDx = player.x - b.x;
        let bDy = player.y - b.y;
        if(Math.sqrt(bDx * bDx + bDy * bDy) < player.size + b.size) {
            hp -= 20;
            document.getElementById("hp-bar").style.width = Math.max(0, hp) + "%";
            bullets.splice(i, 1);
        } else if(b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    if(hp <= 0) finishGame(false);

    // Tocar caja de suministros
    drops.forEach(drop => {
        if(drop.active) {
            let dDx = player.x - drop.x;
            let dDy = player.y - drop.y;
            if(Math.sqrt(dDx * dDx + dDy * dDy) < player.size + drop.size) {
                openLoot(drop);
            }
        }
    });
}

let currentDrop = null;
function openLoot(drop) {
    isLooting = true;
    currentDrop = drop;
    document.getElementById("question-text").innerText = drop.trivia.q;
    document.getElementById("loot-modal").style.display = "block";
}

function answerLoot(playerAnswer) {
    document.getElementById("loot-modal").style.display = "none";
    isLooting = false;
    
    if(currentDrop) {
        currentDrop.active = false;
        if(playerAnswer === currentDrop.trivia.a) {
            score++;
            document.getElementById("score-txt").innerText = `${score}/4`;
            if(hp < 80) hp += 20; // Recompensa de curación
        } else {
            hp -= 25; // Castigo por fallo de concepto
        }
        document.getElementById("hp-bar").style.width = Math.max(0, hp) + "%";
    }
    if(hp <= 0) finishGame(false);
    if(score === 4) finishGame(true);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo fuera de zona segura (Tormenta Roja)
    ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Área segura limpia
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Línea de borde de zona segura
    ctx.beginPath();
    ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 255, 102, 0.6)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Dibujar Drops
    drops.forEach(drop => {
        if(drop.active) {
            ctx.fillStyle = "var(--secondary)";
            ctx.fillRect(drop.x - drop.size/2, drop.y - drop.size/2, drop.size, drop.size);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(drop.x - drop.size/2, drop.y - drop.size/2, drop.size, drop.size);
        }
    });

    // Dibujar Balas
    ctx.fillStyle = "#ffcc00";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Dibujar Jugador
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
}

function finishGame(victory) {
    gameActive = false;
    clearInterval(clockInterval);
    const screen = document.getElementById("end-screen");
    document.getElementById("loot-modal").style.display = "none";
    screen.classList.remove("hidden");
    
    if(victory) {
        document.getElementById("end-title").innerText = "¡BOOYAH!";
        document.getElementById("end-title").style.color = "var(--secondary)";
        document.getElementById("end-desc").innerText = `Lograste sobrevivir con todos los constructos teóricos intactos (${score}/4).`;
    } else {
        document.getElementById("end-title").innerText = "ELIMINADO";
        document.getElementById("end-title").style.color = "var(--primary)";
        document.getElementById("end-desc").innerText = "Tus esquemas colapsaron bajo la Tormenta del Olvido.";
    }
}