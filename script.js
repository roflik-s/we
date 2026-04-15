oldown > 0) this.cooldown--;

        if (this.cooldown === 0) {
            bossBullets.push(new BossBullet(this.x + 100, this.y + 100, currentHero));
            this.cooldown = 65;
        }
    }

    draw() {
        if (bossImg) {
            ctx.drawImage(bossImg, this.x, this.y, 210, 210);
        } else {
            ctx.fillStyle = "#9933ff";
            ctx.fillRect(this.x, this.y, 200, 200);
        }
    }
}

/***************************************************
ЭФФЕКТ ПОПАДАНИЯ
***************************************************/

class HitEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.life = 18;
    }

    update() {
        this.radius += 1.8;
        this.life--;
    }

    draw() {
        ctx.strokeStyle = "rgba(255, 180, 0, 0.9)";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

/***************************************************
ИНИЦИАЛИЗАЦИЯ
***************************************************/

let hero1 = new Hero("Кай", "red", hero1Img);
let hero2 = new Hero("Рен", "blue", hero2Img);
let currentHero = hero1;
let drone = new Drone(droneImg);

function spawnFruit() {
    if (!boss && fruits.length < 35) {
        fruits.push(new Fruit());
    }
}

setInterval(spawnFruit, 480);

/***************************************************
GAME LOOP
***************************************************/

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    }

    currentHero.update();
    currentHero.draw();

    drone.update(currentHero);
    drone.draw();

    // Спавн босса
    if (!boss && fruits.length > 28) {
        boss = new Boss();
    }

    // Обновление и фильтрация фруктов
    fruits = fruits.filter(f => {
        f.update(currentHero);
        if (f.hp > 0) {
            f.draw();
            return true;
        } else {
            effects.push(new HitEffect(f.x + f.size/2, f.y + f.size/2));
            return false;
        }
    });

    // Пули героя
    bullets.forEach(b => {
        b.update();
        b.draw();
    });
    bullets = bullets.filter(b => b.x < canvas.width + 100);

    // Пули дроида (главное исправление)
    droneBullets = droneBullets.filter(b => {
        b.update();
        if (!b.hit) b.draw();
        return !b.hit;
    });

    // Пули босса
    bossBullets.forEach(b => {
        b.update();
        b.draw();
    });
    bossBullets = bossBullets.filter(b => b.x > -100 && b.x < canvas.width + 100);

    // Эффекты
    effects = effects.filter(e => {
        e.update();
        e.draw();
        return e.life > 0;
    });

    // Босс
    if (boss) {
        boss.update();
        boss.draw();

        if (boss.hp <= 0) {
            gameOver = true;
            alert("🎉 ПОБЕДА! Ты собрал урожай!");
            return;
        }
    }

    // Проверка поражения
    if (currentHero.hp <= 0) {
        gameOver = true;
        alert("💥 ПОРАЖЕНИЕ");
        return;
    }

    // UI
    document.getElementById("heroName").textContent = currentHero.name;
    document.getElementById("heroHP").textContent = Math.max(0, currentHero.hp);

    requestAnimationFrame(update);
}

update();

/***************************************************
INPUT
***************************************************/

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;

    if (e.key === " ") {
        e.preventDefault();
        bullets.push(new Bullet(
            currentHero.x + currentHero.width - 5,
            currentHero.y + 32
        ));
    }

    if (e.key.toLowerCase() === "q") {
        currentHero = currentHero === hero1 ? hero2 : hero1;
    }
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// Поддержка изменения размера окна
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
