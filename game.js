class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        this.isGameOver = false;

        // 加载蛇的图片
        this.snakeImages = {
            head: new Image(),
            body: new Image(),
            tail: new Image()
        };

        this.snakeImages.head.src = 'images/snake-head.png';
        this.snakeImages.body.src = 'images/snake-body.png';
        this.snakeImages.tail.src = 'images/snake-tail.png';

        // 绑定按键事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', this.startGame.bind(this));
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        const newDirection = keyMap[event.key];
        if (!newDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.direction = newDirection;
        }
    }

    update() {
        const head = {...this.snake[0]};

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查是否撞墙
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // 检查是否撞到自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 保存当前上下文状态
            this.ctx.save();
            
            // 移动到蛇段的位置
            this.ctx.translate(x + this.gridSize/2, y + this.gridSize/2);
            
            // 根据方向旋转
            let rotation = 0;
            if (index === 0) { // 头部
                switch(this.direction) {
                    case 'up': rotation = -Math.PI/2; break;
                    case 'down': rotation = Math.PI/2; break;
                    case 'left': rotation = Math.PI; break;
                    case 'right': rotation = 0; break;
                }
            } else if (index === this.snake.length - 1) { // 尾部
                const prevSegment = this.snake[index - 1];
                if (prevSegment.x < segment.x) rotation = 0;
                else if (prevSegment.x > segment.x) rotation = Math.PI;
                else if (prevSegment.y < segment.y) rotation = -Math.PI/2;
                else if (prevSegment.y > segment.y) rotation = Math.PI/2;
            } else { // 身体
                const prevSegment = this.snake[index - 1];
                const nextSegment = this.snake[index + 1];
                if (prevSegment.x === nextSegment.x) {
                    rotation = prevSegment.y < segment.y ? -Math.PI/2 : Math.PI/2;
                } else {
                    rotation = prevSegment.x < segment.x ? 0 : Math.PI;
                }
            }
            
            this.ctx.rotate(rotation);
            
            // 绘制蛇段
            if (index === 0) {
                this.ctx.drawImage(this.snakeImages.head, -this.gridSize/2, -this.gridSize/2, this.gridSize, this.gridSize);
            } else if (index === this.snake.length - 1) {
                this.ctx.drawImage(this.snakeImages.tail, -this.gridSize/2, -this.gridSize/2, this.gridSize, this.gridSize);
            } else {
                this.ctx.drawImage(this.snakeImages.body, -this.gridSize/2, -this.gridSize/2, this.gridSize, this.gridSize);
            }
            
            // 恢复上下文状态
            this.ctx.restore();
        });

        // 绘制食物
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        alert(`游戏结束！得分：${this.score}`);
        document.getElementById('startBtn').textContent = '重新开始';
    }

    startGame() {
        // 重置游戏状态
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.isGameOver = false;
        this.food = this.generateFood();
        document.getElementById('score').textContent = this.score;
        document.getElementById('startBtn').textContent = '游戏进行中';

        // 清除之前的游戏循环
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // 开始新的游戏循环
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }
}

// 初始化游戏
const game = new SnakeGame(); 