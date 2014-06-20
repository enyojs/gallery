/**
	_enyo.FittableColumns_ provides a container in which items are laid out in a
	set of vertical columns, with most items having natural size, but one
	expanding to fill the remaining space. The one that expands is labeled with
	the attribute _fit: true_.

	For more information, see the documentation on
	[Fittables](https://github.com/enyojs/enyo/wiki/Fittables) in the Enyo
	Developer Guide.

*/

enyo.kind({
	name: "enyo.FittableColumns",
	layoutKind: "FittableColumnsLayout",
	/** By default, items in columns stretch to fit vertically; set to true to
		avoid this behavior */
	noStretch: false
});
