/**
	_enyo.LeftRightArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a>
	that displays the active control and some of the previous and next controls.
	The active control is centered horizontally in the container, and the
	previous and next controls are laid out to the left and right, respectively.

	Transitions between arrangements are handled by sliding the new control
	in from the right and sliding the active control out to the left.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.LeftRightArranger",
	kind: "Arranger",
	//* The margin width (i.e., how much of the previous and next controls
	//* are visible) in pixels
	margin: 40,
	//* @protected
	axisSize: "width",
	offAxisSize: "height",
	axisPosition: "left",
	constructor: function() {
		this.inherited(arguments);
		this.margin = this.container.margin != null ? this.container.margin : this.margin;
	},
	size: function() {
		var c$ = this.container.getPanels();
		var port = this.containerBounds[this.axisSize];
		var box = port - this.margin -this.margin;
		for (var i=0, b, c; (c=c$[i]); i++) {
			b = {};
			b[this.axisSize] = box;
			b[this.offAxisSize] = "100%";
			c.setBounds(b);
		}
	},
	start: function() {
		this.inherited(arguments);

		var s = this.container.fromIndex;
		var f = this.container.toIndex;
		var c$ = this.getOrderedControls(f);
		var o = Math.floor(c$.length/2);

		for (var i=0, c; (c=c$[i]); i++) {
			if (s > f){
				if (i == (c$.length - o)){
					c.applyStyle("z-index", 0);
				} else {
					c.applyStyle("z-index", 1);
				}
			} else {
				if (i == (c$.length-1 - o)){
					c.applyStyle("z-index", 0);
				} else {
					c.applyStyle("z-index", 1);
				}
			}
		}
	},
	arrange: function(inC, inIndex) {
		var i,c,v,b;
		if (this.container.getPanels().length==1){
			b = {};
			b[this.axisPosition] = this.margin;
			this.arrangeControl(this.container.getPanels()[0], b);
			return;
		}
		var o = Math.floor(this.container.getPanels().length/2);
		var c$ = this.getOrderedControls(Math.floor(inIndex)-o);
		var box = this.containerBounds[this.axisSize] - this.margin -this.margin;
		var e = this.margin - box * o;
		for (i=0; (c=c$[i]); i++) {
			b = {};
			b[this.axisPosition] = e;
			this.arrangeControl(c, b);
			e += box;
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		if (this.container.getPanels().length==1){
			return 0;
		}

		var i = Math.abs(inI0 % this.c$.length);
		//enyo.log(inI0, inI1);
		return inA0[i][this.axisPosition] - inA1[i][this.axisPosition];
	},
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; (c=c$[i]); i++) {
			enyo.Arranger.positionControl(c, {left: null, top: null});
			enyo.Arranger.opacifyControl(c, 1);
			c.applyStyle("left", null);
			c.applyStyle("top", null);
			c.applyStyle("height", null);
			c.applyStyle("width", null);
		}
		this.inherited(arguments);
	}
});

//* @public
/**
	_enyo.TopBottomArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a>
	that displays the active control and some of the previous and next controls.
	The active control is centered vertically in the container, and the previous
	and next controls are laid out above and below, respectively.

	Transitions between arrangements are handled by sliding the new control
	in from the bottom and sliding the active control out the top.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.TopBottomArranger",
	kind: "LeftRightArranger",
	//* Property of the drag event used to calculate the amount a drag moves
	//* the layout
	dragProp: "ddy",
	//* Property of the drag event used to calculate the direction of a drag
	dragDirectionProp: "yDirection",
	//* Property of the drag event used to calculate whether a drag should occur
	canDragProp: "vertical",
	//* @protected
	axisSize: "height",
	offAxisSize: "width",
	axisPosition: "top"
});

//* @public
/**
	_enyo.SpiralArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a> that
	arranges controls in a spiral. The active control is positioned on top and
	the other controls are laid out in a spiral pattern below.

	Transitions between arrangements are handled by rotating the new control
	up from below and rotating the active control down to the end of the spiral.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.SpiralArranger",
	kind: "Arranger",
	//* Always go through incremental arrangements when transitioning
	incrementalPoints: true,
	//* The amount of space between successive controls
	inc: 20,
	//* @protected
	size: function() {
		var c$ = this.container.getPanels();
		var b = this.containerBounds;
		var w = this.controlWidth = b.width/3;
		var h = this.controlHeight = b.height/3;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inName) {
		var s = this.inc;
		for (var i=0, l=inC.length, c; (c=inC[i]); i++) {
			var x = Math.cos(i/l * 2*Math.PI) * i * s + this.controlWidth;
			var y = Math.sin(i/l * 2*Math.PI) * i * s + this.controlHeight;
			this.arrangeControl(c, {left: x, top: y});
		}
	},
	start: function() {
		this.inherited(arguments);
		var c$ = this.getOrderedControls(this.container.toIndex);
		for (var i=0, c; (c=c$[i]); i++) {
			c.applyStyle("z-index", c$.length - i);
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.controlWidth;
	},
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; (c=c$[i]); i++) {
			c.applyStyle("z-index", null);
			enyo.Arranger.positionControl(c, {left: null, top: null});
			c.applyStyle("left", null);
			c.applyStyle("top", null);
			c.applyStyle("height", null);
			c.applyStyle("width", null);
		}
		this.inherited(arguments);
	}
});

//* @public
/**
	_enyo.GridArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a> that
	arranges controls in a grid. The active control is positioned at the
	top-left of the grid and the other controls are laid out from left to right
	and then from top to bottom.

	Transitions between arrangements are handled by moving the active control to
	the end of the grid and shifting the other controls	to the left, or up to
	the previous row, to fill the space.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.GridArranger",
	kind: "Arranger",
	//* Always go through incremental arrangements when transitioning
	incrementalPoints: true,
	//* @public
	//* Column width
	colWidth: 100,
	//* Column height
	colHeight: 100,
	//* @protected
	size: function() {
		var c$ = this.container.getPanels();
		var w=this.colWidth, h=this.colHeight;
		for (var i=0, c; (c=c$[i]); i++) {
			c.setBounds({width: w, height: h});
		}
	},
	arrange: function(inC, inIndex) {
		var w=this.colWidth, h=this.colHeight;
		var cols = Math.max(1, Math.floor(this.containerBounds.width / w));
		var c;
		for (var y=0, i=0; i<inC.length; y++) {
			for (var x=0; (x<cols) && (c=inC[i]); x++, i++) {
				this.arrangeControl(c, {left: w*x, top: h*y});
			}
		}
	},
	flowControl: function(inControl, inA) {
		this.inherited(arguments);
		enyo.Arranger.opacifyControl(inControl, inA.top % this.colHeight !== 0 ? 0.25 : 1);
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		return this.colWidth;
	},
	destroy: function() {
		var c$ = this.container.getPanels();
		for (var i=0, c; (c=c$[i]); i++) {
			enyo.Arranger.positionControl(c, {left: null, top: null});
			c.applyStyle("left", null);
			c.applyStyle("top", null);
			c.applyStyle("height", null);
			c.applyStyle("width", null);
		}
		this.inherited(arguments);
	}
});
