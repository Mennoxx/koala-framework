/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 *
 * http://extjs.com/license
 */

/*
 * IMPORTANT:
 * This file was copied to fix a bug resizing with constraint.
 * Depending on the position where grabing the handle it was possible on resize
 * to move outside of constraint region.
 */

/**
 * @class Ext2.Resizable
 * @extends Ext2.util.Observable
 * <p>Applies drag handles to an element to make it resizable. The drag handles are inserted into the element
 * and positioned absolute. Some elements, such as a textarea or image, don't support this. To overcome that, you can wrap
 * the textarea in a div and set "resizeChild" to true (or to the id of the element), <b>or</b> set wrap:true in your config and
 * the element will be wrapped for you automatically.</p>
 * <p>Here is the list of valid resize handles:</p>
 * <pre>
Value   Description
------  -------------------
 'n'     north
 's'     south
 'e'     east
 'w'     west
 'nw'    northwest
 'sw'    southwest
 'se'    southeast
 'ne'    northeast
 'all'   all
</pre>
 * <p>Here's an example showing the creation of a typical Resizable:</p>
 * <pre><code>
var resizer = new Ext2.Resizable("element-id", {
    handles: 'all',
    minWidth: 200,
    minHeight: 100,
    maxWidth: 500,
    maxHeight: 400,
    pinned: true
});
resizer.on("resize", myHandler);
</code></pre>
 * <p>To hide a particular handle, set its display to none in CSS, or through script:<br>
 * resizer.east.setDisplayed(false);</p>
 * @cfg {Boolean/String/Element} resizeChild True to resize the first child, or id/element to resize (defaults to false)
 * @cfg {Array/String} adjustments String "auto" or an array [width, height] with values to be <b>added</b> to the
 * resize operation's new size (defaults to [0, 0])
 * @cfg {Number} minWidth The minimum width for the element (defaults to 5)
 * @cfg {Number} minHeight The minimum height for the element (defaults to 5)
 * @cfg {Number} maxWidth The maximum width for the element (defaults to 10000)
 * @cfg {Number} maxHeight The maximum height for the element (defaults to 10000)
 * @cfg {Boolean} enabled False to disable resizing (defaults to true)
 * @cfg {Boolean} wrap True to wrap an element with a div if needed (required for textareas and images, defaults to false)
 * @cfg {Number} width The width of the element in pixels (defaults to null)
 * @cfg {Number} height The height of the element in pixels (defaults to null)
 * @cfg {Boolean} animate True to animate the resize (not compatible with dynamic sizing, defaults to false)
 * @cfg {Number} duration Animation duration if animate = true (defaults to .35)
 * @cfg {Boolean} dynamic True to resize the element while dragging instead of using a proxy (defaults to false)
 * @cfg {String} handles String consisting of the resize handles to display (defaults to undefined)
 * @cfg {Boolean} multiDirectional <b>Deprecated</b>.  The old style of adding multi-direction resize handles, deprecated
 * in favor of the handles config option (defaults to false)
 * @cfg {Boolean} disableTrackOver True to disable mouse tracking. This is only applied at config time. (defaults to false)
 * @cfg {String} easing Animation easing if animate = true (defaults to 'easingOutStrong')
 * @cfg {Number} widthIncrement The increment to snap the width resize in pixels (dynamic must be true, defaults to 0)
 * @cfg {Number} heightIncrement The increment to snap the height resize in pixels (dynamic must be true, defaults to 0)
 * @cfg {Boolean} pinned True to ensure that the resize handles are always visible, false to display them only when the
 * user mouses over the resizable borders. This is only applied at config time. (defaults to false)
 * @cfg {Boolean} preserveRatio True to preserve the original ratio between height and width during resize (defaults to false)
 * @cfg {Boolean} transparent True for transparent handles. This is only applied at config time. (defaults to false)
 * @cfg {Number} minX The minimum allowed page X for the element (only used for west resizing, defaults to 0)
 * @cfg {Number} minY The minimum allowed page Y for the element (only used for north resizing, defaults to 0)
 * @cfg {Boolean} draggable Convenience to initialize drag drop (defaults to false)
 * @constructor
 * Create a new resizable component
 * @param {Mixed} el The id or element to resize
 * @param {Object} config configuration options
  */
