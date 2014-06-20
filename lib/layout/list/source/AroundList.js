/**
    _enyo.AroundList_ is an <a href="#enyo.List">enyo.List</a> that allows
    content to be displayed around its rows.

        {kind: "enyo.AroundList", onSetupItem: "setupItem",
            aboveComponents: [
                {content: "Content above the list"}
            ],
            components: [
                {content: "List item"}
            ]
        }
*/
enyo.kind({
	name: "enyo.AroundList",
	kind: "enyo.List",
	//* @protected
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "aboveClient"},
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "holdingarea", allowHtml: true, classes: "enyo-list-holdingarea"},
			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page"},
			{name: "belowClient"},
			{name: "placeholder"},
			{name: "swipeableComponents", style: "position:absolute; display:block; top:-1000px; left:0px;"}
		]}
	],
	//* @public
	//* Block of components to be rendered above the list
	aboveComponents: null,
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		if (this.aboveComponents) {
			this.$.aboveClient.createComponents(this.aboveComponents, {owner: this.owner});
		}
		if (this.belowComponents) {
			this.$.belowClient.createComponents(this.belowComponents, {owner: this.owner});
		}
	},
	updateMetrics: function() {
		this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100);
		this.pageCount = Math.ceil(this.count / this.rowsPerPage);
		this.aboveHeight = this.$.aboveClient.getBounds().height;
		this.belowHeight = this.$.belowClient.getBounds().height;
		this.portSize = this.aboveHeight + this.belowHeight;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageHeight(i);
		}
		this.adjustPortSize();
	},
	positionPage: function(inPage, inTarget) {
		inTarget.pageNo = inPage;
		var y = this.pageToPosition(inPage);
		var o = this.bottomUp ? this.belowHeight : this.aboveHeight;
		y += o;
		inTarget.applyStyle(this.pageBound, y + "px");
	},
	scrollToContentStart: function() {
		var y = this.bottomUp ? this.belowHeight : this.aboveHeight;
		this.setScrollPosition(y);
	}
});