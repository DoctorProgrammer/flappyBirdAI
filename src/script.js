document.addEventListener('DOMContentLoaded', function () {
    const bird = new Bird();
    const game = new Game(bird);

    document.addEventListener('keydown', function (event) {
        if (event.key === ' ') {
            if (!game.started) {
                game.started = true;
                game.start();
            } else if (!game.over) {
                bird.jump();
            } else {
                game.reset();
            }
        }
    });
});

class Game {
    constructor(bird) {
        this._game = document.getElementById('game-window');
        this._bird = bird;
        this._lastTime = 0;
        this._started = false;
        this._over = false;
        this._ground = document.getElementById('ground');
        this._pillars = [];
        this._score = 0;
        this._scoreElement = document.getElementById('score');
    }

    start() {
        this._lastTime = Date.now();
        this._gameLoop();
        this._spawnPillar();
        document.getElementById('ground').style.animationPlayState = 'running';
        document.getElementById('background').style.animationPlayState = 'running';
    }

    _gameLoop() {
        if (!this._over) {
            const currentTime = Date.now();
            const deltaTime = currentTime - this._lastTime;
            this._lastTime = currentTime;

            this._update(deltaTime);
            this._checkCollisions();

            requestAnimationFrame(() => this._gameLoop());
        }
    }

    _update(deltaTime) {
        this._bird.y += this._bird.yVelocity * deltaTime * 0.01;
        this._bird.yVelocity += this._bird.gravity;

        if (this._bird.y > this._ground.offsetTop - this._bird.height) {
            this._bird.y = this._ground.offsetTop - this._bird.height;
            this._bird.yVelocity = 0;
            this._gameOver();
        }

        this._pillars.forEach(pillar => pillar.update(deltaTime));
        this._pillars = this._pillars.filter(pillar => !pillar.offscreen());
    }

    _spawnPillar() {
        if (this._over) return;

        const pillar = new Pillar();
        this._pillars.push(pillar);

        setTimeout(() => this._spawnPillar(), 2000);
    }

    _checkCollisions() {
        this._pillars.forEach(pillar => {
            if (pillar.collidesWith(this._bird)) {
                this._gameOver();
            } else if (pillar.passed(this._bird) && !pillar.passedBird) {
                this._score++;
                this._scoreElement.textContent = this._score;
                pillar.passedBird = true;
            }
        });
    }

    _gameOver() {
        this._over = true;
        document.getElementById('ground').style.animationPlayState = 'paused';
        document.getElementById('background').style.animationPlayState = 'paused';
        this._pillars.forEach(pillar => pillar.pause());
    }

    reset() {
        this._bird.reset();
        this._started = false;
        this._over = false;
        this._score = 0;
        this._scoreElement.textContent = this._score;
        this._pillars.forEach(pillar => pillar.remove());
        this._pillars = [];
        document.getElementById('ground').style.animationPlayState = 'paused';
        document.getElementById('background').style.animationPlayState = 'paused';
    }

    get started() {
        return this._started;
    }

    set started(value) {
        this._started = value;
    }

    get over() {
        return this._over;
    }
}

class Bird {
    constructor() {
        this._bird = document.getElementById('bird');
        this._bird.style.position = 'absolute';
        this._gravity = 2.5;
        this._jumpStrength = -55;
        this.reset();
    }

    jump() {
        if(this._yVelocity > 100) {
            this._yVelocity = 100
        } else if (this._yVelocity <= this._jumpStrength) {
            this.yVelocity = this._jumpStrength
        } else {
            this._yVelocity += this._jumpStrength * (100 - this._yVelocity) / 100;
        }
    }

    reset() {
        this._yVelocity = 0;
        this._y = window.innerHeight / 2;
        this._bird.style.top = this._y + 'px';
        this._bird.style.transform = 'rotate(0deg)';
    }

    get y() {
        return parseFloat(this._bird.style.top);
    }

    set y(value) {
        this._bird.style.top = value + 'px';
        this._y = value;
        this._bird.style.transform = `rotate(${this._yVelocity * 0.5}deg)`;
    }

    get yVelocity() {
        return this._yVelocity;
    }

    set yVelocity(value) {
        this._yVelocity = value;
    }

    get gravity() {
        return this._gravity;
    }

    get height() {
        return this._bird.offsetHeight;
    }
}

class Pillar {
    constructor() {
        const template = document.getElementById('pillar-template').innerHTML;
        const container = document.createElement('div');
        container.innerHTML = template;
        this._pillarContainer = container.firstElementChild;

        const [pillarTop, pillarBottom] = this._pillarContainer.querySelectorAll('.pillar');
        this._pillarTop = pillarTop;
        this._pillarBottom = pillarBottom;

        const gap = 200;
        const maxHeight = window.innerHeight - gap;
        const pillarHeight = Math.random() * (maxHeight - 100) + 50;

        this._pillarTop.style.height = pillarHeight + 'px';
        this._pillarBottom.style.height = (maxHeight - pillarHeight) + 'px';
        this._pillarBottom.style.top = (pillarHeight + gap) + 'px';

        document.getElementById('game-window').appendChild(this._pillarContainer);

        this._pillarContainer.style.position = 'absolute';
        this._pillarContainer.style.top = '0';
        this._pillarContainer.style.left = '100vw'; // Start off-screen to the right
        this._pillarContainer.style.width = '100px';
        this._pillarContainer.style.display = 'flex';
        this._pillarContainer.style.flexDirection = 'column';
        this._pillarContainer.style.zIndex = '1'; // Ensure pillars are in front of the background but behind the bird

        this._pillarContainer.style.animation = 'move-pillar 5s linear forwards';
    }

    pause() {
        this._pillarContainer.style.animationPlayState = 'paused';
    }

    offscreen() {
        const rect = this._pillarContainer.getBoundingClientRect();
        return rect.right < 0;
    }

    collidesWith(bird) {
        const birdRect = bird._bird.getBoundingClientRect();
        const topRect = this._pillarTop.getBoundingClientRect();
        const bottomRect = this._pillarBottom.getBoundingClientRect();

        return (birdRect.left < topRect.right && birdRect.right > topRect.left && birdRect.top < topRect.bottom && birdRect.bottom > topRect.top) ||
            (birdRect.left < bottomRect.right && birdRect.right > bottomRect.left && birdRect.top < bottomRect.bottom && birdRect.bottom > bottomRect.top);
    }

    passed(bird) {
        const rect = this._pillarTop.getBoundingClientRect();
        return rect.right < bird._bird.getBoundingClientRect().left;
    }

    remove() {
        this._pillarContainer.remove();
    }

    update(deltaTime) {
        const rect = this._pillarContainer.getBoundingClientRect();
        if (rect.right > 0) {
            this._pillarContainer.style.left = `${rect.left - deltaTime * 0.1}px`;
        }
    }
}
