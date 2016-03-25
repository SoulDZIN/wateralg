var $ = require('jquery');
var graphicalTest = require('./lib/graphicalTest');

function start(opt) {
    if(!opt.canvas) {
        throw new Error("Expected 'canvas' in options");
    }
    if(!opt.canvas.main) {
        throw new Error("Expected 'canvas.main' in options");
    }
    
    var $canvas = $(opt.canvas);

    if(opt.canvas.debug) {

    }


}

function draw(canvas) {
    var ctx = canvas.getContext('2d');
    var dim = getSize(canvas);

    drawSquares(ctx);
}

function drawSquares(ctx) {
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect (10, 10, 55, 50);

    ctx.fillStyle = "rgba(0,0,200,0.5)";
    ctx.fillRect (30, 30, 55, 50);
}

function getSize(canvas) {
    return { width: canvas.width, height: canvas.height };
}

function setSize(canvas, box) {
    canvas.width = box.width;
    canvas.height = box.height;
}

function sizeToParent(canvas) {
    var $parent = $(canvas).parent();
    var box = { width: $parent.width(), height: $parent.height() };
    setSize(canvas, box);
}

function handleUnsupported() {
    throw new Error('Your browser does not support the latest HTML 5 features. Please update or switch browsers and try again.');
}

function start(opt) {
    if(!opt.canvas) {
        throw new Error("Expected 'canvas' in options");
    }

    var $canvas = $(opt.canvas);
    var canvas = $canvas[0];
    sizeToParent(canvas);

    if(!canvas.getContext) {
        return handleUnsupported();                        
    } 

    $(window).resize(function(){
        sizeToParent(canvas);
        draw(canvas);
    });

    draw(canvas);
}

function main(opt) {
    $(document).ready(function documentReady(){
        start(opt);        
    });
}

// --- globals
global.main = main;