Kwf.Utils.Resizable = function(el, config){
    this.el = Ext2.get(el);

    if(config && config.wrap){
        config.resizeChild = this.el;
        this.el = this.el.wrap(typeof config.wrap == "object" ? config.wrap : {cls:"xresizable-wrap"});
        this.el.id = this.el.dom.id = config.resizeChild.id + "-rzwrap";
        this.el.setStyle("overflow", "hidden");
        this.el.setPositioning(config.resizeChild.getPositioning());
        config.resizeChild.clearPositioning();
        if(!config.width || !config.height){
            var csize = config.resizeChild.getSize();
            this.el.setSize(csize.width, csize.height);
        }
        if(config.pinned && !config.adjustments){
            config.adjustments = "auto";
        }
    }

    /**
     * The proxy Element that is resized in place of the real Element during the resize operation.
     * This may be queried using {@link Ext2.Element#getBox} to provide the new area to resize to.
     * Read only.
     * @type Ext2.Element.
     * @property proxy
     */
    this.proxy = this.el.createProxy({tag: "div", cls: "x2-resizable-proxy", id: this.el.id + "-rzproxy"}, Ext2.getBody());
    this.proxy.unselectable();
    this.proxy.enableDisplayMode('block');

    Ext2.apply(this, config);

    if(this.pinned){
        this.disableTrackOver = true;
        this.el.addClass("x2-resizable-pinned");
    }
    // if the element isn't positioned, make it relative
    var position = this.el.getStyle("position");
    if(position != "absolute" && position != "fixed"){
        this.el.setStyle("position", "relative");
    }
    if(!this.handles){ // no handles passed, must be legacy style
        this.handles = 's,e,se';
        if(this.multiDirectional){
            this.handles += ',n,w';
        }
    }
    if(this.handles == "all"){
        this.handles = "n s e w ne nw se sw";
    }
    var hs = this.handles.split(/\s*?[,;]\s*?| /);
    var ps = Ext2.Resizable.positions;
    for(var i = 0, len = hs.length; i < len; i++){
        if(hs[i] && ps[hs[i]]){
            var pos = ps[hs[i]];
            this[pos] = new Ext2.Resizable.Handle(this, pos, this.disableTrackOver, this.transparent);
        }
    }
    // legacy
    this.corner = this.southeast;

    if(this.handles.indexOf("n") != -1 || this.handles.indexOf("w") != -1){
        this.updateBox = true;
    }

    this.activeHandle = null;

    if(this.resizeChild){
        if(typeof this.resizeChild == "boolean"){
            this.resizeChild = Ext2.get(this.el.dom.firstChild, true);
        }else{
            this.resizeChild = Ext2.get(this.resizeChild, true);
        }
    }

    if(this.adjustments == "auto"){
        var rc = this.resizeChild;
        var hw = this.west, he = this.east, hn = this.north, hs = this.south;
        if(rc && (hw || hn)){
            rc.position("relative");
            rc.setLeft(hw ? hw.el.getWidth() : 0);
            rc.setTop(hn ? hn.el.getHeight() : 0);
        }
        this.adjustments = [
            (he ? -he.el.getWidth() : 0) + (hw ? -hw.el.getWidth() : 0),
            (hn ? -hn.el.getHeight() : 0) + (hs ? -hs.el.getHeight() : 0) -1
        ];
    }

    if(this.draggable){
        this.dd = this.dynamic ?
            this.el.initDD(null) : this.el.initDDProxy(null, {dragElId: this.proxy.id});
        this.dd.setHandleElId(this.resizeChild ? this.resizeChild.id : this.el.id);
    }

    // public events
    this.addEvents(
        "beforeresize",
        "resize"
    );

    if(this.width !== null && this.height !== null){
        this.resizeTo(this.width, this.height);
    }else{
        this.updateChildSize();
    }
    if(Ext2.isIE){
        this.el.dom.style.zoom = 1;
    }
    Kwf.Utils.Resizable.superclass.constructor.call(this);
};

