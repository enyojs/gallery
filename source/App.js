enyo.kind({
	name: "App",
	classes:"enyo-fill",
	kind: "FittableRows",
	components: [
		{kind:"onyx.Toolbar", layoutKind:"FittableColumnsLayout", components: [
				{tag: "a", attributes: {href: "http://enyojs.com"}, components: [
					{kind: "Image", src: "images/enyo-logo.png", classes: "toolbar-logo"}
				]},
				{tag:"h1", content: "Community Gallery", fit:true}
		]},
		{
			kind:"Panels",
			arrangerKind:"CollapsingArranger",
			fit:true,
			components:[
				{
					name:"listPanel",
					kind:"FittableRows",
					style:"width:100%;",
					components:[
						{classes: "toolbar-search enyo-children-inline", components: [
							{kind: "onyx.MenuDecorator", onSelect: "itemSelected", style:"min-width:150px; margin-right:5px;", components: [
								{content: "Categories", kind: "onyx.Button", onActivate: "preventMenuActivate", style: "border-right:0px;"},
								{allowHtml:true, content:"&#x25BC;", style: "border-radius: 1 3px 3px 1; border-left:0px;"},
								{kind: "onyx.Menu", components: [
									{content: "1"},
									{content: "2"},
									{classes: "onyx-menu-divider"},
									{content: "3"}
								]}
							]},
							{kind: "onyx.InputDecorator", classes: "toolbar-search-input-decorator", style:"min-width:80%;", components: [
								{kind: "onyx.Input", name: "searchInput", placeholder: "Search...",
									oninput: "handleSearch", onblur: "handleBlurFocus", onfocus: "handleBlurFocus", defaultFocus: true},
								{kind: "Image", name: "clearInput", src: "images/search-input-search.png", style:"float:right;", ontap: "clearInput"}
							]}
						]},
						{name: "list", kind:"enyo.DataGridList",
							fit:true,
							//orientation:"horizontal",
							scrollerOptions:{touch:true},
							minWidth: 320, minHeight: 110, spacing: 5,
							classes:"data-repeater-sample",
							components: [
								{classes:"repeater-item", ontap:"itemTap", components: [
									{classes: "name-wrapper", components: [
										{
											style:"width:220px",
											components:[
												{name: "displayName", classes: "name"},
												{name:"createdBy", classes:"name last small"},
												{name: "name", classes: "name last bottom"},
											]
										},
										{classes: "icon-holder", tag: "span", components: [
											{name: "icon", kind: "Image", classes: "icon"}
										]},
										//{name: "lastNameLetter", classes: "name last-letter", tag: "span"}
									]}
								], bindings: [
									{from: ".model.name", to: ".$.name.content"},
									{from: ".model.displayName", to: ".$.displayName.content"},
									{from: ".model.owner", to: ".$.createdBy.content",
										transform:function(v,d,b){var ownerInfo = b.owner.owner.lookupOwnerInfo(v); return ownerInfo?("by " + ownerInfo.name):"";}},
									{from: ".model", to: ".$.icon.src", transform: function (v,d,b) { if (!v) return ""; return ("gallery_images/" + v.get("name") + ".jpg") }},
									{from: ".model", to: ".classes", transform: function(v,d,b){return ("repeater-item class" + (1+b.owner.index%5));}}
								]}
							]}

					]
				},
				{kind: "Details", fit: true, classes:"details animated-panel", onHide: "hideDetails"},
			]
		}

	],
	create: function() {
		this.inherited(arguments);
		window.onhashchange = enyo.bind(this, "hashChange");
		//this.$.scroller.getStrategy().translateOptimized = true;
		this.widgets = new WidgetCollection();
		this.owners = {};//new OwnerCollection();
		this.$.list.set("collection", this.widgets);
	},
	rendered: function() {
		this.inherited(arguments);
		this.fetchGalleryData();
	},
	/*
	resizeHandler: function() {
		this.inherited(arguments);
		this.$.details.adjustSize(this.getBounds());
		this.$.details.updatePosition();
	},*/
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
				var ws = inResponse.widgets;
				this.widgets.add(ws, {merge:true});

				var os = inResponse.owners;
				this.owners = os;
				console.log("owners", this.owners);
				console.log("wigets", this.widgets);
				this.hashChange();
			})
			.go();
	},

	lookupOwnerInfo: function(owner){
		var ownerInfo = this.owners[owner];
		return ownerInfo;
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
	itemTap: function(inSender, inEvent) {
		this.itemTapped = true;
		console.log("tapped", inSender, inEvent);
		var name = inEvent.model.get("name");
		this.setHashComponentName(name);
		return true;
	},
	showDetails: function(widget) {

		this.$.details.setWidget(widget);
		if (enyo.Panels.isScreenNarrow()){
			this.$.panels.set("index",1);
		}else{
			this.$.panels.set("index",0);
		}
/*		this.$.details.adjustSize(this.getBounds());
		this.$.details.show();
		//onyx.scrim.show();*/
	},
	hideDetails: function() {
		//onyx.scrim.hide();
		this.$.listPanel.setBounds({width:"100%"});
		this.$.panels.set("index",0);
		this.$.panels.resize();
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
		var widget =  enyo.store.find(WidgetModel,
						function(model){return (model.get("name")===n);},
						{all:false});
		if (n && widget) {
			this.$.listPanel.setBounds({width:"320px"});
			this.$.panels.set("index",0);
			this.$.panels.resize();
			this.showDetails(widget);
		}
	}
});

enyo.kind({
	name: "Details",
	kind:"FittableRows",
	//kind: "onyx.Popup",
	kindClasses: "details",
	layoutKind: "FittableRowsLayout",
	published: {
		widget: null,
		maxHeight: ""
	},
	events:{
		onHide:""
	},
	components: [
		{classes: "details-header", components: [
			{name: "close", kind: "onyx.Icon", src: "images/close-icon.png", classes: "details-close", ontap: "doHide"},
			{name: "name", classes: "name"},
			{name: "owner", classes: "owner"},
			{name: "links", classes: "links", allowHtml: true}
		]},
		{kind: "Scroller", horizontal: "hidden", fit: true, classes: "details-scroller", components: [
			{classes: "details-scroller-content", components: [
				{name: "blurb", classes: "blurb", allowHtml: true},
				{classes: "detail icon-holder", components: [
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
		this.widgetChanged();
	},
	adjustSize: function(inContainerBounds) {
		var b = inContainerBounds;
		this.applyStyle("width", Math.min(720, b.width-40) + "px");
		this.applyStyle("height", Math.min(800, b.height-80) + "px");
	},
	widgetChanged: function() {
		if (!this.widget){
			return;
		}
		//console.log("widget in details is", this.widget);
		var i = this.widget.raw();
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
		window.open(this.widget.get("url"));
		return true;
	},
	gotoDemo: function() {
		window.open(this.widget.get("demoUrl"));
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
