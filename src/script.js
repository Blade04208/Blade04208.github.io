document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("content");
    const htmlEl = document.documentElement;

    document.body.addEventListener("click", async (e) => {
        const link = e.target.closest("a");
        if (
            !link ||
            link.target === "_blank" ||
            link.hasAttribute("download") ||
            link.href.startsWith("mailto:")
        ) return;

        const isSameOrigin = new URL(link.href).origin === window.location.origin;
        if (!isSameOrigin) return;


        const currentPath = window.location.pathname.replace(/\/+$/, "");
        const targetPath = new URL(link.href).pathname.replace(/\/+$/, "");
        if (currentPath === targetPath) return;

        e.preventDefault();


        if (link.classList.contains("nav-item")) {
            document.querySelectorAll(".nav-item.selected").forEach(el =>
                el.classList.remove("selected")
            );
            link.classList.add("selected");
        }


        content.style.transition = "opacity 0.2s ease";
        content.style.opacity = 0;

        try {
            const res = await fetch(link.href);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const newPagecol = doc.documentElement.style.getPropertyValue("--pagecol").trim();
            if (newPagecol) htmlEl.style.setProperty("--pagecol", newPagecol);

            const newContent = doc.querySelector("#content");
            if (!newContent) throw new Error("No #content found in fetched page.");

            setTimeout(() => {
                content.innerHTML = newContent.innerHTML;
                content.style.opacity = 1;
                window.history.pushState({}, "", link.href);
            }, 400);

        } catch (err) {
            console.error("Navigation failed:", err);
            window.location.href = link.href;
        }
    });

    window.addEventListener("popstate", async () => {
        try {
            const res = await fetch(location.href);
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");

            const newPagecol = doc.documentElement.style.getPropertyValue("--pagecol").trim();
            if (newPagecol) htmlEl.style.setProperty("--pagecol", newPagecol);

            const newContent = doc.querySelector("#content");
            if (newContent) content.innerHTML = newContent.innerHTML;
        } catch (err) {
            console.error("Popstate load failed:", err);
        }
    });
});




let selectedIndex = 0;
let previousButtons = [];
let inputCooldown = 0;
let stickPressed = false;

let holdDelay = 300;
let repeatInterval = 125;
let holdTimer = 0;
let repeatTimer = 0;
let gamepadUsed = false;

let currentZone = "nav"; // 'nav' or 'content'

function getNavElements() {
    return Array.from(document.querySelectorAll("nav .nav-item"));
}

function getContentElements() {
    return Array.from(document.querySelectorAll("#content button, #content a"));
}

function getCurrentElements() {
    return currentZone === "nav" ? getNavElements() : getContentElements();
}

function updateSelection(index) {
    const navElements = getNavElements();
    const contentElements = getContentElements();

    navElements.forEach(el => el.classList.remove("gamepad-selected"));
    contentElements.forEach(el => el.classList.remove("gamepad-selected"));

    const elements = getCurrentElements();
    if (elements[index]) {
        elements[index].classList.add("gamepad-selected");
        elements[index].focus();
    }
}

function moveSelection(direction) {
    const elements = getCurrentElements();
    selectedIndex = (selectedIndex + direction + elements.length) % elements.length;
    updateSelection(selectedIndex);
}

