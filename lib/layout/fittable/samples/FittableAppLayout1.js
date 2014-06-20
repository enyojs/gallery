enyo.kind({
	name: "enyo.sample.FittableAppLayout1",
	kind: "FittableRows",
	classes: "enyo-fit",
	components: [
		{kind: "onyx.Toolbar", components: [
			{content: "Header"},
			{kind: "onyx.Button", content: "Button"},
			{kind: "onyx.InputDecorator", components: [
				{kind: "onyx.Input"}
			]}
		]},
		{kind: "FittableColumns", fit: true, components: [
			{style: "width: 30%;"},
			{kind: "FittableRows", fit: true, classes: "fittable-sample-shadow", components: [
				{classes: "fittable-sample-shadow2", style: "height: 30%; position: relative; z-index: 1;"},
				{fit: true, classes: "fittable-sample-fitting-color"}
			]}
		]}
	]
});