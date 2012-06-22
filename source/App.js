enyo.kind({
	name: "App",
	kind: "FittableRows",
	components: [
		{classes: "toolbar", components: [
			{classes: "onyx-toolbar-inline toolbar-inner", components: [
				{tag: "a", attributes: {href: "http://enyojs.com"}, components: [
					{kind: "Image", src: "images/enyo-logo.png", classes: "toolbar-logo"}
				]},
				{content: "Community Gallery"},
				{classes: "toolbar-search", components: [
					{kind: "onyx.InputDecorator", classes: "toolbar-search-input-decorator", components: [
						{kind: "onyx.Input", name: "searchInput", placeholder: "Search...",
							oninput: "handleSearch", onblur: "handleBlurFocus", onfocus: "handleBlurFocus", defaultFocus: true},
						{kind: "Image", name: "clearInput", src: "images/search-input-search.png", ontap: "clearInput"}
					]}
				]}
			]}
		]},
		{kind: "Scroller", fit: true, classes: "main", ondragfinish: "preventTap", components: [
			// using media query to determine which one should be displayed
			{name: "cards", classes: "cards"},
			{name: "list", classes: "list"}
		]},
		{kind: "Details", showing: false, centered: true, modal: true, floating: true, onHide: "hideDetails"}
	],
	create: function() {
		this.inherited(arguments);
		window.onhashchange = enyo.bind(this, "hashChange");
		//this.$.scroller.getStrategy().translateOptimized = true;
	},
	rendered: function() {
		this.inherited(arguments);
		this.fetchGalleryData();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.$.details.adjustSize(this.getBounds());
		this.$.details.updatePosition();
	},
	handleBlurFocus: function(inSender, inEvent) {
		inSender.addRemoveClass("toolbar-blurred", inEvent.type === "focus");
	},
	clearInput: function() {
		this.$.searchInput.setValue("");
		this.$.clearInput.setSrc("images/search-input-search.png");
	},
	handleSearch: function(inSender){
		if (this.widgets) {
			var searchValue = inSender.getValue().toLowerCase();
			var searchResults = {};
			if (searchValue === "") {
				this.renderItems();
			} else {
				for (var x in this.widgets) {
					var w = this.widgets[x];
					//Check name:
					if (w.name.toLowerCase().indexOf(searchValue) > -1) {
						searchResults[x] = this.widgets[x];
					//Check owner:
					} else if (w.owner.name.toLowerCase().indexOf(searchValue) > -1) {
						searchResults[x] = this.widgets[x];
					//Check Blurb:
					} else if (w.blurb.toLowerCase().indexOf(searchValue) > -1) {
						searchResults[x] = this.widgets[x];
					}
				}
				this.renderItems(searchResults);
				this.$.clearInput.setSrc("images/search-input-cancel.png");
			}
		}
	},
	fetchGalleryData: function() {
		new enyo.Ajax({url: "gallery_manifest.json"})
			.response(this, function(inSender, inResponse) {
				this.widgets = {};
				var ws = inResponse.widgets;
				for (var i in ws) {
					var w = ws[i];
					this.widgets[w.name] = w;
					w.owner = inResponse.owners[w.owner];
				}
				this.renderItems();
				this.hashChange();
			})
			.go();
	},
	renderItems: function(customItems) {
		this.$.cards.destroyClientControls();
		this.$.list.destroyClientControls();
		//
		var items = customItems || this.widgets;
		//
		// to sorted by submission date array
		items = this.toDateSortedArray(items);
		//
		for (var i=0, w; (w=items[i]); i++) {
			var more = {info: w, ontap: "itemTap"};
			this.createComponent({kind: "Card", container: this.$.cards}, more);
			this.createComponent({kind: "ListItem", container: this.$.list}, more);
		}
		// to make cards in last row left-aligned
		for (i=0; i<3; i++) {
			this.createComponent({kind: "Card", container: this.$.cards, classes: "card-empty"});
		}
		this.$.cards.render();
		this.$.list.render();
	},
	toDateSortedArray: function(inItems) {
		var ls = [];
		for (var n in inItems) {
			ls.push(inItems[n]);
		}
		ls.sort(function(i1, i2) {
			var d1 = new Date(i1.submissionDate);
			var d2 = new Date(i2.submissionDate);
			if (d1 > d2) {
				return -1;
			} else if (d1 < d2) {
				return 1;
			} else {
				return 0;
			}
		});
		return ls;
	},
	back: function() {
		if (this.itemTapped) {
			this.itemTapped = false;
			window.history.back();
		} else {
			this.setHashComponentName("");
		}
	},
	itemTap: function(inSender) {
		this.itemTapped = true;
		this.setHashComponentName(inSender.info.name);
		return true;
	},
	showDetails: function(inInfo) {
		this.$.details.setInfo(inInfo);
		this.$.details.adjustSize(this.getBounds());
		this.$.details.show();
		onyx.scrim.show();
	},
	hideDetails: function() {
		onyx.scrim.hide();
		this.back();
	},
	preventTap: function(inSender, inEvent) {
		inEvent.preventTap();
	},
	getHashComponentName: function() {
		return window.location.hash.slice(1);
	},
	setHashComponentName: function(inName) {
		window.location.hash = inName;
	},
	hashChange: function() {
		var n = this.getHashComponentName();
		if (n && this.widgets[n]) {
			this.showDetails(this.widgets[n]);
		}
	}
});

