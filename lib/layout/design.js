/**
	Descriptions to make layout kinds available in Ares.
*/
Palette.model.push(
	{name: "fittable", items: [
		{name: "FittableRows", description: "Vertical stacked layout",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; height: 15px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableRows"}
		},
		{name: "FittableColumns", description: "Horizontal stacked layout",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
				{style: "background-color: lightblue; border: 1px dotted blue; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "FittableColumns"}
		}
	]},
	{name: "imageview", items: [
		{name: "ImageCarousel", description: "A carousel of images",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageCarousel"}
		},
		{name: "ImageView", description: "A scalable Image View",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageView"}
		},
		{name: "ImageViewPin", description: "An unscaled item inside an ImageView",
			inline: {},
			config: {content: "$name", isContainer: true, kind: "ImageViewPin"}
		},
	]},
	{name: "List", items: [
		{name: "AroundList", description: "List with elements above the list",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "AroundList", onSetupItem: "", count: 0}
		},
		{name: "List", description: "Infinite scrolling list",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "List", onSetupItem: "", count: 0}
		},
		{name: "PulldownList", description: "List with pull-to-refresh",
			inline: {kind: "FittableRows", style: "height: 80px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true, content: ". . ."},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"},
				{style: "background-color: lightgreen; border: 1px dotted green; height: 10px;"}
			]},
			config: {content: "$name", isContainer: false, kind: "PulldownList", onSetupItem: "", count: 0}
		}
	]},
	{name: "Panels", items: [
		{name: "CardArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CardArranger"}
		},
		{name: "CardSlideInArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CardSlideInArranger"}
		},
		{name: "CarouselArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CarouselArranger"}
		},
		{name: "CollapsingArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "CollapsingArranger", components: [
				{content: "Placeholder"}
			]}
		},
		{name: "DockRightArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "DockRightArranger"}
		},
		{name: "GridArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "GridArranger"}
		},
		{name: "LeftRightArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "LeftRightArranger"}
		},
		{name: "UpDownArranger", description: "Selectable sub-view",
			inline: {kind: "FittableColumns", style: "height: 60px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightgreen; border: 1px dotted green;", fit: true},
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"}
			]},
			config: {content: "$name", isContainer: true, kind: "Panels", arrangerKind: "UpDownArranger"}
		},
	]},
	{name: "Slideable", items: [
		{name: "Slideable", description: "Slideable sub-view",
			inline: {kind: "FittableColumns", style: "height: 40px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true}
			]},
			config: {content: "$name", isContainer: true, kind: "Slideable"}
		}
	]},
	{name: "Tree", items: [
		{name: "Node", description: "A tree node",
			inline: {kind: "FittableColumns", style: "height: 40px; position: relative;", padding: 4, components: [
				{style: "background-color: lightgreen; border: 1px dotted green; width: 20px;"},
				{style: "background-color: lightblue; border: 1px dotted blue;", fit: true},
			]},
			config: {content: "$name", isContainer: true, kind: "Node"}
		}
	]}	
);