Ext2.extend(Kwf.Utils.Resizable, Ext2.util.Observable, {
        resizeChild : false,
        adjustments : [0, 0],
        minWidth : 5,
        minHeight : 5,
        maxWidth : 10000,
        maxHeight : 10000,
        enabled : true,
        animate : false,
        duration : .35,
        dynamic : false,
        handles : false,
        multiDirectional : false,
        disableTrackOver : false,
        easing : 'easeOutStrong',
        widthIncrement : 0,
        heightIncrement : 0,
        pinned : false,
        width : null,
        height : null,
        preserveRatio : false,
        transparent: false,
        minX: 0,
        minY: 0,
        draggable: false,
        grabOffsets: null,

        /**
         * @cfg {Mixed} constrainTo Constrain the resize to a particular element
         */
        /**
         * @cfg {Ext2.lib.Region} resizeRegion Constrain the resize to a particular region
         */

        /**
         * @event beforeresize
         * Fired before resize is allowed. Set enabled to false to cancel resize.
         * @param {Ext2.Resizable} this
         * @param {Ext2.EventObject} e The mousedown event
         */
        /**
         * @event resize
         * Fired after a resize.
         * @param {Ext2.Resizable} this
         * @param {Number} width The new width
         * @param {Number} height The new height
         * @param {Ext2.EventObject} e The mouseup event
         */

    /**
     * Perform a manual resize
     * @param {Number} width
     * @param {Number} height
     */
    resizeTo : function(width, height){
        this.el.setSize(width, height);
        this.updateChildSize();
        this.fireEvent("resize", this, width, height, null);
    },

    // private
    startSizing : function(e, handle){
        this.fireEvent("beforeresize", this, e);
        if(this.enabled){ // 2nd enabled check in case disabled before beforeresize handler

            if(!this.overlay){
                this.overlay = this.el.createProxy({tag: "div", cls: "x2-resizable-overlay", html: "&#160;"}, Ext2.getBody());
                this.overlay.unselectable();
                this.overlay.enableDisplayMode("block");
                this.overlay.on("mousemove", this.onMouseMove, this);
                this.overlay.on("mouseup", this.onMouseUp, this);
            }
            this.overlay.setStyle("cursor", handle.el.getStyle("cursor"));

            this.resizing = true;
            this.startBox = this.el.getBox();
            this.startPoint = e.getXY();
            this.offsets = [(this.startBox.x + this.startBox.width) - this.startPoint[0],
                            (this.startBox.y + this.startBox.height) - this.startPoint[1]];

            this.overlay.setSize(Ext2.lib.Dom.getViewWidth(true), Ext2.lib.Dom.getViewHeight(true));
            this.overlay.show();

            this.grabOffsets = [0, 0];
            if(this.constrainTo) {
                var handleXY = handle.el.getXY();
                var yOffset = 0;
                var xOffset = 0;
                if (handle.position.indexOf('south') !== -1) {
                    yOffset = (e.getXY()[1] - handleXY[1]) - handle.el.getHeight();
                }
                if (handle.position.indexOf('north') !== -1) {
                    yOffset = e.getXY()[1] - handleXY[1];
                }
                if (handle.position.indexOf('east') !== -1) {
                    xOffset = (e.getXY()[0] - handleXY[0]) - handle.el.getWidth();
                }
                if (handle.position.indexOf('west') !== -1) {
                    xOffset = e.getXY()[0] - handleXY[0];
                }
                this.grabOffsets = [xOffset, yOffset];
                var ct = Ext2.get(this.constrainTo);
                this.resizeRegion = ct.getRegion().adjust(
                    ct.getFrameWidth('t'),
                    ct.getFrameWidth('l'),
                    -ct.getFrameWidth('b'),
                    -ct.getFrameWidth('r')
                );
            }

            this.proxy.setStyle('visibility', 'hidden'); // workaround display none
            this.proxy.show();
            this.proxy.setBox(this.startBox);
            if(!this.dynamic){
                this.proxy.setStyle('visibility', 'visible');
            }
        }
    },

    // private
    onMouseDown : function(handle, e){
        if(this.enabled){
            e.stopEvent();
            this.activeHandle = handle;
            this.startSizing(e, handle);
        }
    },

    // private
    onMouseUp : function(e){
        this.activeHandle = null;
        var size = this.resizeElement();
        this.resizing = false;
        this.handleOut();
        this.overlay.hide();
        this.proxy.hide();
        this.fireEvent("resize", this, size.width, size.height, e);
    },

    // private
    updateChildSize : function(){
        if(this.resizeChild){
            var el = this.el;
            var child = this.resizeChild;
            var adj = this.adjustments;
            if(el.dom.offsetWidth){
                var b = el.getSize(true);
                child.setSize(b.width+adj[0], b.height+adj[1]);
            }
            // Second call here for IE
            // The first call enables instant resizing and
            // the second call corrects scroll bars if they
            // exist
            if(Ext2.isIE){
                setTimeout(function(){
                    if(el.dom.offsetWidth){
                        var b = el.getSize(true);
                        child.setSize(b.width+adj[0], b.height+adj[1]);
                    }
                }, 10);
            }
        }
    },

    // private
    snap : function(value, inc, min){
        if(!inc || !value) return value;
        var newValue = value;
        var m = value % inc;
        if(m > 0){
            if(m > (inc/2)){
                newValue = value + (inc-m);
            }else{
                newValue = value - m;
            }
        }
        return Math.max(min, newValue);
    },

    /**
     * <p>Performs resizing of the associated Element. This method is called internally by this
     * class, and should not be called by user code.</p>
     * <p>If a Resizable is being used to resize an Element which encapsulates a more complex UI
     * component such as a Panel, this method may be overridden by specifying an implementation
     * as a config option to provide appropriate behaviour at the end of the resize operation on
     * mouseup, for example resizing the Panel, and relaying the Panel's content.</p>
     * <p>The new area to be resized to is available by examining the state of the {@link #proxy}
     * Element. Example:
<pre><code>
new Ext2.Panel({
    title: 'Resize me',
    x: 100,
    y: 100,
    renderTo: Ext2.getBody(),
    floating: true,
    frame: true,
    width: 400,
    height: 200,
    listeners: {
        render: function(p) {
            new Ext2.Resizable(p.getEl(), {
                handles: 'all',
                pinned: true,
                transparent: true,
                resizeElement: function() {
                    var box = this.proxy.getBox();
                    p.updateBox(box);
                    if (p.layout) {
                        p.doLayout();
                    }
                    return box;
                }
           });
       }
    }
}).show();
</code></pre>
     */
    resizeElement : function(){
        var box = this.proxy.getBox();
        if(this.updateBox){
            this.el.setBox(box, false, this.animate, this.duration, null, this.easing);
        }else{
            this.el.setSize(box.width, box.height, this.animate, this.duration, null, this.easing);
        }
        this.updateChildSize();
        if(!this.dynamic){
            this.proxy.hide();
        }
        return box;
    },

    // private
    constrain : function(v, diff, m, mx){
        if(v - diff < m){
            diff = v - m;
        }else if(v - diff > mx){
            diff = v - mx;
        }
        return diff;
    },

    // private
    onMouseMove : function(e){
        if(this.enabled && this.activeHandle){
            try{// try catch so if something goes wrong the user doesn't get hung

            // Reason for resize problem: the location where grabing the handle
            var point = e.getPoint();
            point.adjust(-this.grabOffsets[1], -this.grabOffsets[0],
                -this.grabOffsets[1], -this.grabOffsets[0]);
            if(this.resizeRegion && !this.resizeRegion.contains(point)) {
                return;
            }

            //var curXY = this.startPoint;
            var curSize = this.curSize || this.startBox;
            var x = this.startBox.x, y = this.startBox.y;
            var ox = x, oy = y;
            var w = curSize.width, h = curSize.height;
            var ow = w, oh = h;
            var mw = this.minWidth, mh = this.minHeight;
            var mxw = this.maxWidth, mxh = this.maxHeight;
            var wi = this.widthIncrement;
            var hi = this.heightIncrement;

            var eventXY = e.getXY();
            var diffX = -(this.startPoint[0] - Math.max(this.minX, eventXY[0]));
            var diffY = -(this.startPoint[1] - Math.max(this.minY, eventXY[1]));

            var pos = this.activeHandle.position;

            switch(pos){
                case "east":
                    w += diffX;
                    w = Math.min(Math.max(mw, w), mxw);
                    break;
                case "south":
                    h += diffY;
                    h = Math.min(Math.max(mh, h), mxh);
                    break;
                case "southeast":
                    w += diffX;
                    h += diffY;
                    w = Math.min(Math.max(mw, w), mxw);
                    h = Math.min(Math.max(mh, h), mxh);
                    break;
                case "north":
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    break;
                case "west":
                    diffX = this.constrain(w, diffX, mw, mxw);
                    x += diffX;
                    w -= diffX;
                    break;
                case "northeast":
                    w += diffX;
                    w = Math.min(Math.max(mw, w), mxw);
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    break;
                case "northwest":
                    diffX = this.constrain(w, diffX, mw, mxw);
                    diffY = this.constrain(h, diffY, mh, mxh);
                    y += diffY;
                    h -= diffY;
                    x += diffX;
                    w -= diffX;
                    break;
               case "southwest":
                    diffX = this.constrain(w, diffX, mw, mxw);
                    h += diffY;
                    h = Math.min(Math.max(mh, h), mxh);
                    x += diffX;
                    w -= diffX;
                    break;
            }

            var sw = this.snap(w, wi, mw);
            var sh = this.snap(h, hi, mh);
            if(sw != w || sh != h){
                switch(pos){
                    case "northeast":
                        y -= sh - h;
                    break;
                    case "north":
                        y -= sh - h;
                        break;
                    case "southwest":
                        x -= sw - w;
                    break;
                    case "west":
                        x -= sw - w;
                        break;
                    case "northwest":
                        x -= sw - w;
                        y -= sh - h;
                    break;
                }
                w = sw;
                h = sh;
            }

            if(this.preserveRatio){
                switch(pos){
                    case "southeast":
                    case "east":
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        w = ow * (h/oh);
                       break;
                    case "south":
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                        break;
                    case "northeast":
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                    break;
                    case "north":
                        var tw = w;
                        w = ow * (h/oh);
                        w = Math.min(Math.max(mw, w), mxw);
                        h = oh * (w/ow);
                        x += (tw - w) / 2;
                        break;
                    case "southwest":
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        var tw = w;
                        w = ow * (h/oh);
                        x += tw - w;
                        break;
                    case "west":
                        var th = h;
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        y += (th - h) / 2;
                        var tw = w;
                        w = ow * (h/oh);
                        x += tw - w;
                       break;
                    case "northwest":
                        var tw = w;
                        var th = h;
                        h = oh * (w/ow);
                        h = Math.min(Math.max(mh, h), mxh);
                        w = ow * (h/oh);
                        y += th - h;
                         x += tw - w;
                       break;

                }
            }
            this.proxy.setBounds(x, y, w, h);
            if(this.dynamic){
                this.resizeElement();
            }
            }catch(e){}
        }
    },

    // private
    handleOver : function(){
        if(this.enabled){
            this.el.addClass("x2-resizable-over");
        }
    },

    // private
    handleOut : function(){
        if(!this.resizing){
            this.el.removeClass("x2-resizable-over");
        }
    },

    /**
     * Returns the element this component is bound to.
     * @return {Ext2.Element}
     */
    getEl : function(){
        return this.el;
    },

    /**
     * Returns the resizeChild element (or null).
     * @return {Ext2.Element}
     */
    getResizeChild : function(){
        return this.resizeChild;
    },

    /**
     * Destroys this resizable. If the element was wrapped and
     * removeEl is not true then the element remains.
     * @param {Boolean} removeEl (optional) true to remove the element from the DOM
     */
    destroy : function(removeEl){
        Ext2.destroy(this.dd, this.overlay, this.proxy);
        this.overlay = null;
        this.proxy = null;

        var ps = Ext2.Resizable.positions;
        for(var k in ps){
            if(typeof ps[k] != "function" && this[ps[k]]){
                this[ps[k]].destroy();
            }
        }
        if(removeEl){
            this.el.update("");
            Ext2.destroy(this.el);
            this.el = null;
        }
        this.purgeListeners();
    },

    syncHandleHeight : function(){
        var h = this.el.getHeight(true);
        if(this.west){
            this.west.el.setHeight(h);
        }
        if(this.east){
            this.east.el.setHeight(h);
        }
    }
});