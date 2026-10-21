
/* ==================================================
   1. LẤY CÁC PHẦN TỬ HTML
================================================== */

const welcomeScreen = document.getElementById("welcomeScreen");
const startButton = document.getElementById("startButton");
const welcomeGift = document.getElementById("welcomeGift");
const secretMessage = document.getElementById("secretMessage");
const heartGame = document.getElementById("heartGame");
const resultImage = document.getElementById("gameResultImage");
const openGiftBtn = document.getElementById("openGiftBtn");

/* ==================================================
   2. HIỆU ỨNG NHẤN HỘP QUÀ
================================================== */

if (welcomeGift && secretMessage) {
    welcomeGift.addEventListener("click", () => {
        secretMessage.classList.add("show");

        welcomeGift.classList.remove("gift-shake");
        void welcomeGift.offsetWidth;
        welcomeGift.classList.add("gift-shake");
    });
}

/* ==================================================
   3. CHUYỂN SANG TRÒ CHƠI
================================================== */

if (startButton && welcomeScreen && heartGame) {
    startButton.addEventListener("click", () => {
        welcomeScreen.classList.add("hide");
        heartGame.classList.add("game-visible");

        setTimeout(() => {
            heartGame.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 150);
    });
}

/* ==================================================
   4. HIỆU ỨNG CHỮ TÌNH YÊU RƠI
================================================== */

let fallingWordsContainer =
    document.getElementById("fallingWords");

if (!fallingWordsContainer) {
    fallingWordsContainer = document.createElement("div");
    fallingWordsContainer.id = "fallingWords";
    fallingWordsContainer.setAttribute("aria-hidden", "true");

    Object.assign(fallingWordsContainer.style, {
        position: "fixed",
        inset: "0",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: "1"
    });

    document.body.appendChild(fallingWordsContainer);
}

const myFallingWords = [
    "Em yêu anh 💗",
    "Chúc aiu sinh nhật vui vẻ 🎂",
    "Yêu anh nhiều lắm 💕",
    "Kiếm nhiều xìn cho e nhéeeee",
    "Happy Birthday 🎉",
    "Fuck youuu :)))",
    "Yêu em nhiều hơn nhéeee 🥰",
    "Anh iu của em",
    "Không được hú hí với đứa nào đâu 😈",
    "Yêu em là chân ái 💖"
];

const fallingColors = [
    "#e879ad",
    "#c084fc",
    "#f472b6",
    "#d946a8",
    "#fb7185"
];

function createMyFallingWord() {
    if (!fallingWordsContainer) return;

    const word = document.createElement("span");

    word.className = "falling-word";

    word.textContent =
        myFallingWords[
            Math.floor(Math.random() * myFallingWords.length)
        ];

    word.style.position = "absolute";
    word.style.top = "-40px";
    word.style.left = Math.random() * 85 + "%";

    word.style.color =
        fallingColors[
            Math.floor(Math.random() * fallingColors.length)
        ];

    word.style.fontSize =
        (12 + Math.random() * 9) + "px";

    word.style.animationDuration =
        (7 + Math.random() * 7) + "s";

    fallingWordsContainer.appendChild(word);

    word.addEventListener("animationend", () => {
        word.remove();
    });
}

// Tạo chữ rơi khi mở trang
for (let i = 0; i < 12; i++) {
    setTimeout(createMyFallingWord, i * 400);
}

// Tiếp tục tạo chữ mỗi 700 ms
setInterval(createMyFallingWord, 700);

/* ==================================================
   5. TRÒ CHƠI HỨNG TRÁI TIM
================================================== */

(() => {
    const area = document.getElementById("heartGameArea");
    const player = document.getElementById("gamePlayer");
    const startOverlay =
        document.getElementById("gameStartOverlay");

    const startBtn = document.getElementById("heartStartBtn");
    const restartBtn =
        document.getElementById("heartRestartBtn");

    const scoreText = document.getElementById("heartScore");
    const missesText = document.getElementById("heartMisses");

    const gameMessageOverlay =
        document.getElementById("gameMessageOverlay");

    const gameMessageClose =
        document.getElementById("gameMessageClose");
    const resultEmoji =
        document.getElementById("gameResultEmoji");
    const resultTitle =
        document.getElementById("gameResultTitle");
    const resultText =
        document.getElementById("gameResultText");

    const leftBtn = document.getElementById("gameLeftBtn");
    const rightBtn = document.getElementById("gameRightBtn");

    // Nếu HTML không có game thì không chạy phần này
    if (
        !area || !player || !startOverlay ||
        !startBtn || !restartBtn ||
        !scoreText || !missesText ||
        !gameMessageOverlay || !gameMessageClose ||
        !resultEmoji || !resultTitle || !resultText ||
        !openGiftBtn || !leftBtn || !rightBtn
    ) {
        return;
    }

    /* ===== CẤU HÌNH GAME ===== */

    const TARGET_SCORE = 21;
    const MAX_MISSES = 3;

    const PLAYER_WIDTH = 58;
    const PLAYER_SPEED = 380;

    // Cứ 300 ms sinh một vật thể
    const SPAWN_INTERVAL = 300;

    // Tỷ lệ mặt cười nguy hiểm
    const DANGER_RATE = 0.60;

    // Tốc độ rơi từ 280 đến 430 px/giây
    const MIN_FALL_SPEED = 300;
    const MAX_FALL_SPEED = 450;

    let score = 0;
    let misses = 0;
    let playerX = 0;

    let hearts = [];
    let running = false;
    let animationId = null;

    let lastTime = 0;
    let spawnElapsed = 0;

    let leftPressed = false;
    let rightPressed = false;
    let draggingPlayer = false;

    const heartEmojis = [
        "💗", "💕", "💖", "💘", "💝"
    ];

    /* ==================================================
       6. CẬP NHẬT ĐIỂM
    ================================================== */

    function updateScore() {
        scoreText.textContent = score;
        missesText.textContent = `${misses}/${MAX_MISSES}`;
    }

    /* ==================================================
       7. DI CHUYỂN GIỎ
    ================================================== */

    function placePlayer() {
        const maxX = Math.max(
            0,
            area.clientWidth - PLAYER_WIDTH
        );

        playerX = Math.max(
            0,
            Math.min(playerX, maxX)
        );

        // CSS game-player dùng left: 50% và translateX(-50%)
        player.style.left =
            `${playerX + PLAYER_WIDTH / 2}px`;
    }

    /* ===== KÉO GIỎ BẰNG CHUỘT HOẶC NGÓN TAY ===== */

    player.addEventListener("pointerdown", event => {
        if (!running) return;

        draggingPlayer = true;
        event.preventDefault();

        try {
            player.setPointerCapture(event.pointerId);
        } catch (_) {
            // Bỏ qua nếu trình duyệt không hỗ trợ
        }
    });

    player.addEventListener("pointermove", event => {
        if (!draggingPlayer || !running) return;

        const areaRect = area.getBoundingClientRect();

        playerX =
            event.clientX -
            areaRect.left -
            PLAYER_WIDTH / 2;

        placePlayer();
    });

    function stopDragging() {
        draggingPlayer = false;
    }

    player.addEventListener("pointerup", stopDragging);
    player.addEventListener("pointercancel", stopDragging);
    player.addEventListener(
        "lostpointercapture",
        stopDragging
    );

    /* ==================================================
       8. XÓA CÁC VẬT THỂ TRÊN MÀN HÌNH
    ================================================== */

    function clearHearts() {
        hearts.forEach(heart => {
            heart.element.remove();
        });

        hearts = [];
    }

    /* ==================================================
       9. TẠO TIM VÀ MẶT CƯỜI
    ================================================== */

    function spawnHeart() {
        // 60% mặt cười, 40% tim thường
        const isDanger = Math.random() < DANGER_RATE;

        const element = document.createElement("span");

        element.className = isDanger
            ? "game-falling-heart danger-face"
            : "game-falling-heart";

        element.textContent = isDanger
            ? "😛"
            : heartEmojis[
                Math.floor(
                    Math.random() * heartEmojis.length
                )
            ];

        element.style.position = "absolute";
        element.style.left = "0px";
        element.style.top = "0px";
        element.style.transform = "none";

        element.style.fontSize = isDanger
            ? "32px"
            : "29px";

        // Vị trí xuất hiện ngẫu nhiên
        const x = Math.random() * Math.max(
            0,
            area.clientWidth - 36
        );

        // Bắt đầu ở phía trên vùng chơi
        const y = -40;

        // Mỗi vật thể có tốc độ riêng
        const speed =
            MIN_FALL_SPEED +
            Math.random() *
            (MAX_FALL_SPEED - MIN_FALL_SPEED);

        area.appendChild(element);

        hearts.push({
            element: element,
            x: x,
            y: y,
            speed: speed,
            type: isDanger ? "danger" : "heart"
        });
    }

    /* ==================================================
       10. XỬ LÝ THẮNG VÀ THUA
    ================================================== */

    
    function finishGame(outcome) {
        if (!running) return;

        running = false;

        leftPressed = false;
        rightPressed = false;
        draggingPlayer = false;

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        clearHearts();

        // Đặt lại trạng thái nút và ảnh
        restartBtn.hidden = false;
        openGiftBtn.hidden = true;

        if (resultImage) {
            resultImage.hidden = true;
            resultImage.removeAttribute("src");
        }

        gameMessageOverlay.hidden = false;

        // CHIẾN THẮNG
        if (outcome === "win") {

            resultTitle.textContent =
                "Ô lợn hứng đủ tim rồi à";

            resultText.textContent =
                "Đố a biết có quà j áaa";

            restartBtn.hidden = true;
            openGiftBtn.hidden = false;

            return;
        }

        // HỨNG TRÚNG MẶT CƯỜI
        if (outcome === "danger") {

            if (resultImage) {
                resultImage.src = "6.webp";
                resultImage.alt = "Ảnh khi hứng trúng mặt cười";
                resultImage.hidden = false;
            }

            resultTitle.textContent = "Aiu non thíiiii :)))";

            resultText.textContent = "Hứng nhầm rồi";

            return;
        }

        // BỎ LỠ QUÁ NHIỀU TIM

        resultTitle.textContent = "EEEEEE, ANH ƠI!";

        resultText.textContent =
            "A né tim à :)) Rơi hết tim rồi!";
    }


    /* ==================================================
       11. VÒNG LẶP GAME
    ================================================== */

    function gameLoop(timestamp) {
        if (!running) {
            animationId = null;
            return;
        }

        if (lastTime === 0) {
            lastTime = timestamp;
        }

        const delta = Math.min(
            (timestamp - lastTime) / 1000,
            0.04
        );

        lastTime = timestamp;

        // 1. DI CHUYỂN GIỎ
        if (leftPressed) {
            playerX -= PLAYER_SPEED * delta;
        }

        if (rightPressed) {
            playerX += PLAYER_SPEED * delta;
        }

        placePlayer();

        // 2. SINH VẬT THỂ DỒN DẬP
        spawnElapsed += delta * 1000;

        while (spawnElapsed >= SPAWN_INTERVAL) {
            spawnElapsed -= SPAWN_INTERVAL;
            spawnHeart();
        }

        const areaHeight = area.clientHeight;

        const playerTop = areaHeight - 58;
        const playerBottom = areaHeight - 10;
        const playerRight = playerX + PLAYER_WIDTH;

        // 3. DI CHUYỂN VÀ KIỂM TRA VA CHẠM
        for (let i = hearts.length - 1; i >= 0; i--) {
            const heart = hearts[i];

            heart.y += heart.speed * delta;

            heart.element.style.left =
                `${heart.x}px`;

            heart.element.style.top =
                `${heart.y}px`;

            // Kích thước va chạm theo emoji thực tế
            const objectWidth =
                heart.element.offsetWidth || 28;

            const objectHeight =
                heart.element.offsetHeight || 28;

            const objectLeft = heart.x;
            const objectRight = heart.x + objectWidth;
            const objectTop = heart.y;
            const objectBottom = heart.y + objectHeight;

            // 4. KIỂM TRA VA CHẠM VỚI GIỎ
            const caught =
                objectBottom >= playerTop &&
                objectTop <= playerBottom &&
                objectRight >= playerX &&
                objectLeft <= playerRight;

            if (caught) {
                heart.element.remove();
                hearts.splice(i, 1);

                // Chạm mặt cười là thua ngay
                if (heart.type === "danger") {
                    finishGame("danger");
                    return;
                }

                // Hứng tim thường thì cộng điểm
                score++;
                updateScore();

                if (score >= TARGET_SCORE) {
                    finishGame("win");
                    return;
                }

                continue;
            }

            // 5. VẬT THỂ RƠI KHỎI MÀN HÌNH
            if (heart.y > areaHeight) {
                heart.element.remove();
                hearts.splice(i, 1);

                // Chỉ bỏ lỡ tim thường mới tính hụt
                if (heart.type === "heart") {
                    misses++;
                    updateScore();

                    if (misses >= MAX_MISSES) {
                        finishGame("misses");
                        return;
                    }
                }
            }
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    /* ==================================================
       12. BẮT ĐẦU HOẶC CHƠI LẠI
    ================================================== */

    function startGame() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        running = false;

        clearHearts();

        score = 0;
        misses = 0;

        spawnElapsed = 0;
        lastTime = 0;

        leftPressed = false;
        rightPressed = false;
        draggingPlayer = false;

        playerX =
            (area.clientWidth - PLAYER_WIDTH) / 2;

        updateScore();
        placePlayer();

        startOverlay.hidden = true;
        gameMessageOverlay.hidden = true;

        running = true;

        animationId = requestAnimationFrame(gameLoop);
    }

    /* ==================================================
       13. NÚT GIỮ TRÁI / PHẢI TRÊN ĐIỆN THOẠI
    ================================================== */

    function bindHoldButton(button, direction) {
        button.addEventListener("pointerdown", event => {
            event.preventDefault();

            if (!running) return;

            if (direction === "left") {
                leftPressed = true;
            } else {
                rightPressed = true;
            }

            try {
                button.setPointerCapture(event.pointerId);
            } catch (_) {
                // Tiếp tục nếu không hỗ trợ
            }
        });

        function release() {
            if (direction === "left") {
                leftPressed = false;
            } else {
                rightPressed = false;
            }
        }

        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener(
            "lostpointercapture",
            release
        );
    }

    /* ==================================================
       14. ĐIỀU KHIỂN BẰNG BÀN PHÍM
    ================================================== */

    document.addEventListener("keydown", event => {
        if (!running) return;

        const key = event.key.toLowerCase();

        if (
            key === "arrowleft" ||
            key === "arrowright" ||
            key === "a" ||
            key === "d"
        ) {
            event.preventDefault();
        }

        if (key === "arrowleft" || key === "a") {
            leftPressed = true;
        }

        if (key === "arrowright" || key === "d") {
            rightPressed = true;
        }
    });

    document.addEventListener("keyup", event => {
        const key = event.key.toLowerCase();

        if (key === "arrowleft" || key === "a") {
            leftPressed = false;
        }

        if (key === "arrowright" || key === "d") {
            rightPressed = false;
        }
    });

    // Ngừng di chuyển khi chuyển sang cửa sổ khác
    window.addEventListener("blur", () => {
        leftPressed = false;
        rightPressed = false;
        draggingPlayer = false;
    });

    // Điều chỉnh vị trí giỏ khi đổi kích thước màn hình
    window.addEventListener("resize", () => {
        if (running) {
            placePlayer();
        }
    });

    /* ==================================================
       15. GẮN CÁC SỰ KIỆN
    ================================================== */

    bindHoldButton(leftBtn, "left");
    bindHoldButton(rightBtn, "right");

    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", startGame);
    
    openGiftBtn.addEventListener("click", () => {
        window.location.href = "gift.html";
    });
    // Đóng thông báo khi bấm nút X
    gameMessageClose.addEventListener("click", () => {
        gameMessageOverlay.hidden = true;
    });

    // Đóng khi bấm vào vùng nền tối bên ngoài
    gameMessageOverlay.addEventListener("click", event => {
        if (event.target === gameMessageOverlay) {
            gameMessageOverlay.hidden = true;
        }
    });
    updateScore();
    placePlayer();
})();
