enyo.kind({
	name: "Dependency",
	kind: "onyx.Groupbox",
	classes: "inner-group",
	published: {
		header: ""
	},
	events: {
		onRemove: "",
	},
	components: [
		{kind: "onyx.GroupboxHeader", name: "header"},
		{classes: "enyo-children-inline", components: [
			{content: "Name:"},
			{kind: "onyx.Input", name: "name", classes: "dep-name", placeholder: "Dependency Name"},
			{content: "Version:"},
			{kind: "onyx.Input", name: "version", classes: "dep-ver", placeholder: "Dependency Version"},
			{kind: "onyx.Button", classes: "onyx-negative", content: "Remove", ontap: "remove"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerChanged();
	},
	headerChanged: function() {
		this.$.header.setContent(this.header);
	},
	remove: function() {
		this.doRemove({dependency: this});
	},
	getInfo: function() {
		return {
			name: this.$.name.getValue(),
			version: this.$.version.getValue()
		};
	},
	setInfo: function(inInfo) {
		this.$.name.setValue(inInfo.name);
		this.$.version.setValue(inInfo.version);
	}
});
