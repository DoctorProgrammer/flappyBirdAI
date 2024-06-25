document.addEventListener('DOMContentLoaded', function () {
    const birdElem = document.getElementById('bird');
    const background = document.getElementById('background');
    const ground = document.getElementById('ground');
    const pillarsElem = document.getElementById('pillars');

    class Game {
        constructor() {
            this.isGameOver = false;
            this.gameSpeed = 20;
            this.gravity = 0.5;
            this.bird = new Bird();
            this.loop = null;
            this.score = 0;
            this.frames = 0;
        }

        start() {
            if (!this.loop) {
                this.loop = setInterval(() => this.update(), this.gameSpeed);
            }
            document.addEventListener('keydown', this.jump.bind(this));
        }

        update() {
            this.frames++;
            this.bird.update();
            if (this.frames % 90 === 0) {  // Adjust pipe spawning frequency
                this.generatePipes();
            }
            this.checkCollision();
        }

        jump(event) {
            if (event.code === 'Space') {
                this.bird.jump();
            }
        }

        generatePipes() {
            let pipe = new Pipe();
            pillarsElem.appendChild(pipe.element);
        }

        checkCollision() {
            let obstacles = document.getElementsByClassName('obstacle');
            // check if bird touches one of the obstacles
            for (let i = 0; i < obstacles.length; i++) {
                if (this.bird.hits(obstacles[i])) {
                    this.endGame();
                    break;
                }
            }
        }

        endGame() {
            clearInterval(this.loop);
            this.loop = null;
            console.log("Game Over!");
            document.removeEventListener('keydown', this.jump);
            let pillars = document.getElementsByClassName('pillar');
            for (let i = 0; i < pillars.length; i++) {
                pillars[i].style.animationPlayState = 'paused';
            }
            ground.style.animationPlayState = 'paused';
            background.style.animationPlayState = 'paused';
            this.isGameOver = true;
        }
    }

    class Bird {
        constructor() {
            this.position = 250;
            this.velocity = 0;
            birdElem.style.top = this.position + 'px';
        }

        update() {
            this.velocity += game.gravity;
            this.position += this.velocity;
            birdElem.style.top = this.position + 'px';
            birdElem.style.transform = 'rotate(' + Math.min((this.velocity / 20) * 90, 90) + 'deg)';
        }

        jump() {
            this.velocity = -10;
        }

        hits(obstacle) {
            let birdRect = birdElem.getBoundingClientRect();
            let obstacleRect = obstacle.getBoundingClientRect();
            return birdRect.left < obstacleRect.right &&
                birdRect.right > obstacleRect.left &&
                birdRect.top < obstacleRect.bottom &&
                birdRect.bottom > obstacleRect.top;
        }
    }

    class Pipe {
        constructor() {
            this.element = this.createElement();
        }

        createElement() {
            let element = document.createElement('div');
            element.className = 'pillar';
            let topPillar = document.createElement('img');
            topPillar.src = './IMG/pillar.png';
            topPillar.classList.add('obstacle');
            let bottomPillar = document.createElement('img');
            bottomPillar.src = './IMG/pillar.png';
            bottomPillar.classList.add('obstacle');
            element.appendChild(topPillar);
            element.appendChild(bottomPillar);
            element.style.top = Math.floor(Math.random() * 300) - 300 + 'px'; // Adjusted for top pipe height
            return element;
        }
    }

    const game = new Game();
    game.start();
});
