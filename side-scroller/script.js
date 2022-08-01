window.addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener("keydown", (event) => {
                if (
                    (event.key === "ArrowDown" ||
                        event.key === "ArrowUp" ||
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowRight") &&
                    this.keys.indexOf(event.key) === -1
                ) {
                    this.keys.push(event.key);
                }
            });
            window.addEventListener("keyup", (event) => {
                if (
                    event.key === "ArrowDown" ||
                    event.key === "ArrowUp" ||
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowRight"
                ) {
                    this.keys.splice(this.keys.indexOf(event.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = playerImage;
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.maxFrame = 8;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
        }
        draw(context) {
   
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        update(input, deltaTime, enemies) {
            // collision
            enemies.forEach((enemy) => {
                const dx =
                    enemy.x + enemy.width / 2 - (this.x + this.width / 2);
                const dy =
                    enemy.y + enemy.height / 2 - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true;
                }
            });

            // animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // horizontal movement
            this.x += this.speed;
            if (input.keys.indexOf("ArrowRight") > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf("ArrowLeft") > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
                this.vy -= 30;
            } else {
                this.speed = 0;
            }
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width)
                this.x = this.gameWidth - this.width;

            // vertical movement
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height)
                this.y = this.gameHeight - this.height;
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = backgroundImage;
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 700;
            this.speed = 5;
        }
        draw(context) {
            context.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
            context.drawImage(
                this.image,
                this.x + this.width,
                this.y,
                this.width,
                this.height
            );
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameHeight = gameHeight;
            this.gameWidth = gameWidth;
            this.width = 160;
            this.height = 119;
            this.image = enemyImage;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedForDeletion = false;
        }
        draw(context) {
        
            context.drawImage(
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1000 + 500;
            console.log(enemies);
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach((enemy) => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
    }

    function displayStatusText(context) {
        context.font = "40px Helvetica";
        context.fillStyle = "black";
        context.fillText("Score: " + score, 20, 50);
        context.fillStyle = "white";
        context.fillText("Score: " + score, 22, 52);
        if (gameOver) {
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText("GAME OVER! try again", canvas.width / 2, 200);
            context.fillStyle = "white";
            context.fillText("GAME OVER! try again", canvas.width / 2, 202);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        // background.update()
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }
    animate(0);
});