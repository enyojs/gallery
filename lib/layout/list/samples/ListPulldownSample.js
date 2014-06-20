enyo.kind({
	name: "enyo.sample.ListPulldownSample",
	classes: "enyo-unselectable enyo-fit onyx",
	kind: "FittableRows",
	components: [
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.InputDecorator", components: [
				{name: "searchInput", kind: "onyx.Input", value: "enyojs", placeholder: "Enter seach term"},
				{kind: "Image", src: "assets/search-input-search.png", style: "width: 20px;"}
			]},
			{kind: "onyx.Button", content: "search", ontap: "search"}
		]},
		{name: "list", kind: "PulldownList", classes: "list-sample-pulldown-list", fit: true, onSetupItem: "setupItem", onPullRelease: "pullRelease", onPullComplete: "pullComplete", components: [
			{style: "padding: 10px;", classes: "list-sample-pulldown-item enyo-border-box", components: [
				{name: "icon", kind: "Image", style: "float: left; width: 48px; height: 48px; padding: 0 10px 10px 0;"},
				{name: "name", tag: "span", style: "font-weight: bold;"},
				{name: "handle", tag: "span", style: "color: lightgrey;"},
				{name: "date", tag: "span", style: "float: right; color: lightgrey;"},
				{tag: "br"},
				{name: "text", tag: "p", style: "word-wrap: break-word;", allowHtml: true}
			]}
		]}
	],
	rendered: function() {
		this.inherited(arguments);
		this.search();
	},
	pullRelease: function() {
		this.pulled = true;
		// add 1 second delay so we can see the loading message
		setTimeout(enyo.bind(this, function() {
			this.search();
		}), 1000);
	},
	pullComplete: function() {
		this.pulled = false;
		this.$.list.reset();
	},
	search: function() {
		// Capture searchText and strip any whitespace
		var searchText = this.$.searchInput.getValue().replace(/^\s+|\s+$/g, '');

		if (searchText !== "") {
			var req = new enyo.JsonpRequest({
				url: "http://search.twitter.com/search.json",
				callbackName: "callback"
			});
			req.response(enyo.bind(this, "processSearchResults"));
			req.go({q: searchText, rpp: 20});
		} else {
			// For whitespace searches, set new content value in order to display placeholder
			this.$.searchInput.setValue(searchText);
		}
	},
	processSearchResults: function(inRequest, inResponse) {
		this.results = inResponse.results;
		this.$.list.setCount(this.results.length);
		if (this.pulled) {
			this.$.list.completePull();
		} else {
			this.$.list.reset();
		}
	},
	setupItem: function(inSender, inEvent) {
		var i = inEvent.index;
		var item = this.results[i];
		this.$.icon.setSrc(item.profile_image_url);
		this.$.name.setContent(item.from_user_name);
		this.$.handle.setContent(" @" + item.from_user);
		this.$.date.setContent(this.getRelativeDateString(item.created_at));
		this.$.text.setContent(this.parseTweet(item.text));
	},
	getRelativeDateString: function(inDateString) {
		var d = new Date(inDateString);
		var td = new Date();
		var s;
		if (td.toLocaleDateString() == d.toLocaleDateString()) {
			var dh = td.getHours() - d.getHours();
			var dm = td.getMinutes() - d.getMinutes();
			s = dh ? dh + " hour" : (dm ? dm + " minute" : td.getSeconds() - d.getSeconds() + " second");
		} else {
			var dmo = td.getMonth() - d.getMonth();
			s = dmo ? dmo + " month" : td.getDate() - d.getDate() + " day";
		}
		return s.split(" ")[0] > 1 ? s + "s" : s;
	},
	parseTweet: function(inText) {
		var t = inText;
		t = t.replace(/[A-Za-z]+:\/\/[A-Za-z0-9_-]+\.[A-Za-z0-9_:%&~\?\/.=-]+/g, function(url) {
			return "<a href='" + url + "'target='_blank'>" + url + "</a>";
		});
		return t.replace(/[@]+[A-Za-z0-9_-]+/, function(u) {
			var username = u.replace("@", "");
			return "<a href='http://twitter.com/" + u + "'target='_blank'>@" + username + "</a>";
		});
	}
});