const c = document.querySelector(".canvas"); // Grab canvas object


const animation_data = {
    ctx: c.getContext("2d"),
    height: c.height,
    width: c.width,
    color_scheme: get_system_color_scheme(),
    requestId: null,
}

// Resizes canvas
function resizeCanvasToDisplaySize() {

    
    
    // look up the size the canvas is being displayed
    const width = c.clientWidth;
    const height = c.clientHeight;
    
    // If it's resolution does not match change it
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = c.width;
    tempCanvas.height = c.height;
    let tempContext = tempCanvas.getContext("2d");
    tempContext.drawImage(c, 0, 0);

    
    c.width = width * 2;
    c.height = height * 2;

    animation_data.ctx.drawImage(tempContext.canvas, 0, 0);
    animation_data.width = c.width;
    animation_data.height = c.height;

}
 

// Calculates y position from x
function calcSineY(x) {
    // This is the meat (unles you are vegan)
    // Note that:
    // h is the amplitude of the wave
    // x is the current x value we get every time interval
    // 2 * PI is the length of one cycle (full circumference)
    // f/w is the frequency fraction
    return h - h * Math.sin( x * 2 * Math.PI * (f/w) );
}


function drawCircle(data, theta, deg) {

    let circle_y = data.height / 2;     
    let circle_x = circle_y;
    let radius = circle_x -  2;
    
    // Draw a circle
    data.ctx.beginPath();
    data.ctx.lineWidth = "4";
    data.ctx.strokeStyle = data.color_scheme.primary;
    data.ctx.arc(circle_x, circle_y, radius, 0, 2 * Math.PI, false);
    data.ctx.stroke();

    
    // Draw the horizontal radius.
    data.ctx.beginPath();
    data.ctx.moveTo(circle_x, circle_y);
    data.ctx.lineTo(circle_x + radius, circle_y);
    data.ctx.stroke();

    // Draw radius at theta.
    let radius_x = Math.cos(theta) *  radius + circle_x;
    let radius_y = -Math.sin(theta) *  radius + circle_y;
    data.ctx.strokeStyle = data.color_scheme.secondary_2;
    data.ctx.beginPath();
    data.ctx.moveTo(circle_x, circle_y);
    data.ctx.lineTo(radius_x, radius_y);
    data.ctx.stroke();


    // Draw an angle between the two radii
    data.ctx.beginPath();
    data.ctx.arc(circle_x, circle_y, radius / 5, 0, -theta, true);
    data.ctx.stroke();
 
    // Fill text for the angle
    data.ctx.fillStyle = data.color_scheme.primary;
    data.ctx.textAlign = "center";
    data.ctx.font = "1.6em sans-serif";
    data.ctx.fillText("θ = " + Math.round(deg / 5) * 5 + '°', circle_x + radius / 2, circle_y - radius / 3)

    return {
        pos: {x: circle_x, y: circle_y},
        radius_point: {x: radius_x, y: radius_y},
        radius: radius
    }
}

function drawSine(data, circle, theta)
{
    let begin_x = data.height + 15;
    let length = data.width - begin_x - 30;
    let current_x = begin_x + (theta / (2 * Math.PI)) * length;

    // Draw X Axis.
    data.ctx.strokeStyle = data.color_scheme.secondary_1;
    data.ctx.beginPath();
    data.ctx.moveTo(begin_x, data.height / 2);
    data.ctx.lineTo(begin_x + length, data.height / 2);
    data.ctx.stroke();
    
    // Label x axis with measurements.
    data.ctx.fillStyle = data.color_scheme.secondary_1;

    const fill_text = (degs) => {
        for (let i = 0; i < degs.length; i++) {
            data.ctx.fillText('' + degs[i] + '°', begin_x + degs[i] / 360 * length, data.height / 2 + 30)
        }
    }
    
    fill_text([0, 90, 180, 270, 360]);
    if (window.innerWidth  > 400)
    {
        fill_text([45, 135, 225, 315])
    }
    
    // Horizontal Line From radius to Current X.
    data.ctx.lineWidth = "3";
    data.ctx.strokeStyle = "gray";
    data.ctx.beginPath();
    data.ctx.moveTo(circle.radius_point.x, circle.radius_point.y);
    data.ctx.lineTo(current_x, circle.radius_point.y);
    data.ctx.stroke();

    // Altitude from x axis to sine.
    data.ctx.strokeStyle = data.color_scheme.secondary_3;
    data.ctx.lineWidth = "4";
    data.ctx.beginPath();
    data.ctx.moveTo(current_x, data.height / 2);
    data.ctx.lineTo(current_x, circle.radius_point.y);
    data.ctx.stroke();

    // Draw Sine curve point to point till current_x
    data.ctx.beginPath()
    data.ctx.strokeStyle = data.color_scheme.primary;
    for (let i = 0; i < current_x - begin_x; i++) {
        
        let radius_y = -Math.sin((i / length) * 2 * Math.PI) * circle.radius + circle.pos.y;
        data.ctx.lineTo(begin_x + i, radius_y);
        data.ctx.moveTo(begin_x + i, radius_y);

    }
    data.ctx.stroke();
    
    
    // Area under Sine curve
    data.ctx.beginPath()
    data.ctx.strokeStyle = data.color_scheme.secondary_2;
    data.ctx.lineWidth = "1";
    for (let i = 0; i < current_x - begin_x; i++) {
        
        if (i % 15 == 0)
        {
            let radius_y = -Math.sin((i / length) * 2 * Math.PI) * circle.radius + circle.pos.y;
            data.ctx.moveTo(begin_x + i, radius_y);
            data.ctx.lineTo(begin_x + i, data.height / 2);
        }
        
    }
    data.ctx.stroke();
    
    // Label for Altitude
    data.ctx.fillStyle = data.color_scheme.secondary_3;
    data.ctx.fillText("sin θ", current_x + 40, ((data.height / 2) + circle.radius_point.y ) / 2 )
    
}

function draw_canvas(distance) {
    animation_data.ctx.clearRect(0, 0, animation_data.width, animation_data.height);

    const circle = drawCircle(animation_data, distance, distance * 180 / Math.PI);
    drawSine(animation_data, circle,  distance);
    
}
function run_animation(step) {
    let distance = (step * 0.0002) % 2 * Math.PI;    

    draw_canvas(distance);
    animation_data.requestId = requestAnimationFrame(run_animation);
}

function get_dark_color_scheme()
{
    return {
        primary: "white",
        secondary_1: "lightgreen",
        secondary_2: "orange",
        secondary_3: "lightblue",
    }
}

function get_light_color_scheme()
{
    return {
        primary: "black",
        secondary_1: "darkgreen",
        secondary_2: "brown",
        secondary_3: "blue",
    }
}

function get_system_color_scheme()
{
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return get_dark_color_scheme();
    }
    return get_light_color_scheme();
}



window.onload = resizeCanvasToDisplaySize;

window.addEventListener("resize", resizeCanvasToDisplaySize);
window.onbeforeprint = ()=>{
    animation_data.color_scheme = get_light_color_scheme();
    cancelAnimationFrame(animation_data.requestId);
    draw_canvas(3.927) // ≈225 degrees
}

window.onafterprint = ()=>{
    animation_data.color_scheme = get_system_color_scheme();
    animation_data.requestId =  requestAnimationFrame(run_animation);
}


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    animation_data.color_scheme = get_system_color_scheme();
});

animation_data.requestId =  requestAnimationFrame(run_animation);

