enyo.kind({
	name: "App",
	classes: "onyx enyo-unselectable",
	fit: true,
	components: [
		{classes: "toolbar", style: "height: 45px;", components: [
			{classes: "onyx-toolbar-inline toolbar-inner", components: [
				{kind: "Image", src: "images/enyo-logo.png", classes: "toolbar-logo"},
				{content: "Community Gallery"},
				{classes: "toolbar-search", components: [
					{kind: "onyx.InputDecorator", style: "padding: 5px; padding-top: 0px;", components: [
						{kind: "onyx.Input", placeholder: "Search...", onkeyup: "handleSearch", onblur: "handleBlurFocus", onfocus: "handleBlurFocus", defaultFocus: true},
						{kind: "Image", src: "images/search-input-search.png"}
					]}
				]}
			]},
		]},
		{name: "panels", classes: "panels enyo-fit", style: "top: 45px;", components: [
			{name: "main", kind: "Scroller", classes: "enyo-fit", ondragfinish: "preventTap", components: [
				// using media query to determine which one should be displayed
				{name: "cards", classes: "cards"},
				{name: "list", classes: "list"}
			]},
			{kind: "Details", showing: false, classes: "enyo-fit", onBack: "back"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		window.onhashchange = enyo.bind(this, "hashChange");
	},
	rendered: function() {
		this.inherited(arguments);
		this.fetchGalleryData();
	},
	handleBlurFocus: function(inSender, inEvent){
		if(inEvent.type === "focus"){
			inSender.removeClass("toolbar-blurred");
		}else if(inEvent.type === "blur"){
			inSender.addClass("toolbar-blurred");
		}
	},
	handleSearch: function(inSender){
		var searchValue = inSender.getValue().toLowerCase();
		var searchResults = {};
		
		if(searchValue === ""){
			this.renderItems();
		}else{
			for(var x in this.widgets){
				//Check name:
				if(this.widgets[x].name.toLowerCase().search(searchValue) !== -1){
					searchResults[x] = this.widgets[x];
				}
				//Check owner:
				else if(this.widgets[x].owner.name.toLowerCase().search(searchValue) !== -1){
					searchResults[x] = this.widgets[x];
				}
				//Check Blurb:
				else if(this.widgets[x].blurb.toLowerCase().search(searchValue) !== -1){
					searchResults[x] = this.widgets[x];
				}
			}
			this.renderItems(searchResults);
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
					this.widgets[w.name].owner = inResponse.owners[w.owner];
				}
				this.renderItems();
				this.hashChange();
			})
			.go();
	},
	renderItems: function(customItems) {
		this.$.cards.destroyClientControls();
		this.$.list.destroyClientControls();
		var items = customItems || this.widgets;
		for (var n in items) {
			var w = items[n];
			var more = {info: w, ontap: "itemTap"};
			this.createComponent({kind: "Card", container: this.$.cards}, more);
			this.createComponent({kind: "ListItem", container: this.$.list}, more);
		}
		// for matt
		for (var i=0; i<3; i++) {
			this.createComponent({kind: "Card", container: this.$.cards, classes: "card-empty"});
		}
		this.$.cards.render();
		this.$.list.render();
	},
	back: function() {
		if (this.itemTapped) {
			this.itemTapped = false;
			window.history.back();
		} else {
			this.setHashComponentName("");
		}
	},
	showHome: function() {
		this.$.main.show();
		this.$.details.hide();
	},
	itemTap: function(inSender) {
		this.itemTapped = true;
		this.setHashComponentName(inSender.info.name);
		return true;
	},
	showDetails: function(inInfo) {
		this.$.details.setInfo(inInfo);
		this.$.main.hide();
		this.$.details.show();
	},
	preventTap: function(inSender, inEvent) {
		inEvent.preventTap();
	},
	getHashComponentName: function() {
		return window.location.hash.slice(1);;
	},
	setHashComponentName: function(inName) {
		window.location.hash = inName;
	},
	hashChange: function() {
		var n = this.getHashComponentName();
		if (n && this.widgets[n]) {
			this.showDetails(this.widgets[n]);
		} else {
			this.showHome();
		}
	}
});

enyo.kind({
	name: "Info",
	published: {
		info: "",
		showLinks: false,
		showBlurb: false,
	},
	components: [
		{name: "name", classes: "info-name"},
		{name: "owner", classes: "info-owner"},
		{name: "links", classes: "info-links", allowHtml: true},
		{name: "blurb", classes: "info-blurb", allowHtml: true},
		{classes: "info-icon-holder", components: [
			{name: "icon", kind: "Image", classes: "info-icon"}
		]},
		{name: "client", classes: "info-client"}
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
		this.showLinksChanged();
		this.showBlurbChanged();
	},
	infoChanged: function() {
		var i = this.info;
		if (!i) {
			return;
		}
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
	},
	showLinksChanged: function() {
		this.$.links.setShowing(this.showLinks);
	},
	showBlurbChanged: function() {
		this.$.blurb.setShowing(this.showBlurb);
	}
});

enyo.kind({
	name: "ListItem",
	classes:"listitem",
	published: {
		info: ""
	},
	components: [
		{name: "name", classes: "info-name"},
		{name: "owner", classes: "info-owner"}
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
	},
	infoChanged: function() {
		var i = this.info;
		this.$.name.setContent(i.displayName);
		this.$.owner.setContent("by " + i.owner.name);
	}
});

enyo.kind({
	name: "Card",
	kind: "ListItem",
	kindClasses: "card",
	components: [
		{kind: "Info", classes: "enyo-fit card-info"}
	],
	infoChanged: function() {
		this.$.info.setInfo(this.info);
	}
});

enyo.kind({
	name: "Details",
	kind: "Scroller",
	classes: "details",
	published: {
		info: ""
	},
	events: {
		onBack: ""
	},
	components: [
		{components: [
			{classes: "details-main", components: [
				{classes: "details-topbar", components: [
					{kind: "onyx.Button", classes: "details-back-button", content: "Back", ontap: "doBack"},
					{showing: false, kind: "Stars"},
					{style: "float: right;", components: [
						{name: "demo", kind: "onyx.Button", classes: "onyx-blue", content: "Demo", ontap: "gotoDemo"},
						{name: "source", kind: "onyx.Button", classes: "onyx-blue", content: "View Source", ontap: "gotoSource"}
					]}
				]},
				{kind: "Info", classes: "details-info", showLinks: true, showBlurb: true, components: [
					{name: "submissionDate", allowHtml: true},
					{name: "testedPlatforms", allowHtml: true},
					{name: "license", allowHtml: true},
					{name: "dependencies", allowHtml: true}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.infoChanged();
	},
	infoChanged: function() {
		var i = this.info;
		this.$.info.setInfo(i);
		this.$.demo.setShowing(i.demoUrl);
		this.$.submissionDate.setContent(this.generateFieldHtml("Submission Date", (i.submissionDate || "Unknown")));
		this.$.testedPlatforms.setContent(this.generateFieldHtml("Tested Platforms", (i.testedPlatforms || "Unknown")));
		this.$.license.setContent(this.generateFieldHtml("License", i.license));
		var dep = [];
		enyo.forEach(i.dependencies, function(d) {
			dep.push(d.name + (d.version ? "/" + d.version : ""));
		});
		this.$.dependencies.setContent(this.generateFieldHtml("Dependencies", (dep.length && dep.join(", ") || "None")));
	},
	generateFieldHtml: function(inName, inValue) {
		return "<b>" + inName + "</b><br><i>" + inValue + "</i><br><br>";
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
