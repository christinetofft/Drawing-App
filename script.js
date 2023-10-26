
const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    sizeSlider = document.querySelector("#size-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    clearCanvas = document.querySelector(".clear-canvas"),
    saveImage = document.querySelector(".save-img"),
    ctx = canvas.getContext("2d");

const beforePseudoElement = sizeSlider.parentElement.querySelector('::before');

//Global variables with default value
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000",
    spraySize = 40,
    sprayDensity = 50,
    sprayParticles = [];

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.height, canvas.width);
    ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {
    //setting canvas width/height. offsetWidth/height returns viewable width/length of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawSquare = (e) => {
    if(!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
}

const drawCircle =(e) => {
    ctx.beginPath()
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY); //Creating bottom line of triangle
    ctx.closePath(); //closing path of a triangle, so the third line draw automatically.
    fillColor.checked ? ctx.fill() : ctx.stroke();
}
const sprayPaint = (e) => {
    ctx.fillStyle = selectedColor;
    for (let i = 0; i < sprayDensity; i++) {
        const offsetX = (Math.random() - 0.5) * spraySize;
        const offsetY = (Math.random() - 0.5) * spraySize;
        ctx.beginPath();
        ctx.fillRect(e.offsetX + offsetX, e.offsetY + offsetY, 1, 1);
    } ctx.stroke();
}

const startDraw = (e) => {
    isDrawing = true;

    if (selectedTool !== "spray") {
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
    }
    if (selectedTool !== "spray") {
        ctx.beginPath();
        ctx.lineWidth = brushWidth;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else {
            sprayParticles = [];
            addSprayParticles(e.offsetX, e.offsetY);
        }
    };
const drawing = (e) => {
    if (!isDrawing) return;

    if (selectedTool === "brush" || selectedTool === "eraser" || selectedTool === "square" || selectedTool === "circle" || selectedTool === "triangle") {
        ctx.putImageData(snapshot, 0, 0);
    }

    if (selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (selectedTool === "square") {
        drawSquare(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    } else if (selectedTool === "triangle") {
        drawTriangle(e);
    } else if (selectedTool === "spray") {
        sprayPaint(e);
    }
}
const addSprayParticles = (x, y) => {
    for (let i = 0; i < sprayDensity; i++) {
        const offsetX = (Math.random() - 0.5) * spraySize;
        const offsetY = (Math.random() - 0.5) * spraySize;
        sprayParticles.push({ x: x + offsetX, y: y + offsetY });
    }
};
const drawSprayParticles = () => {
    ctx.fillStyle = selectedColor;
    for (const particle of sprayParticles) {
        ctx.fillRect(particle.x, particle.y, 1, 1);
    }
};

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => { //Adding click event to all tool options
        //Removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        //Passing selected button color as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    //passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasBackground();
});

saveImage.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);
