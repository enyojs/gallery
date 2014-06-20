enyo.kind({
	name: "enyo.sample.FittableAppLayout2",
	kind: "FittableColumns",
	classes: "enyo-fit",
	components: [
		{kind: "FittableRows", style: "width: 20%;", components: [
			{fit: true},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "1"}
			]}
		]},
		{kind: "FittableRows", style: "width: 20%;", classes: "fittable-sample-shadow", components: [
			{fit: true, style: ""},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]},
		{kind: "FittableRows", fit: true, classes: "fittable-sample-shadow", components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{kind: "onyx.Toolbar", components: [
				{kind: "onyx.Button", content: "3"}
			]}
		]}
	]
});