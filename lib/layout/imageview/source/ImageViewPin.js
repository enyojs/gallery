/**
    _enyo.ImageViewPin_ is a control that can be used to display non-zooming
    content inside of a zoomable _enyo.ImageView_ control. The _anchor_ and
    _position_ properties can be used to position both the ImageViewPin and	its
    content in a specific location inside of the ImageView.
*/
enyo.kind({
	name: "enyo.ImageViewPin",
	kind: "enyo.Control",
	published: {
		/**
			If true, the anchor point for this pin will be highlighted in yellow,
			which can be useful for debugging. Defaults to false.
		*/
		highlightAnchorPoint: false,
		/**
			The coordinates at which this control should be anchored inside
			of the parent ImageView control. This position is relative to the
			ImageView control's original size. Works like standard CSS positioning,
			and accepts both px and percentage values. Defaults to _{top: 0px,
			left: 0px}_.

			* top: distance from the parent's top edge
			* bottom: distance from the parent's bottom edge (overrides top)
			* left: distance from the parent's left edge
			* right: distance from the parennt's right edge (overrides left)
		*/
		anchor: {
			top: 0,
			left: 0
		},
		/**
			The coordinates at which the contents of this control should be
			positioned relative to the ImageViewPin itself. Works like standard
			CSS positioning. Only accepts px values. Defaults to _{top: 0px,
			left: 0px}_.

			* top: distance from the ImageViewPin's top edge
			* bottom: distance from the ImageViewPin's bottom edge
			* left: distance from the ImageViewPin's left edge
			* right: distance from the ImageViewPin's right edge
		*/
		position: {
			top: 0,
			left: 0
		}
	},
	//* @protected
	style: "position:absolute;z-index:1000;width:0px;height:0px;",
	handlers: {
		onPositionPin: "reAnchor"
	},
	create: function() {
		this.inherited(arguments);
		this.styleClientControls();
		this.positionClientControls();
		this.highlightAnchorPointChanged();
		this.anchorChanged();
	},
	// Absolutely position to client controls
	styleClientControls: function() {
		var controls = this.getClientControls();
		for(var i=0;i<controls.length;i++) {
			controls[i].applyStyle("position","absolute");
		}
	},
	// Apply specified positioning to client controls
	positionClientControls: function() {
		var controls = this.getClientControls();
		for(var i=0;i<controls.length;i++) {
			for(var p in this.position) {
				controls[i].applyStyle(p, this.position[p]+"px");
			}
		}
	},
	// Update styling on anchor point
	highlightAnchorPointChanged: function() {
		this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
	},
	// Create coords{} object for each anchor containing value and units
	anchorChanged: function() {
		var coords = null, a = null;
		for(a in this.anchor) {
			coords = this.anchor[a].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
			if(!coords) {
				continue;
			}
			this.anchor[a+"Coords"] = {
				value: coords[1],
				units: coords[2] || "px"
			};
		}
	},
	/*
		Apply positioning to ImageViewPin specified in this.anchor{}.
		Called anytime the parent ImageView is rescaled. If right/bottom
		are specified, they override top/left.
	*/
	reAnchor: function(inSender, inEvent) {
		var scale = inEvent.scale;
		var bounds = inEvent.bounds;
		var left = (this.anchor.right)
			// Right
			? (this.anchor.rightCoords.units == "px")
				? (bounds.width + bounds.x - this.anchor.rightCoords.value*scale)
				: (bounds.width*(100-this.anchor.rightCoords.value)/100 + bounds.x)
			// Left
			: (this.anchor.leftCoords.units == "px")
				? (this.anchor.leftCoords.value*scale + bounds.x)
				: (bounds.width*this.anchor.leftCoords.value/100 + bounds.x);
		var top = (this.anchor.bottom)
			// Bottom
			? (this.anchor.bottomCoords.units == "px")
				? (bounds.height + bounds.y - this.anchor.bottomCoords.value*scale)
				: (bounds.height*(100-this.anchor.bottomCoords.value)/100 + bounds.y)
			// Top
			: (this.anchor.topCoords.units == "px")
				? (this.anchor.topCoords.value*scale + bounds.y)
				: (bounds.height*this.anchor.topCoords.value/100 + bounds.y);
		this.applyStyle("left", left+"px");
		this.applyStyle("top", top+"px");
	}
});