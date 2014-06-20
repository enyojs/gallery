/**
	_enyo.FittableRows_ provides a container in which items are laid out in a
	set	of horizontal rows, with most of the items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.FittableRows",
	layoutKind: "FittableRowsLayout",
	/** By default, items in rows stretch to fit horizontally; set to true to
		avoid this behavior */
	noStretch: false
});
