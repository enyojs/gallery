/**
	_enyo.FittableLayout_ provides the base positioning and boundary logic for
	the fittable layout strategy. The fittable layout strategy is based on
	laying out items in either a set of rows or a set of columns, with most of
	the items having natural size, but one item expanding to fill the remaining
	space. The item that expands is labeled with the attribute _fit: true_.

	The subkinds <a href="#enyo.FittableColumnsLayout">enyo.FittableColumnsLayout</a>
	and	<a href="#enyo.FittableRowsLayout">enyo.FittableRowsLayout</a> (or
	<i>their</i> subkinds) are used for layout rather than _enyo.FittableLayout_
	because they specify properties that the framework expects to be available
	when laying	items out.

	For more information,see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.FittableLayout",
	kind: "Layout",
	//* @protected
	calcFitIndex: function() {
		for (var i=0, c$=this.container.children, c; (c=c$[i]); i++) {
			if (c.fit && c.showing) {
				return i;
			}
		}
	},
	getFitControl: function() {
		var c$=this.container.children;
		var f = c$[this.fitIndex];
		if (!(f && f.fit && f.showing)) {
			this.fitIndex = this.calcFitIndex();
			f = c$[this.fitIndex];
		}
		return f;
	},
	getLastControl: function() {
		var c$=this.container.children;
		var i = c$.length-1;
		var c = c$[i];
		while ((c=c$[i]) && !c.showing) {
			i--;
		}
		return c;
	},
	_reflow: function(measure, cMeasure, mAttr, nAttr) {
		this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
		var f = this.getFitControl();
		// no sizing if nothing is fit.
		if (!f) {
			return;
		}
		//
		// determine container size, available space
		var s=0, a=0, b=0, p;
		var n = this.container.hasNode();
		// calculate available space
		if (n) {
			// measure 1
			p = enyo.dom.calcPaddingExtents(n);
			// measure 2
			s = n[cMeasure] - (p[mAttr] + p[nAttr]);
			//enyo.log("overall size", s);
		}
		//
		// calculate space above fitting control
		// measure 3
		var fb = f.getBounds();
		// offset - container padding.
		a = fb[mAttr] - ((p && p[mAttr]) || 0);
		//enyo.log("above", a);
		//
		// calculate space below fitting control
		var l = this.getLastControl();
		if (l) {
			// measure 4
			var mb = enyo.dom.getComputedBoxValue(l.hasNode(), "margin", nAttr) || 0;
			if (l != f) {
				// measure 5
				var lb = l.getBounds();
				// fit offset + size
				var bf = fb[mAttr] + fb[measure];
				// last offset + size + ending margin
				var bl = lb[mAttr] + lb[measure] + mb;
				// space below is bottom of last item - bottom of fit item.
				b = bl - bf;
			} else {
				b = mb;
			}
		}

		// calculate appropriate size for fit control
		var fs = s - (a + b);
		//enyo.log(f.id, fs);
		// note: must be border-box;
		f.applyStyle(measure, fs + "px");
	},
	//* @public
	/**
		Updates the layout to reflect any changes to contained components or the
		layout container.
	*/
	reflow: function() {
		if (this.orient == "h") {
			this._reflow("width", "clientWidth", "left", "right");
		} else {
			this._reflow("height", "clientHeight", "top", "bottom");
		}
	}
});

/**
	_enyo.FittableColumnsLayout_ provides a container in which items are laid
	out in a set of vertical columns, with most of the items having natural
	size, but one expanding to fill the remaining space. The one that expands is
	labeled with the attribute _fit: true_.

	_enyo.FittableColumnsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.FittableColumnsLayout",
	kind: "FittableLayout",
	orient: "h",
	layoutClass: "enyo-fittable-columns-layout"
});


/**
	_enyo.FittableRowsLayout_ provides a container in which items are laid out
	in a set of horizontal rows, with most of the items having natural size, but
	one expanding to fill the remaining space. The one that expands is labeled
	with the attribute _fit: true_.

	_enyo.FittableRowsLayout_ is meant to be used as a value for the
	_layoutKind_ property of other kinds. _layoutKind_ provides a way to add
	layout behavior in a pluggable fashion while retaining the ability to use a
	specific base kind.

	For more information, see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.FittableRowsLayout",
	kind: "FittableLayout",
	layoutClass: "enyo-fittable-rows-layout",
	orient: "v"
});
