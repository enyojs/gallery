enyo.kind({
	name: "enyo.sample.FittableAppLayout3",
	kind: "FittableColumns",
	classes: "enyo-fit",
	components: [
		{kind: "FittableRows", fit: true, components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{classes: "fittable-sample-shadow3", style: "height: 30%; position: relative;"},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "1"}
			]}
		]},
		{kind: "FittableRows", classes: "fittable-sample-shadow", style: "width: 30%; position: relative;", components: [
			{fit: true},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]}
	]
});