enyo.kind({
	name: "ListItem",
	classes:"listitem",
	published: {
		info: ""
	},
	components: [
		{name: "name", classes: "name"},
		{name: "owner", classes: "owner"}
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
	},
	infoChanged: function() {
		var i = this.info;
		if (!i) {
			return;
		}
		this.$.name.setContent(i.displayName);
		this.$.owner.setContent("by " + i.owner.name);
	}
});

enyo.kind({
	name: "Card",
	kind: "ListItem",
	kindClasses: "card",
	components: [
		{classes: "card-topbar", components: [
			{name: "name", classes: "name"},
			{name: "owner", classes: "owner"}
		]},
		{classes: "icon-holder", components: [
			{name: "icon", kind: "Image", classes: "icon"}
		]}
	],
	infoChanged: function() {
		this.inherited(arguments);
		if (this.info) {
			this.$.icon.setSrc("gallery_images/" + this.info.name + ".jpg");
		}
	}
});

enyo.kind({
	name: "Details",
	kind: "onyx.Popup",
	kindClasses: "details",
	layoutKind: "FittableRowsLayout",
	published: {
		info: "",
		maxHeight: ""
	},
	components: [
		{classes: "details-header", components: [
			{name: "close", kind: "onyx.Icon", src: "images/close-icon.png", classes: "details-close", ontap: "hide"},
			{name: "name", classes: "name"},
			{name: "owner", classes: "owner"},
			{name: "links", classes: "links", allowHtml: true}
		]},
		{kind: "Scroller", horizontal: "hidden", fit: true, classes: "details-scroller", components: [
			{classes: "details-scroller-content", components: [
				{name: "blurb", classes: "blurb", allowHtml: true},
				{classes: "icon-holder", components: [
					{name: "icon", kind: "Image", classes: "icon"}
				]},
				{classes: "details-buttons", defaultKind: "onyx.Button", components: [
					{name: "demo", classes: "onyx-blue", content: "Demo", ontap: "gotoDemo"},
					{name: "source", classes: "onyx-blue", content: "View Source", ontap: "gotoSource"}
				]},
				{name: "submissionDate", kind: "Field"},
				{name: "testedPlatforms", kind: "Field"},
				{name: "license", kind: "Field"},
				{name: "dependencies", kind: "Field"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
	},
	adjustSize: function(inContainerBounds) {
		var b = inContainerBounds;
		this.applyStyle("width", Math.min(720, b.width-40) + "px");
		this.applyStyle("height", Math.min(800, b.height-80) + "px");
	},
	infoChanged: function() {
		var i = this.info;
		if (!i) {
			return;
		}
		//
		this.$.demo.setShowing(i.demoUrl);
		//
		this.$.name.setContent(i.displayName);
		this.$.owner.setContent("by " + i.owner.name);
		var links = "";
		if (i.owner.website) {
			links = "<a href='" + i.owner.website + "' target='_blank'>Website</a>";
		}
		if (i.owner.twitter) {
			links += "<a href='http://www.twitter.com/" + i.owner.twitter + "' target='_blank'>Twitter</a>";
		}
		this.$.links.setContent(links);
		this.$.icon.setSrc("gallery_images/" + i.name + ".jpg");
		this.$.blurb.setContent(i.blurb);
		//
		this.$.submissionDate.setNameValue({name: "Submission Date", value: (i.submissionDate || "Unknown")});
		this.$.testedPlatforms.setNameValue({name: "Tested Platforms", value: (i.testedPlatforms || "Unknown")});
		this.$.license.setNameValue({name: "License", value: i.license});
		var dep = [];
		enyo.forEach(i.dependencies, function(d) {
			dep.push(d.name + (d.version ? "/" + d.version : ""));
		});
		this.$.dependencies.setNameValue({name: "Dependencies", value: (dep.length && dep.join(", ") || "None")});
	},
	gotoSource: function() {
		window.open(this.info.url);
		return true;
	},
	gotoDemo: function() {
		window.open(this.info.demoUrl);
		return true;
	}
});

enyo.kind({
	name: "Field",
	classes: "field",
	components: [
		{name: "name", classes: "field-name"},
		{name: "value", classes: "field-value"}
	],
	setNameValue: function(inNameValue) {
		this.$.name.setContent(inNameValue.name);
		this.$.value.setContent(inNameValue.value);
	}
});