function pollGamepad(timestamp) {
    const gamepad = navigator.getGamepads()[0];
    const elements = getCurrentElements();

    if (gamepad && !gamepadUsed) {
        const stickMoved = Math.abs(gamepad.axes[0]) > 0.2 || Math.abs(gamepad.axes[1]) > 0.2;
        const buttonPressed = gamepad.buttons.some(btn => btn.pressed);

        if (stickMoved || buttonPressed) {
            gamepadUsed = true;
            document.documentElement.classList.add("gamepad");
        }
    }

    if (gamepad && elements.length > 0) {
        const currentButtons = gamepad.buttons.map(btn => btn.pressed);
        const stickY = gamepad.axes[1];
        const stickX = gamepad.axes[0];
        const prev = previousButtons;

        const dpadUp = currentButtons[12];
        const dpadDown = currentButtons[13];
        const dpadLeft = currentButtons[14];
        const dpadRight = currentButtons[15];
        const aButton = currentButtons[0] && !prev[0];

        const stickThreshold = 0.5;
        const stickUp = stickY < -stickThreshold;
        const stickDown = stickY > stickThreshold;
        const stickLeft = stickX < -stickThreshold;
        const stickRight = stickX > stickThreshold;

        const prevStickX = previousButtons.stickX ?? 0;
        const stickMovedRight = stickRight && prevStickX <= stickThreshold;
        const stickMovedLeft = stickLeft && prevStickX >= -stickThreshold;

        const isUpHeld = dpadUp || stickUp;
        const isDownHeld = dpadDown || stickDown;


        if ((dpadRight && !prev[15]) || stickMovedRight) {
            if (currentZone === "nav") {
                // getNavElements().forEach(el => el.classList.remove("gamepad-selected"));
                currentZone = "content";
                selectedIndex = 0;
                updateSelection(selectedIndex);
            }
        } else if ((dpadLeft && !prev[14]) || stickMovedLeft) {
            if (currentZone === "content") {
                // getContentElements().forEach(el => el.classList.remove("gamepad-selected"));
                currentZone = "nav";
                selectedIndex = 0;
                updateSelection(selectedIndex);
            }
        }


        if (!isUpHeld && !isDownHeld) {
            inputCooldown = 0;
            holdTimer = 0;
            repeatTimer = 0;
            stickPressed = false;
        }

        // Vertical navigation
        if (inputCooldown <= 0) {
            if (isUpHeld) {
                if (holdTimer === 0) {
                    moveSelection(-1);
                    holdTimer = holdDelay;
                    repeatTimer = repeatInterval;
                    inputCooldown = 16;
                } else if (holdTimer <= 0) {
                    if (repeatTimer <= 0) {
                        moveSelection(-1);
                        repeatTimer = repeatInterval;
                    }
                }
            } else if (isDownHeld) {
                if (holdTimer === 0) {
                    moveSelection(1);
                    holdTimer = holdDelay;
                    repeatTimer = repeatInterval;
                    inputCooldown = 16;
                } else if (holdTimer <= 0) {
                    if (repeatTimer <= 0) {
                        moveSelection(1);
                        repeatTimer = repeatInterval;
                    }
                }
            } else if (aButton) {
                elements[selectedIndex]?.click();
                inputCooldown = 300;
            }
        }

        previousButtons = currentButtons;
        previousButtons.stickX = stickX;

        if (holdTimer > 0) holdTimer -= 16.67;
        if (repeatTimer > 0) repeatTimer -= 16.67;
        if (inputCooldown > 0) inputCooldown -= 16.67;
    }

    requestAnimationFrame(pollGamepad);
}

function onUserInput(event) {
    const nav = document.querySelector("nav");
    if (!nav) return;

    const isMouse = event.type === "mousedown" || event.type === "mousemove";
    const isKeyboard = event.type === "keydown";

    const hoveredNav = isMouse && nav.matches(":hover");
    const alwaysClear = isKeyboard || event.type === "mousedown";

    if ((hoveredNav || alwaysClear) && gamepadUsed) {
        gamepadUsed = false;
        document.documentElement.classList.remove("gamepad");
    }
}

window.addEventListener("mousemove", onUserInput);
window.addEventListener("mousedown", onUserInput);
window.addEventListener("keydown", onUserInput);

window.addEventListener("keydown", (e) => {
    const navElements = getNavElements();
    const contentElements = getContentElements();
    const elements = getCurrentElements();
    if (elements.length === 0) return;

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            moveSelection(1);
            break;

        case "ArrowUp":
            e.preventDefault();
            moveSelection(-1);
            break;

        case "ArrowRight":
            if (currentZone === "nav" && contentElements.length > 0) {
                e.preventDefault();
                // navElements.forEach(el => el.classList.remove("gamepad-selected"));
                currentZone = "content";
                selectedIndex = 0;
                updateSelection(selectedIndex);
            }
            break;

        case "ArrowLeft":
            if (currentZone === "content" && navElements.length > 0) {
                e.preventDefault();
                // contentElements.forEach(el => el.classList.remove("gamepad-selected"));
                currentZone = "nav";
                selectedIndex = 0;
                updateSelection(selectedIndex);
            }
            break;

        case "Enter":
        case " ":
            e.preventDefault();
            elements[selectedIndex]?.click();
            break;
    }

    if (gamepadUsed) {
        document.documentElement.classList.remove("gamepad");
        gamepadUsed = false;
    }
});


pollGamepad();
