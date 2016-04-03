var $ = require('jQuery');
var resizer = require('ElementResizer');
var extend = $.extend;

function CanvasComponent(canvas) {
    if(!canvas) {
        throw new Error("'canvas' is require");
    }

    this._canvas = canvas;
    this._ctx = this._canvas.getContext('2d');
    this._components = [];
    this._resizer = resizer
        .create(this._canvas)
        .start();
}

extend(CanvasComponent.prototype, {
    paint: function(timestamp) {
        if (!this._quit) {
            this._requestFrame();
        }

        var self = this;

        this._components
            .filter(function(comp){
                return this._shouldPaint(comp);                
            })
            .forEach(function(){
                comp.paint(ctx, timestamp);
            });
    },
    stop: function() {
        this._quit = true;
    },
    start: function() {
        this._quit = false;
        this._requestFrame();
    },
    _shouldPaint: function(comp) {
        return true;
    },
    _requestFrame: function() {
        var self = this;
        window.requestAnimationFrame(function(ts){
            self.paint(ts);
        });
    }


});


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

