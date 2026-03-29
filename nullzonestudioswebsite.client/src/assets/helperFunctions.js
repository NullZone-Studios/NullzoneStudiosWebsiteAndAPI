export function map(value, min, max, newMin, newMax) {
    value = clamp(value, min, max);
    return newMin + (newMax - newMin) * ((value - min) / (max - min));
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

export function rotationByMousePosition(mouseMoveEvent, element, dampener){
    let rectangle = element.getBoundingClientRect();
    let x = mouseMoveEvent.clientX - rectangle.left; 
    let y =mouseMoveEvent.clientY - rectangle.top;
    let centerX = rectangle.width / 2;
    let centerY = rectangle.height / 2;
    let rotateX = -(centerY - y) / dampener;
    let rotateY = (centerX - x) / dampener;
    return {
        x: rotateX,
        y: rotateY
    }
}