enyo.kind({
	name: "enyo.sample.FittableAppLayout4",
	kind: "FittableColumns",
	classes: "enyo-fit",
	components: [
		{kind: "FittableRows", classes: "fittable-sample-shadow4", style: "width: 30%; position: relative; z-index: 1;", components: [
			{style: "height: 20%;"},
			{style: "height: 20%;"},
			{fit: true},
			{kind: "onyx.Toolbar", style: "height: 57px;", components: [
				{content: "Toolbar"}
			]}
		]},
		{kind: "FittableRows", fit: true, components: [
			{fit: true, classes: "fittable-sample-fitting-color"},
			{kind: "onyx.Toolbar", style: "height: 57px;",components: [
				{kind: "onyx.Button", content: "2"}
			]}
		]}
	]
});