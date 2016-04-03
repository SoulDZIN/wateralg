var $ = require('jQuery');
var Rx = require('rx');
var extend = $.extend;

function ElementResizer() {

}

extend(ElementResizer.prototype, {
    create: function(element, options) {
        if(!element) {
            throw new Error("'element' is required");
        }

        ctx = new ElementResizerContext(element, options);

        return ctx;
    }
});

function ElementResizerContext(element, options) {
    this._element = $(element);
    this._options = extend({}, ElementResizerContext, options);
    this._subject = new Rx.Subject();
}

ElementResizerContext.DEFAULT = {
    type: 'props'
};

extend(ElementResizerContext.prototype, {
    start: function() {
        var self = this;
        this.stop();

        var sub = Rx.Observable
            .fromEvent($(window), 'resize')
            .subscribe(function(){
                self._resize();                
            });

        this._subscription = sub;

        return this;
    },
    stop: function() {
        if(this._subscription) {
            this._subscription.dispose();
            this._subscription = null;
        }

        return this;
    },
    element: function() {
        return this._element;
    },
    observable: function() {
        return this._subject.asObservable();
    },
    _resize: function() {
        this._resizeToParent();        
        this._triggerResize();
    },
    _setSize: function(size) {
        var element = this._element;

        if(this._options.type === 'props') {
            element[0].width = size.width;
            element[0].height = size.height;
        } else {
            element.width(size.width);
            element.height(size.height);
        }

    },
    _resizeToParent: function() {
        var $parent = this._element.parent();
        var dim = {
            width: $parent.width(),
            height: $parent.height()
        };
    },
    _triggerResize: function() {
        this._subject.onNext(this);
    },
    _getParent: function() {
        return this._canvas.parent();
    }
});

module.exports = new ElementResizer();
