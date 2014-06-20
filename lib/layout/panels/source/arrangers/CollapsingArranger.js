/**
	_enyo.CollapsingArranger_ is an <a href="#enyo.Arranger">enyo.Arranger</a>
	that displays the active control, along with some number of inactive
	controls to fill the available space. The active control is positioned on
	the left side of the container and the rest of the views are laid out to the
	right. The last control, if visible, will expand to fill whatever space is
	not taken up by the previous controls.

	For best results with CollapsingArranger, you should set a minimum width
	for each control via a CSS style, e.g., _min-width: 25%_ or
	_min-width: 250px_.

	Transitions between arrangements are handled by sliding the new control	in
	from the right and collapsing the old control to the left.

	For more information, see the documentation on
	[Arrangers](https://github.com/enyojs/enyo/wiki/Arrangers) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.CollapsingArranger",
	kind: "CarouselArranger",
	/**
		The "peekWidth" property specifies the amount each panel should be
		offset from the left when it is selected. This allows controls on the
		underlying panel to the left of the selected one to be partially
		revealed.
	*/
	peekWidth: 0,
	//* @protected
	size: function() {
		this.clearLastSize();
		this.inherited(arguments);
	},
	// clear size from last if it's not actually the last
	// (required for adding another control)
	clearLastSize: function() {
		for (var i=0, c$=this.container.getPanels(), c; (c=c$[i]); i++) {
			if (c._fit && i != c$.length-1) {
				c.applyStyle("width", null);
				c._fit = null;
			}
		}
	},
	constructor: function() {
		this.inherited(arguments);
		this.peekWidth = this.container.peekWidth != null ? this.container.peekWidth : this.peekWidth;
	},
	arrange: function(inC, inIndex) {
		var c$ = this.container.getPanels();
		for (var i=0, e=this.containerPadding.left, m, c, n=0; (c=c$[i]); i++) {
			if(c.getShowing()){
				this.arrangeControl(c, {left: e + n * this.peekWidth});
				if (i >= inIndex) {
					e += c.width + c.marginWidth - this.peekWidth;
				}
				n++;
			} else {
				this.arrangeControl(c, {left: e});
				if (i >= inIndex) {
					e += c.width + c.marginWidth;
				}
			}
			// FIXME: overdragging-ish
			if (i == c$.length - 1 && inIndex < 0) {
				this.arrangeControl(c, {left: e - inIndex});
			}
		}
	},
	calcArrangementDifference: function(inI0, inA0, inI1, inA1) {
		var i = this.container.getPanels().length-1;
		return Math.abs(inA1[i].left - inA0[i].left);
	},
	flowControl: function(inControl, inA) {
		this.inherited(arguments);
		if (this.container.realtimeFit) {
			var c$ = this.container.getPanels();
			var l = c$.length-1;
			var last = c$[l];
			if (inControl == last) {
				this.fitControl(inControl, inA.left);
			}
		}

	},
	finish: function() {
		this.inherited(arguments);
		if (!this.container.realtimeFit && this.containerBounds) {
			var c$ = this.container.getPanels();
			var a$ = this.container.arrangement;
			var l = c$.length-1;
			var c = c$[l];
			this.fitControl(c, a$[l].left);
		}
	},
	fitControl: function(inControl, inOffset) {
		inControl._fit = true;
		inControl.applyStyle("width", (this.containerBounds.width - inOffset) + "px");
		inControl.resized();
	}
});
