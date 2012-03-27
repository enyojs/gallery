enyo.kind({
	name: "Editor",
	components: [
		{kind: "onyx.Toolbar", content: "Gallery Editor", style: "text-align: center;"},
		{name: "widgets"},
		{classes: "middle", components: [
			{kind: "onyx.Button", ontap: "addWidgetTap", classes: "onyx-blue", content: "Add Gallery Item"},
			{kind: "onyx.Button", ontap: "saveGallery", classes: "onyx-affirmative", content: "Save Gallery"}
		]}
	],
	rendered: function() {
		this.inherited(arguments);
		this.getGallery();
	},
	getGallery: function() {
		var r = new enyo.Ajax({
			contentType: "application/json",
			url: "../gallery_manifest.json"
		});
		r.response(this, "processGallery");
		r.go();
	},
	addWidgetTap: function() {
		this.addWidget();
	},
	addWidget: function(inInfo) {
		var c = this.$.widgets.createComponent({kind: "GalleryComponent"}, {owner: this});
		if (inInfo) {
			c.setInfo(inInfo);
		}
		c.render();
	},
	saveGallery: function() {
		var gallery = [];
		for (var i = 0, c$ = this.$.widgets.getClientControls(), c, ci; c = c$[i]; i++) {
			ci = c.getInfo();
			if (this.verify(ci)) {
				gallery.push(ci);
			}
		}
		var r = new enyo.Ajax({
			url: "/",
			contentType: "application/json",
			handleAs: "text",
			method: "POST",
		});
		r.response(this, "log");
		r.go(enyo.json.stringify({widgets: gallery}));
	},
	processGallery: function(inSender, inResponse) {
		var gallery = inResponse.widgets;
		for (var i = 0, w; w = gallery[i]; i++) {
			this.addWidget(w);
		}
		this.addWidget();
	},
	verify: function(inInfo) {
		var need = ["name", "displayName", "owner", "url", "license", "version", "blurb"];
		for (var i = 0, n, ni; n = need[i]; i++) {
			ni = inInfo[n] || "";
			if (ni.length == 0) {
				return false;
			}
		}
		return true;
	}
});
