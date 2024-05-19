import Canvas from "./src/canvas";

const canvas = new Canvas();
let id;

window.addEventListener("load", (e) => {
    const update = (timeStamp) => {
        canvas.draw(timeStamp);
        id = requestAnimationFrame(update);
    };
    update();
});

window.addEventListener("unload", () => {
    cancelAnimationFrame(id);
});

window.addEventListener("resize", () => {
    canvas.resize(window.innerWidth, window.innerHeight);
    canvas.detectElementsCollision();
});

window.addEventListener("mousedown", (e) => {
    canvas.onMouseDown(e);
});

window.addEventListener("mousemove", (e) => {
    canvas.onMouseMove(e);
});

window.addEventListener("mouseup", (e) => {
    canvas.onMouseUp(e);
});

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

const startBtn = document.getElementById("start");
const modal = document.getElementById("modal");

startBtn.addEventListener("click", (e) => {
    modal.style.display = "none";
});
