enyo.kind({
	name: "GalleryComponent",
	classes: "middle",
	components: [
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Name:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "name", placeholder: "Internal name, has to match screenshot name"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Display Name:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "displayName", placeholder: "Displayed name of widget"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Owner:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "owner", placeholder: "Your handle"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "URL:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "url", placeholder: "Github, forum post, etc"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Version:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "version", placeholder: "Can include <,>,=,!, and combinations thereof"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "License:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input", name: "license", placeholder: "GPL, MIT, BSD, Apache, etc"}
			]}
		]},
		{kind: "onyx.Groupbox", components: [
			{kind: "onyx.GroupboxHeader", content: "Dependencies:"},
			{name: "deps", onRemove: "remDep"},
			{kind: "onyx.Button", content: "Add Dependency", classes: "onyx-affirmative", style: "width: 100%;", ontap: "addDepTap"},
		]},
		{kind: "onyx.Groupbox", components: [
		{kind: "onyx.GroupboxHeader", content: "Description:"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.TextArea", placeholder: "Short description, leave the long text for your URL target", classes: "description", name: "blurb"}
			]},
		]},
	],
	addDepTap: function() {
		this.addDep();
	},
	addDep: function(inInfo) {
		var di = this.$.deps.getClientControls().length;
		var dc = this.$.deps.createComponent({kind: "Dependency", header: "Dependency " + di}, {owner: this});
		if (inInfo) {
			dc.setInfo(inInfo);
		}
		dc.render();
	},
	remDep: function(inSender, inEvent) {
		inEvent.dependency.destroy();
	},
	getDeps: function() {
		var deps = [];
		for (var i = 0, cc = this.$.deps.getClientControls(), d; d = cc[i]; i++) {
			d = d.getInfo();
			if (d.name && d.version) {
				deps.push(d);
			}
		}
		return deps;
	},
	getInfo: function() {
		return {
			name: this.$.name.getValue(),
			displayName: this.$.displayName.getValue(),
			owner: this.$.owner.getValue(),
			dependencies: this.getDeps(),
			url: this.$.url.getValue(),
			license: this.$.license.getValue() || "Unknown",
			version: this.$.version.getValue(),
			blurb: this.$.blurb.getValue()
		};
	},
	setInfo: function(inInfo) {
		var ks = Object.keys(inInfo);
		for (var i = 0, k, v; k = ks[i]; i++) {
			v = inInfo[k];
			if (this.$[k]) {
				this.$[k].setValue(v);
			} else if (k == "dependencies" && enyo.isArray(v)) {
				for (var j = 0, d; d = v[j]; j++) {
					this.addDep(d);
				}
			}
		}
	}
});
