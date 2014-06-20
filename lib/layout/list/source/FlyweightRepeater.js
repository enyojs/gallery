/**
	_enyo.FlyweightRepeater_ is a control that displays a repeating list of
	rows, suitable for displaying medium-sized lists (up to ~100 items). A
	flyweight strategy is employed to render one set of row controls, as needed,
	for as many rows as are contained in the repeater.

	The FlyweightRepeater's _components_ block contains the controls to be used
	for a single row. This set of controls will be rendered for each row. You
	may customize row rendering by handling the _onSetupItem_ event.

	The controls inside a FlyweightRepeater are non-interactive. This means that
	calling methods that would normally cause rendering to occur (e.g.,
	_setContent_) will not do so. However, you can force a row to render by
	calling	_renderRow(inRow)_.

	In addition, you can force a row to be temporarily interactive by calling
	_prepareRow(inRow)_. Call the _lockRow_ method when the	interaction is
	complete.

	For more information, see the documentation on
	[Lists](https://github.com/enyojs/enyo/wiki/Lists)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.FlyweightRepeater",
	published: {
		//* Number of rows to render
		count: 0,
		/**
			If true, the selection mechanism is disabled. Tap events are still
			sent, but items won't be automatically re-rendered when tapped.
		*/
		noSelect: false,
		//* If true, multiple selections are allowed
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false,
		/**
			Used to specify CSS classes for the repeater's wrapper component
			(client). Input is identical to enyo.Control.setClasses()
		*/
		clientClasses: '',
		/**
			Used to specify custom styling for the repeater's wrapper component
			(client). Input is identical to enyo.Control.setStyle()
		*/
		clientStyle: '',
		/**
			Offset applied to row number during generation. Used to allow a
			items to use a natural index instead of being forced to be
			0-based.  Must be positive, as row -1 is used for undefined rows
			in the event system.
		*/
		rowOffset: 0
	},
	events: {
		/**
			Fires once per row at render time.

			_inEvent.index_ contains the current row index.

			_inEvent.selected_ is a boolean indicating whether the current row
			is selected.
		*/
		onSetupItem: "",
		//* Fires after an individual row has been rendered from a call to _renderRow()_.
		onRenderRow: ""
	},
	//* design-time attribute, indicates if row indices run
	//* from [0.._count_-1] (false) or [_count_-1..0] (true)
	bottomUp: false,
	//* @protected
	components: [
		{kind: "Selection", onSelect: "selectDeselect", onDeselect: "selectDeselect"},
		{name: "client"}
	],
	create: function() {
		this.inherited(arguments);
		this.noSelectChanged();
		this.multiSelectChanged();
		this.clientClassesChanged();
		this.clientStyleChanged();
	},
	noSelectChanged: function() {
		if (this.noSelect) {
			this.$.selection.clear();
		}
	},
	multiSelectChanged: function() {
		this.$.selection.setMulti(this.multiSelect);
	},
	clientClassesChanged: function() {
		this.$.client.setClasses(this.clientClasses);
	},
	clientStyleChanged: function() {
		this.$.client.setStyle(this.clientStyle);
	},
	setupItem: function(inIndex) {
		this.doSetupItem({index: inIndex, selected: this.isSelected(inIndex)});
	},
	//* Renders the list.
	generateChildHtml: function() {
		var h = "";
		this.index = null;
		// note: can supply a rowOffset
		// and indicate if rows should be rendered top down or bottomUp
		for (var i=0, r=0; i<this.count; i++) {
			r = this.rowOffset + (this.bottomUp ? this.count - i-1 : i);
			this.setupItem(r);
			this.$.client.setAttribute("data-enyo-index", r);
			h += this.inherited(arguments);
			this.$.client.teardownRender();
		}
		return h;
	},
	previewDomEvent: function(inEvent) {
		var i = this.index = this.rowForEvent(inEvent);
		inEvent.rowIndex = inEvent.index = i;
		inEvent.flyweight = this;
	},
	decorateEvent: function(inEventName, inEvent, inSender) {
		// decorate event with index found via dom iff event does not already contain an index.
		var i = (inEvent && inEvent.index != null) ? inEvent.index : this.index;
		if (inEvent && i != null) {
			inEvent.index = i;
			inEvent.flyweight = this;
		}
		this.inherited(arguments);
	},
	tap: function(inSender, inEvent) {
		// ignore taps if selecting is disabled or if they don't target a row
		if (this.noSelect || inEvent.index === -1) {
			return;
		}
		if (this.toggleSelected) {
			this.$.selection.toggle(inEvent.index);
		} else {
			this.$.selection.select(inEvent.index);
		}
	},
	selectDeselect: function(inSender, inEvent) {
		this.renderRow(inEvent.key);
	},
	//* @public
	//* Returns the repeater's _selection_ component.
	getSelection: function() {
		return this.$.selection;
	},
	//* Gets the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.getSelection().isSelected(inIndex);
	},
	//* Renders the row specified by _inIndex_.
	renderRow: function(inIndex) {
		// do nothing if index is out-of-range
		if (inIndex < this.rowOffset || inIndex >= this.count + this.rowOffset) {
			return;
		}
		//this.index = null;
		// always call the setupItem callback, as we may rely on the post-render state
		this.setupItem(inIndex);
		var node = this.fetchRowNode(inIndex);
		if (node) {
			enyo.dom.setInnerHtml(node, this.$.client.generateChildHtml());
			this.$.client.teardownChildren();
			this.doRenderRow({rowIndex: inIndex});
		}
	},
	//* Fetches the DOM node for the given row index.
	fetchRowNode: function(inIndex) {
		if (this.hasNode()) {
			return this.node.querySelector('[data-enyo-index="' + inIndex + '"]');
		}
	},
	//* Fetches the row number corresponding with the target of a given event.
	rowForEvent: function(inEvent) {
		if (!this.hasNode()) {
			return -1;
		}
		var n = inEvent.target;
		while (n && n !== this.node) {
			var i = n.getAttribute && n.getAttribute("data-enyo-index");
			if (i !== null) {
				return Number(i);
			}
			n = n.parentNode;
		}
		return -1;
	},
	//* Prepares the row specified by _inIndex_ such that changes made to the
	//* controls inside the repeater will be rendered for the given row.
	prepareRow: function(inIndex) {
		// do nothing if index is out-of-range
		if (inIndex < 0 || inIndex >= this.count) {
			return;
		}
		// update row internals to match model
		this.setupItem(inIndex);
		var n = this.fetchRowNode(inIndex);
		enyo.FlyweightRepeater.claimNode(this.$.client, n);
	},
	//* Prevents rendering of changes made to controls inside the repeater.
	lockRow: function() {
		this.$.client.teardownChildren();
	},
	//* Prepares the row specified by _inIndex_ such that changes made to the
	//* controls in the row will be rendered in the given row; then performs the
	//* function _inFunc_, and, finally, locks the row.
	performOnRow: function(inIndex, inFunc, inContext) {
		// do nothing if index is out-of-range
		if (inIndex < 0 || inIndex >= this.count) {
			return;
		}
		if (inFunc) {
			this.prepareRow(inIndex);
			enyo.call(inContext || null, inFunc);
			this.lockRow();
		}
	},
	statics: {
		//* Associates a flyweight rendered control (_inControl_) with a
		//* rendering context specified by _inNode_.
		claimNode: function(inControl, inNode) {
			var n;
			if (inNode) {
				if (inNode.id !== inControl.id) {
					n = inNode.querySelector("#" + inControl.id);
				}
				else {
					// inNode is already the right node, so just use it
					n = inNode;
				}
			}
			// FIXME: consider controls generated if we found a node or tag: null, the later so can teardown render
			inControl.generated = Boolean(n || !inControl.tag);
			inControl.node = n;
			if (inControl.node) {
				inControl.rendered();
			} else {
				//enyo.log("Failed to find node for",  inControl.id, inControl.generated);
			}
			// update control's class cache based on the node contents
			for (var i=0, c$=inControl.children, c; (c=c$[i]); i++) {
				this.claimNode(c, inNode);
			}
		}
	}
});