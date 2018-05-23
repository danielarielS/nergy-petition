const first = $(".first");
const last = $(".last");
const sig = $(".sig");
const canvas = $(".canvas");
const context = $(".canvas")[0].getContext("2d");
const remove = $(".remove");
const firstVal = first.val();
const lastVal = last.val();
context.strokeStyle = "rgba(255, 255, 255, 0.8)";
let moving;
let can = document.querySelector("CANVAS");
canvas.on("mousedown", (e) => {
    moving = true;
    context.beginPath();
    canvas.on("mousemove", (e) => {
        sig.val(can.toDataURL());
        console.log("move");
        // context.moveTo(x, y);
        if (moving) {
            context.lineTo(e.offsetX, e.offsetY);
            context.stroke();
        }
    });
    // context.moveTo(e.clientX, e.clientY);
});
$(document).on("mouseup", (e) => {
    moving = false;

    canvas.off("mousemove");
    // context.clearRect(0, 0, 300, 200);
    console.log(sig.val());
});

remove.click((e) => {
    context.clearRect(0, 0, 500, 200);
});
// canvas.toDataURL(); // gives you the image data from the canvas
