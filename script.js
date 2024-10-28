const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score = 0;
let lives = 3;
let gameStarted = false;
let backgroundImage = new Image(); // 創建背景圖片變數
let timeRemaining = 60; // 倒數計時器的秒數
let timerInterval; // 用於儲存計時器的變數


const backgroundMusic = new Audio('back.mp3'); // 創建背景音樂變數
const hitSound = document.getElementById("hitSound");

const bricks = [];
initializeBricks();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    x > b.x &&
                    x < b.x + brickWidth &&
                    y > b.y &&
                    y < b.y + brickHeight
                ) {
                    dy = -dy;
                    b.hits++;
                    hitSound.play(); // 播放擊打音效
                    if (b.hits >= getRequiredHits(b.color)) {
                        b.status = 0; // 磚塊被擊碎
                        score += getScore(b.color); // 根據顏色增加分數
                    }

                    // 檢查所有磚塊是否都被擊破
                    if (checkAllBricksCleared()) {
                        alert("你贏了，恭喜！");
                        resetGame();
                        document.getElementById("restartBtn").style.display = "block";
                    }
                }
            }
        }
    }
}
function getRequiredHits(color) {
    switch (color) {
        case "#FF0000": // 紅色
            return 3;
        case "#FFFF00": // 黃色
            return 2;
        case "#00FF00": // 綠色
            return 1;
        case "#0095DD": // 藍色
            return 1;
        default:
            return 1;
    }
}

function getScore(color) {
    switch (color) {
        case "#FFFF00": // 黃色
            return 5;
        case "#FF0000": // 紅色
            return 3;
        case "#00FF00": // 綠色
            return 1;
        case "#0095DD": // 藍色
            return 1;
        default:
            return 0;
    }
}

function checkAllBricksCleared() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false; // 還有未被擊破的磚塊
            }
        }
    }
    return true; // 所有磚塊都被擊破
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    const totalBrickWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding; // 總寬度
    const startX = (canvas.width - totalBrickWidth) / 2; // 計算起始X座標以置中

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) { // 只畫出未被擊破的磚塊
                const brickX = startX + c * (brickWidth + brickPadding); // 使用startX置中
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.closePath();

                // 顯示剩下所需擊打的次數
                ctx.fillStyle = "#000";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillText(
                    getRequiredHits(b.color) - b.hits,
                    brickX + brickWidth / 2,
                    brickY + brickHeight / 2 + 5
                );
            }
        }
    }
}

function drawScore() {
    document.getElementById("scoreDisplay").textContent = "Score: " + score;
    document.getElementById("livesDisplay").textContent = "Lives: " + lives;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center"; // 使文字置中
    ctx.fillText("Score: " + score, canvas.width / 2, 20); // 置中得分
    if (score > 0 && score % 5 === 0) { // 每5分給予獎勵
        giveReward();
    }
}
function giveReward() {
    const rewardType = Math.random() < 0.5 ? "extraTime" : "extraLife"; // 隨機獎勵類型
    if (rewardType === "extraTime" && document.getElementById("mode").value === "timeChallenge") {
        timeRemaining += 10; // 增加10秒時間
    } else if (rewardType === "extraLife") {
        lives++;
    }

    // 確保每個5分的獎勵只觸發一次
    score++; // 增加一分，以避免重複觸發此獎勵
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // 繪製背景圖片
}
// 啟動遊戲繪製循環，只有在 startGame 被呼叫時才會啟動
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // 繪製背景
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                alert("遊戲結束");
                resetGame();
                document.getElementById("restartBtn").style.display = "block";
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    if (gameStarted) { // 確保只有在遊戲開始後才繼續繪製
        requestAnimationFrame(draw);
    }
}

function initializeBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: "#0095DD", hits: 0 };
        }
    }
    setRandomBrickColors(); // 設置隨機磚塊顏色
}
function setBackground() {
    const images = ['1.png', '2.png', '3.png'];
    const randomIndex = Math.floor(Math.random() * images.length);
    backgroundImage.src = images[randomIndex]; // 隨機選擇背景圖片
}
function setRandomBrickColors() {
    const colors = ["#FF0000", "#FFFF00", "#00FF00"]; // 紅色、黃色、綠色
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            // 隨機選擇顏色
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            bricks[c][r].color = randomColor;
        }
    }
}

function setBrickColors() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            // 每一列的第一個方塊設為藍色
            if (r === 0) {
                bricks[c][r].color = "#0095DD"; // 藍色
            } else {
                // 隨機生成其他顏色（紅色、黃色、綠色）
                const colors = ["#FF0000", "#FFFF00", "#00FF00"];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                bricks[c][r].color = randomColor; // 隨機選擇紅色、黃色或綠色
            }
            // 其他磚塊的狀態設置
            bricks[c][r].status = 1; // 確保所有磚塊的狀態設為可見
            bricks[c][r].hits = 0; // 初始化擊打計數
        }
    }
}



function setDifficulty(difficulty) {
    switch (difficulty) {
        case "easy":
            dx = 2; // 球速
            brickRowCount = 2; // 磚塊行數
            brickColumnCount = 3; // 磚塊列數
            lives = 5; // 生命次數
            break;
        case "medium":
            dx = 4; // 球速
            brickRowCount = 3; // 磚塊行數
            brickColumnCount = 4; // 磚塊列數
            lives = 3; // 生命次數
            break;
        case "hard":
            dx = 6; // 球速
            brickRowCount = 5; // 磚塊行數
            brickColumnCount = 5; // 磚塊列數
            lives = 1; // 生命次數
            break;
    }
    initializeBricks(); // 初始化磚塊
}


function startGame() {
    gameStarted = true;
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    backgroundMusic.loop = true; // 設定音樂循環播放
    backgroundMusic.play(); // 撥放背景音樂
    setBackground(); // 設定隨機背景
    const difficulty = document.getElementById("difficulty").value;
    const mode = document.getElementById("mode").value;
    setDifficulty(difficulty);
    if (mode === "timeChallenge") {
        timeRemaining = 60; // 重設倒數時間
        document.getElementById("timerDisplay").style.display = "block"; // 顯示倒數計時
        document.getElementById("timeRemaining").textContent = timeRemaining;

        timerInterval = setInterval(() => {
            timeRemaining--;
            document.getElementById("timeRemaining").textContent = timeRemaining;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert("時間到！遊戲結束");
                resetGame();
            }
        }, 1000);
    } else {
        document.getElementById("timerDisplay").style.display = "none"; // 隱藏倒數計時
    }

    draw(); // 開始遊戲循環
}

function restartGame() {
    score = 0;
    lives = 3;
    gameStarted = false;
    backgroundMusic.pause(); // 暫停背景音樂
    backgroundMusic.currentTime = 0; // 重置背景音樂為開頭
    document.getElementById("startBtn").style.display = "block";
    document.getElementById("restartBtn").style.display = "none";
    initializeBricks();
    backgroundMusic.pause(); // 停止背景音樂
    backgroundMusic.currentTime = 0; // 重置音樂播放時間
    draw();
}

function resetGame() {
    score = 0;
    lives = 3;
    gameStarted = false;
    document.getElementById("startBtn").style.display = "block";
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    initializeBricks();
    if (timerInterval) {
        clearInterval(timerInterval); // 重置時清除計時器
    }
}

// 啟動遊戲繪製循環
draw();
