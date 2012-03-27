enyo.kind({
	name: "Stars", 
	published: {
		stars: 0
	},
	starWidth: 20,
	classes: "stars",
	components: [
		{name: "fill", classes: "stars-fill"}
	],
	create: function() {
		this.inherited(arguments);
		this.starsChanged();
	},
	starsChanged: function() {
		var w = Math.floor(this.stars * this.starWidth) + "px";
		this.$.fill.applyStyle("width", w);
	}
});