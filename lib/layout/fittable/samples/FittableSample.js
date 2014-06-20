enyo.kind({
	name: "enyo.sample.FittableSample",
	kind: "FittableRows",
	classes: "fittable-sample-box enyo-fit",
	components: [
		{content: "Foo<br>Foo", allowHtml: true, classes: "fittable-sample-box fittable-sample-mtb"},
		{content: "Foo<br>Foo", allowHtml: true, classes: "fittable-sample-box fittable-sample-mtb"},
		{kind: "FittableColumns", fit: true, classes: "fittable-sample-box fittable-sample-mtb fittable-sample-o", components: [
			{content: "Foo", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "Foo", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "Fits!", fit: true, classes: "fittable-sample-box fittable-sample-mlr fittable-sample-o"},
			{content: "Foo", classes: "fittable-sample-box fittable-sample-mlr"}
		]},
		{kind: "FittableColumns", content: "Bat", classes: "fittable-sample-box fittable-sample-mtb enyo-center", components: [
			{content: "Centered", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "1", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "2", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "3", classes: "fittable-sample-box fittable-sample-mlr"},
			{content: "4", classes: "fittable-sample-box fittable-sample-mlr"}
		]}
	]
});