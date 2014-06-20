/**
	_enyo.List_ is a control that displays a scrolling list of rows, suitable
	for displaying very large lists. It is optimized such that only a small
	portion of the list is rendered at a given time. A flyweight pattern is
	employed, in which controls placed inside the list are created once, but
	rendered for each list item. For this reason, it's best to use only simple
	controls in	a List, such as <a href="#enyo.Control">enyo.Control</a> and
	<a href="#enyo.Image">enyo.Image</a>.

	A List's _components_ block contains the controls to be used for a single
	row. This set of controls will be rendered for each row. You may customize
	row rendering by handling the _onSetupItem_ event.

	Events fired from within list rows contain the _index_ property, which may
	be used to identify the row	from which the event originated.

	Beginning with Enyo 2.2, lists have built-in support for swipeable and
	reorderable list items.  Individual list items are swipeable by default; to
	enable reorderability, set the _reorderable_ property to true.

	For more information, see the documentation on
	[Lists](https://github.com/enyojs/enyo/wiki/Lists)
	in the Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.List",
	kind: "Scroller",
	classes: "enyo-list",
	published: {
		/**
			The number of rows contained in the list. Note that as the amount of
			list data changes, _setRows_ can be called to adjust the number of
			rows. To re-render the list at the current position when the count
			has changed, call the _refresh_ method.  If the whole data model of
			the list has changed and you want to redisplay from the top, call
			the _reset_ method instead.
		*/
		count: 0,
		/**
			The number of rows to be shown on a given list page segment.
			There is generally no need to adjust this value.
		*/
		rowsPerPage: 50,
		/**
			If true, renders the list such that row 0 is at the bottom of the
			viewport and the beginning position of the list is scrolled to the
			bottom
		*/
		bottomUp: false,
		/**
			If true, the selection mechanism is disabled. Tap events are still
			sent, but items won't be automatically re-rendered when tapped.
		*/
		noSelect: false,
		//* If true, multiple selections are allowed
		multiSelect: false,
		//* If true, the selected item will toggle
		toggleSelected: false,
		//* If true, the list will assume all rows have the same height for optimization
		fixedHeight: false,
		//* If true, the list will allow the user to reorder list items
		reorderable: false,
		//* If true and _reorderable_ is true, reorderable item will be centered on finger
		//* when created. When false, it will be created over old item and will then track finger.
		centerReorderContainer: true,
		//* Array containing components shown as the placeholder when reordering list items.
		reorderComponents: [],
		//* Array containing components for the pinned version of a row. If not provided, reordering
		//* will not support pinned mode.
		pinnedReorderComponents: [],
		//* Array containing any swipeable components that will be used
		swipeableComponents: [],
		//* If true, swipe functionality is enabled
		enableSwipe: false,
		//* If true, tells list to persist the current swipeable item
		persistSwipeableItem: false
	},
	events: {
		/**
			Fires once per row at render time.
			_inEvent.index_ contains the current row index.
		*/
		onSetupItem: "",
		//* Reorder events
		onSetupReorderComponents: "",
		onSetupPinnedReorderComponents: "",
		onReorder: "",
		//* Swipe events
		onSetupSwipeItem: "",
		onSwipeDrag: "",
		onSwipe: "",
		onSwipeComplete: ""
	},
	handlers: {
		onAnimateFinish: "animateFinish",
		onRenderRow: "rowRendered",
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish",
		onup: "up",
		onholdpulse: "holdpulse"
	},
	//* @protected
	rowHeight: 0,
	listTools: [
		{name: "port", classes: "enyo-list-port enyo-border-box", components: [
			{name: "generator", kind: "FlyweightRepeater", canGenerate: false, components: [
				{tag: null, name: "client"}
			]},
			{name: "holdingarea", allowHtml: true, classes: "enyo-list-holdingarea"},
			{name: "page0", allowHtml: true, classes: "enyo-list-page"},
			{name: "page1", allowHtml: true, classes: "enyo-list-page"},
			{name: "placeholder"},
			{name: "swipeableComponents", style: "position:absolute; display:block; top:-1000px; left:0;"}
		]}
	],

	//* Reorder vars
	// how long, in ms, to wait for to active reordering
	reorderHoldTimeMS: 600,
	// index of the row that we're moving
	draggingRowIndex: -1,
	// node of the dragged row, used to keep touch events alive
	draggingRowNode: null,
	// index of the row before which we'll show the placeholder item.  If the placeholder
	// is at the end of the list, this will be one larger than the row count.
	placeholderRowIndex: -1,
	// determines scroll height at top/bottom of list where dragging will cause scroll
	dragToScrollThreshold: 0.1,
	// used to determine direction of scrolling during reordering
	prevScrollTop: 0,
	// how many MS between scroll events when autoscrolling
	autoScrollTimeoutMS: 20,
	// holds timeout ID for autoscroll
	autoScrollTimeout: null,
	// keep last event Y coordinate to update placeholder position during autoscroll
	autoscrollPageY: 0,
	// set to true to indicate that we're in pinned reordering mode
	pinnedReorderMode: false,
	// y-coordinate of the original location of the pinned row
	initialPinPosition: -1,
	// set to true after drag-and-drop has moved the reordering item at least one space
	// used to activate pin mode if item is dropped immediately
	itemMoved: false,
	// this tracks the page where the being-dragged item is so we can detect
	// when we switch pages and need to adjust rendering
	currentPageNumber: -1,
	// timeout for completing reorder operation
	completeReorderTimeout: null,

	//* Swipeable vars
	// Index of swiped item
	swipeIndex: null,
	// Direction of swipe
	swipeDirection: null,
	// True if a persistent item is currently persisting
	persistentItemVisible: false,
	// Side from which the persisting item came
	persistentItemOrigin: null,
	// True if swipe was completed
	swipeComplete: false,
	// Timeout used to wait before completing swipe action
	completeSwipeTimeout: null,
	// Time in MS to wait before completing swipe action
	completeSwipeDelayMS: 500,
	// Time in MS for normal swipe animation
	normalSwipeSpeedMS: 200,
	// Time in seconds for fast swipe animation
	fastSwipeSpeedMS: 100,
	// Percentage of a swipe needed to force completion of the swipe
	percentageDraggedThreshold: 0.2,

	importProps: function(inProps) {
		// force touch on desktop when we have reorderable items to work around
		// problems with native scroller
		if (inProps && inProps.reorderable) {
			this.touch = true;
		}
		this.inherited(arguments);
	},
	create: function() {
		this.pageHeights = [];
		this.inherited(arguments);
		this.getStrategy().translateOptimized = true;
		this.bottomUpChanged();
		this.noSelectChanged();
		this.multiSelectChanged();
		this.toggleSelectedChanged();
		// setup generator to default to "full-list" values
		this.$.generator.setRowOffset(0);
		this.$.generator.setCount(this.count);
	},
	initComponents: function() {
		this.createReorderTools();
		this.inherited(arguments);
		this.createSwipeableComponents();
	},
	createReorderTools: function() {
		this.createComponent({
			name: "reorderContainer", classes: "enyo-list-reorder-container",
			ondown: "sendToStrategy", ondrag: "sendToStrategy",
			ondragstart: "sendToStrategy", ondragfinish: "sendToStrategy",
			onflick: "sendToStrategy"});
	},
	createStrategy: function() {
		this.controlParentName = "strategy";
		this.inherited(arguments);
		this.createChrome(this.listTools);
		this.controlParentName = "client";
		this.discoverControlParent();
	},
	createSwipeableComponents: function() {
		for(var i=0;i<this.swipeableComponents.length;i++) {
			this.$.swipeableComponents.createComponent(this.swipeableComponents[i], {owner: this.owner});
		}
	},
	rendered: function() {
		this.inherited(arguments);
		this.$.generator.node = this.$.port.hasNode();
		this.$.generator.generated = true;
		this.reset();
	},
	resizeHandler: function() {
		this.inherited(arguments);
		this.refresh();
	},
	bottomUpChanged: function() {
		this.$.generator.bottomUp = this.bottomUp;
		this.$.page0.applyStyle(this.pageBound, null);
		this.$.page1.applyStyle(this.pageBound, null);
		this.pageBound = this.bottomUp ? "bottom" : "top";
		if (this.hasNode()) {
			this.reset();
		}
	},
	noSelectChanged: function() {
		this.$.generator.setNoSelect(this.noSelect);
	},
	multiSelectChanged: function() {
		this.$.generator.setMultiSelect(this.multiSelect);
	},
	toggleSelectedChanged: function() {
		this.$.generator.setToggleSelected(this.toggleSelected);
	},
	countChanged: function() {
		if (this.hasNode()) {
			this.updateMetrics();
		}
	},
	sendToStrategy: function(s,e) {
		this.$.strategy.dispatchEvent("on" + e.type, e, s);
	},
	updateMetrics: function() {
		this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100);
		this.pageCount = Math.ceil(this.count / this.rowsPerPage);
		this.portSize = 0;
		for (var i=0; i < this.pageCount; i++) {
			this.portSize += this.getPageHeight(i);
		}
		this.adjustPortSize();
	},
	//* Hold pulse handler - use this to delay before running hold logic
	holdpulse: function(inSender,inEvent) {
		// don't activate if we're not supporting reordering or if we've already
		// activated the reorder logic
		if(!this.getReorderable() || this.isReordering()) {
			return;
		}
		// first pulse event that exceeds our minimum hold time activates
		if (inEvent.holdTime >= this.reorderHoldTimeMS) {
			// determine if we should handle the hold event
			if(this.shouldStartReordering(inSender, inEvent)) {
				inEvent.preventDefault();
				this.startReordering(inEvent);
				return false;
			}
		}
	},
	//* DragStart event handler
	dragstart: function(inSender, inEvent) {
		// stop dragstart from propogating if we're in reorder mode
		if (this.isReordering()) {
			return true;
		}
		if (this.isSwipeable()) {
			return this.swipeDragStart(inSender, inEvent);
		}
	},
	//* Drag event handler
	drag: function(inSender, inEvent) {
		// determine if we should handle the drag event
		if(this.shouldDoReorderDrag(inEvent)) {
			inEvent.preventDefault();
			this.reorderDrag(inEvent);
			return true;
		}
		else if (this.isSwipeable()) {
			inEvent.preventDefault();
			this.swipeDrag(inSender, inEvent);
			return true;
		}
	},
	//* Dragfinish event handler
	dragfinish: function(inSender, inEvent) {
		if(this.isReordering()) {
			this.finishReordering(inSender, inEvent);
		}
		else if (this.isSwipeable()) {
			this.swipeDragFinish(inSender, inEvent);
		}
	},
	//* up event handler
	up: function(inSender, inEvent) {
		if(this.isReordering()) {
			this.finishReordering(inSender, inEvent);
		}
	},
	generatePage: function(inPageNo, inTarget) {
		this.page = inPageNo;
		var r = this.rowsPerPage * this.page;
		this.$.generator.setRowOffset(r);
		var rpp = Math.min(this.count - r, this.rowsPerPage);
		this.$.generator.setCount(rpp);
		var html = this.$.generator.generateChildHtml();
		inTarget.setContent(html);
		// prevent reordering row from being draw twice
		if(this.getReorderable() && this.draggingRowIndex > -1) {
			this.hideReorderingRow();
		}
		var pageHeight = inTarget.getBounds().height;
		// if rowHeight is not set, use the height from the first generated page
		if (!this.rowHeight && pageHeight > 0) {
			this.rowHeight = Math.floor(pageHeight / rpp);
			this.updateMetrics();
		}
		// update known page heights
		if (!this.fixedHeight) {
			var h0 = this.getPageHeight(inPageNo);
			this.pageHeights[inPageNo] = pageHeight;
			this.portSize += pageHeight - h0;
		}
	},
	//* map a row index number to the page number it would be in
	pageForRow: function(inIndex) {
		return Math.floor(inIndex / this.rowsPerPage);
	},
	// preserve original DOM node because it may be needed to route touch events
	preserveDraggingRowNode: function(pageNo) {
		if (this.draggingRowNode && this.pageForRow(this.draggingRowIndex) === pageNo) {
			this.$.holdingarea.hasNode().appendChild(this.draggingRowNode);
			this.draggingRowNode = null;
			this.removedInitialPage = true;
		}
	},
	update: function(inScrollTop) {
		var updated = false;
		// get page info for position
		var pi = this.positionToPageInfo(inScrollTop);
		// zone line position
		var pos = pi.pos + this.scrollerHeight/2;
		// leap-frog zone position
		var k = Math.floor(pos/Math.max(pi.height, this.scrollerHeight) + 1/2) + pi.no;
		// which page number for page0 (even number pages)?
		var p = (k % 2 === 0) ? k : k-1;
		if (this.p0 != p && this.isPageInRange(p)) {
			this.preserveDraggingRowNode(this.p0);
			this.generatePage(p, this.$.page0);
			this.positionPage(p, this.$.page0);
			this.p0 = p;
			updated = true;
			this.p0RowBounds = this.getPageRowHeights(this.$.page0);
		}
		// which page number for page1 (odd number pages)?
		p = (k % 2 === 0) ? Math.max(1, k-1) : k;
		// position data page 1
		if (this.p1 != p && this.isPageInRange(p)) {
			this.preserveDraggingRowNode(this.p1);
			this.generatePage(p, this.$.page1);
			this.positionPage(p, this.$.page1);
			this.p1 = p;
			updated = true;
			this.p1RowBounds = this.getPageRowHeights(this.$.page1);
		}
		if (updated) {
			// reset generator back to "full-list" values
			this.$.generator.setRowOffset(0);
			this.$.generator.setCount(this.count);
			if (!this.fixedHeight) {
				this.adjustBottomPage();
				this.adjustPortSize();
			}
		}
	},
	getPageRowHeights: function(page) {
		var rows = {};
		var allDivs = page.hasNode().querySelectorAll("div[data-enyo-index]");
		for (var i=0, index, bounds; i < allDivs.length; i++) {
			index = allDivs[i].getAttribute("data-enyo-index");
			if (index !== null) {
				bounds = enyo.dom.getBounds(allDivs[i]);
				rows[parseInt(index, 10)] = {height: bounds.height, width: bounds.width};
			}
		}
		return rows;
	},
	updateRowBounds: function(index) {
		if (this.p0RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p0RowBounds, this.$.page0);
		}
		else if (this.p1RowBounds[index]) {
			this.updateRowBoundsAtIndex(index, this.p1RowBounds, this.$.page1);
		}
	},
	updateRowBoundsAtIndex: function(index, rows, page) {
		var rowDiv = page.hasNode().querySelector('div[data-enyo-index="' + index + '"]');
		var bounds = enyo.dom.getBounds(rowDiv);
		rows[index].height = bounds.height;
		rows[index].width = bounds.width;
	},
	updateForPosition: function(inPos) {
		this.update(this.calcPos(inPos));
	},
	calcPos: function(inPos) {
		return (this.bottomUp ? (this.portSize - this.scrollerHeight - inPos) : inPos);
	},
	adjustBottomPage: function() {
		var bp = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
		this.positionPage(bp.pageNo, bp);
	},
	adjustPortSize: function() {
		this.scrollerHeight = this.getBounds().height;
		var s = Math.max(this.scrollerHeight, this.portSize);
		this.$.port.applyStyle("height", s + "px");
	},
	positionPage: function(inPage, inTarget) {
		inTarget.pageNo = inPage;
		var y = this.pageToPosition(inPage);
		inTarget.applyStyle(this.pageBound, y + "px");
	},
	pageToPosition: function(inPage) {
		var y = 0;
		var p = inPage;
		while (p > 0) {
			p--;
			y += this.getPageHeight(p);
		}
		return y;
	},
	positionToPageInfo: function(inY) {
		var page = -1;
		var p = this.calcPos(inY);
		var h = this.defaultPageHeight;
		while (p >= 0) {
			page++;
			h = this.getPageHeight(page);
			p -= h;
		}
		page = Math.max(page, 0);
		return {
			no: page,
			height: h,
			pos: p + h,
			startRow: (page * this.rowsPerPage),
			endRow: Math.min((page + 1) * this.rowsPerPage - 1, this.count - 1)
		};
	},
	isPageInRange: function(inPage) {
		return inPage == Math.max(0, Math.min(this.pageCount-1, inPage));
	},
	getPageHeight: function(inPageNo) {
		var height = this.pageHeights[inPageNo];
		// estimate the height based on how many rows are in this page
		if (!height) {
			var firstRow = this.rowsPerPage * inPageNo;
			var numRows = Math.min(this.count - firstRow, this.rowsPerPage);
			height = this.defaultPageHeight * (numRows / this.rowsPerPage);
		}
		// can never return height of 0, as that would lead to infinite loops
		return Math.max(1, height);
	},
	invalidatePages: function() {
		this.p0 = this.p1 = null;
		this.p0RowBounds = {};
		this.p1RowBounds = {};
		// clear the html in our render targets
		this.$.page0.setContent("");
		this.$.page1.setContent("");
	},
	invalidateMetrics: function() {
		this.pageHeights = [];
		this.rowHeight = 0;
		this.updateMetrics();
	},
	scroll: function(inSender, inEvent) {
		var r = this.inherited(arguments);
		var pos = this.getScrollTop();
		if (this.lastPos === pos) {
			return r;
		}
		this.lastPos = pos;
		this.update(pos);
		if (this.pinnedReorderMode) {
			this.reorderScroll(inSender, inEvent);
		}
		return r;
	},
	setScrollTop: function(inScrollTop) {
		this.update(inScrollTop);
		this.inherited(arguments);
		this.twiddle();
	},
	getScrollPosition: function() {
		return this.calcPos(this.getScrollTop());
	},
	setScrollPosition: function(inPos) {
		this.setScrollTop(this.calcPos(inPos));
	},
	//* @public
	//* Scrolls the list so the last item is visible.
	scrollToBottom: function() {
		this.update(this.getScrollBounds().maxTop);
		this.inherited(arguments);
	},
	//* Scrolls to the specified row.
	scrollToRow: function(inRow) {
		var page = this.pageForRow(inRow);
		var pageRow = inRow % this.rowsPerPage;
		var h = this.pageToPosition(page);
		// update the page
		this.updateForPosition(h);
		// call pageToPosition again and this time should return the right pos since the page info is populated
		h = this.pageToPosition(page);
		this.setScrollPosition(h);
		if (page == this.p0 || page == this.p1) {
			var rowNode = this.$.generator.fetchRowNode(inRow);
			if (rowNode) {
				// calc row offset
				var offset = rowNode.offsetTop;
				if (this.bottomUp) {
					offset = this.getPageHeight(page) - rowNode.offsetHeight - offset;
				}
				var y = this.getScrollPosition() + offset;
				this.setScrollPosition(y);
			}
		}
	},
	//* Scrolls to the beginning of the list.
	scrollToStart: function() {
		this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
	},
	//* Scrolls to the end of the list.
	scrollToEnd: function() {
		this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
	},
	//* Re-renders the list at the current position.
	refresh: function() {
		this.invalidatePages();
		this.update(this.getScrollTop());
		this.stabilize();

		//FIXME: Necessary evil for Android 4.0.4 refresh bug
		if (enyo.platform.android === 4) {
			this.twiddle();
		}
	},
	/**
		Re-renders the list from the beginning.  This is used when changing the
		data model for the list.  This also clears the selection state.
	*/
	reset: function() {
		this.getSelection().clear();
		this.invalidateMetrics();
		this.invalidatePages();
		this.stabilize();
		this.scrollToStart();
	},
	/**
		Returns the [enyo.Selection](#enyo.Selection) component that
		manages the selection state for	this list.
	*/
	getSelection: function() {
		return this.$.generator.getSelection();
	},
	/**
		Sets the selection state for the given row index.
		_inData_ is an optional data value stored in the selection object.

		Modifying selection will not automatically rerender the row,
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	select: function(inIndex, inData) {
		return this.getSelection().select(inIndex, inData);
	},
	/**
		Clears the selection state for the given row index.

		Modifying selection will not automatically re-render the row,
		so use [renderRow](#enyo.List::renderRow) or [refresh](#enyo.List::refresh)
		to update the view.
	*/
	deselect: function(inIndex) {
		return this.getSelection().deselect(inIndex);
	},
	//* Gets the selection state for the given row index.
	isSelected: function(inIndex) {
		return this.$.generator.isSelected(inIndex);
	},
	/**
		Re-renders the specified row. Call this method after making
		modifications to a row, to force it to render.
    */
    renderRow: function(inIndex) {
		this.$.generator.renderRow(inIndex);
    },
	//* Updates row bounds when rows are re-rendered.
	rowRendered: function(inSender, inEvent) {
		this.updateRowBounds(inEvent.rowIndex);
	},
	//* Prepares the row to become interactive.
	prepareRow: function(inIndex) {
		this.$.generator.prepareRow(inIndex);
	},
	//* Restores the row to being non-interactive.
	lockRow: function() {
		this.$.generator.lockRow();
	},
	/**
		Performs a set of tasks by running the function _inFunc_ on a row (which
		must be interactive at the time the tasks are performed). Locks the	row
		when done.
	*/
	performOnRow: function(inIndex, inFunc, inContext) {
		this.$.generator.performOnRow(inIndex, inFunc, inContext);
	},
	//* @protected
	animateFinish: function(inSender) {
		this.twiddle();
		return true;
	},
	// FIXME: Android 4.04 has issues with nested composited elements; for example, a SwipeableItem,
	// can incorrectly generate taps on its content when it has slid off the screen;
	// we address this BUG here by forcing the Scroller to "twiddle" which corrects the bug by
	// provoking a dom update.
	twiddle: function() {
		var s = this.getStrategy();
		enyo.call(s, "twiddle");
	},
	// return page0 or page1 control depending on pageNumber odd/even status
	pageForPageNumber: function(pageNumber, checkRange) {
		if (pageNumber % 2 === 0) {
			return (!checkRange || (pageNumber === this.p0)) ? this.$.page0 : null;
		}
		else {
			return (!checkRange || (pageNumber === this.p1)) ? this.$.page1 : null;
		}
		return null;
	},
	/**
		---- Reorder functionality ------------
	*/
	//* Determines whether we should handle the hold event as a reorder hold.
	shouldStartReordering: function(inSender, inEvent) {
		if(!this.getReorderable() || !(inEvent.rowIndex >= 0) || this.pinnedReorderMode ||
			inSender !== this.$.strategy || !(inEvent.index >= 0)) {
			return false;
		}
		return true;
	},
	//* Processes hold event and prepares for reordering.
	startReordering: function(inEvent) {
		// disable drag to scroll on strategy
		this.$.strategy.listReordering = true;

		this.buildReorderContainer();
		this.doSetupReorderComponents(inEvent);
		this.styleReorderContainer(inEvent);

		this.draggingRowIndex = this.placeholderRowIndex = inEvent.rowIndex;
		this.draggingRowNode = inEvent.target;
		this.removedInitialPage = false;
		this.itemMoved = false;
		this.initialPageNumber = this.currentPageNumber = this.pageForRow(inEvent.rowIndex);
		this.prevScrollTop = this.getScrollTop();

		// fill row being reordered with placeholder
		this.replaceNodeWithPlaceholder(inEvent.rowIndex);
	},
	/**
		Fills reorder container with draggable reorder components defined by the
		application.
	*/
	buildReorderContainer: function() {
		this.$.reorderContainer.destroyClientControls();
		for(var i=0;i<this.reorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.reorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},
	//* Prepares floating reorder container.
	styleReorderContainer: function(e) {
		this.setItemPosition(this.$.reorderContainer, e.rowIndex);
		this.setItemBounds(this.$.reorderContainer, e.rowIndex);
		this.$.reorderContainer.setShowing(true);
		if (this.centerReorderContainer) {
			this.centerReorderContainerOnPointer(e);
		}
	},
	//* Copies the innerHTML of _node_ into a new component inside of
	//* _reorderContainer_.
	appendNodeToReorderContainer: function(node) {
		this.$.reorderContainer.createComponent({allowHtml: true, content: node.innerHTML}).render();
	},
	//* Centers the floating reorder container on the user's pointer.
	centerReorderContainerOnPointer: function(e) {
		var containerPosition = enyo.dom.calcNodePosition(this.hasNode());
		var x = e.pageX - containerPosition.left - parseInt(this.$.reorderContainer.domStyles.width, 10)/2;
		var y = e.pageY - containerPosition.top + this.getScrollTop() - parseInt(this.$.reorderContainer.domStyles.height, 10)/2;
		if(this.getStrategyKind() != "ScrollStrategy") {
			x -= this.getScrollLeft();
			y -= this.getScrollTop();
		}
		this.positionReorderContainer(x,y);
	},
	/**
		Moves the reorder container to the specified _x_ and _y_ coordinates.
		Animates and kicks off timer to turn off animation.
	*/
	positionReorderContainer: function(x,y) {
		this.$.reorderContainer.addClass("enyo-animatedTopAndLeft");
		this.$.reorderContainer.addStyles("left:"+x+"px;top:"+y+"px;");
		this.setPositionReorderContainerTimeout();
	},
	setPositionReorderContainerTimeout: function() {
		this.clearPositionReorderContainerTimeout();
		this.positionReorderContainerTimeout = setTimeout(enyo.bind(this,
			function() {
				this.$.reorderContainer.removeClass("enyo-animatedTopAndLeft");
				this.clearPositionReorderContainerTimeout();
			}), 100);
	},
	clearPositionReorderContainerTimeout: function() {
		if(this.positionReorderContainerTimeout) {
			clearTimeout(this.positionReorderContainerTimeout);
			this.positionReorderContainerTimeout = null;
		}
	},
	//* Determines whether we should handle the drag event.
	shouldDoReorderDrag: function() {
		if(!this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode) {
			return false;
		}
		return true;
	},
	//* Handles the drag event as a reorder drag.
	reorderDrag: function(inEvent) {
		// position reorder node under mouse/pointer
		this.positionReorderNode(inEvent);

		// determine if we need to auto-scroll the list
		this.checkForAutoScroll(inEvent);

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(inEvent.pageY);
	},
	updatePlaceholderPosition: function(pageY) {
		var index = this.getRowIndexFromCoordinate(pageY);
		if (index !== -1) {
			// cursor moved over a new row, so determine direction of movement
			if (index >= this.placeholderRowIndex) {
				this.movePlaceholderToIndex(Math.min(this.count, index + 1));
			}
			else {
				this.movePlaceholderToIndex(index);
			}
		}
	},
	//* Positions the reorder node based on the dx and dy of the drag event.
	positionReorderNode: function(e) {
		var reorderNodeBounds = this.$.reorderContainer.getBounds();
		var left = reorderNodeBounds.left + e.ddx;
		var top = reorderNodeBounds.top + e.ddy;
		top = (this.getStrategyKind() == "ScrollStrategy") ? top + (this.getScrollTop() - this.prevScrollTop) : top;
		this.$.reorderContainer.addStyles("top: "+top+"px ; left: "+left+"px");
		this.prevScrollTop = this.getScrollTop();
	},
	/**
		Checks if the list should scroll when dragging and, if so, starts the
		scroll timeout timer. Auto-scrolling happens when the user drags an item
		within the top/bottom boundary percentage defined in
		_this.dragToScrollThreshold_.
	*/
	checkForAutoScroll: function(inEvent) {
		var position = enyo.dom.calcNodePosition(this.hasNode());
		var bounds = this.getBounds();
		var perc;
		this.autoscrollPageY = inEvent.pageY;
		if(inEvent.pageY - position.top < bounds.height * this.dragToScrollThreshold) {
			perc = 100*(1 - ((inEvent.pageY - position.top) / (bounds.height * this.dragToScrollThreshold)));
			this.scrollDistance = -1*perc;
		} else if(inEvent.pageY - position.top > bounds.height * (1 - this.dragToScrollThreshold)) {
			perc = 100*((inEvent.pageY - position.top - bounds.height*(1 - this.dragToScrollThreshold)) / (bounds.height - (bounds.height * (1 - this.dragToScrollThreshold))));
			this.scrollDistance = 1*perc;
		} else {
			this.scrollDistance = 0;
		}
		// stop scrolling if distance is zero (i.e., user isn't scrolling to the edges of
		// the list); otherwise, start it if not already started
		if (this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if(!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
	},
	//* Stops auto-scrolling.
	stopAutoScrolling: function() {
		if(this.autoScrollTimeout) {
			clearTimeout(this.autoScrollTimeout);
			this.autoScrollTimeout = null;
		}
	},
	//* Starts auto-scrolling.
	startAutoScrolling: function() {
		this.autoScrollTimeout = setInterval(enyo.bind(this, this.autoScroll), this.autoScrollTimeoutMS);
	},
	//* Scrolls the list by the distance specified in _this.scrollDistance_.
	autoScroll: function() {
		if(this.scrollDistance === 0) {
			this.stopAutoScrolling();
		} else {
			if(!this.autoScrollTimeout) {
				this.startAutoScrolling();
			}
		}
		this.setScrollPosition(this.getScrollPosition() + this.scrollDistance);
		this.positionReorderNode({ddx: 0, ddy: 0});

		// if the current index the user is dragging over has changed, move the placeholder
		this.updatePlaceholderPosition(this.autoscrollPageY);
	},
	/**
		Moves the placeholder (i.e., the gap between rows) to the row currently
		under the user's pointer. This provides a visual cue, showing the user
		where the item being dragged will go if it is dropped.
	*/
	movePlaceholderToIndex: function(index) {
		var node, nodeParent;
		if (index < 0) {
			return;
		}
		else if (index >= this.count) {
			node = null;
			nodeParent = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode();
		}
		else {
			node = this.$.generator.fetchRowNode(index);
			nodeParent = node.parentNode;
		}
		// figure next page for placeholder
		var nextPageNumber = this.pageForRow(index);

		// don't add pages beyond the original page count
		if(nextPageNumber >= this.pageCount) {
			nextPageNumber = this.currentPageNumber;
		}

		// move the placeholder to just after our "index" node
		nodeParent.insertBefore(
			this.placeholderNode,
			node);

		if(this.currentPageNumber !== nextPageNumber) {
			// if moving to different page, recalculate page heights and reposition pages
			this.updatePageHeight(this.currentPageNumber);
			this.updatePageHeight(nextPageNumber);
			this.updatePagePositions(nextPageNumber);
		}

		// save updated state
		this.placeholderRowIndex = index;
		this.currentPageNumber = nextPageNumber;

		// remember that we moved an item (to prevent pinning at the wrong time)
		this.itemMoved = true;
	},
	/**
		Turns off reordering. If the user didn't drag the item being reordered
		outside of its original position, goes into pinned reorder mode.
	*/
	finishReordering: function(inSender, inEvent) {
		if(!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout) {
			return;
		}
		this.stopAutoScrolling();
		// enable drag-scrolling on strategy
		this.$.strategy.listReordering = false;
		// animate reorder container to proper position and then complete
		// reordering actions
		this.moveReorderedContainerToDroppedPosition(inEvent);
		this.completeReorderTimeout = setTimeout(
			enyo.bind(this, this.completeFinishReordering, inEvent), 100);

		inEvent.preventDefault();
		return true;
	},
	//*
	moveReorderedContainerToDroppedPosition: function() {
		var offset = this.getRelativeOffset(this.placeholderNode, this.hasNode());
		var top = (this.getStrategyKind() == "ScrollStrategy") ? offset.top : offset.top - this.getScrollTop();
		var left = offset.left - this.getScrollLeft();
		this.positionReorderContainer(left,top);
	},
	/**
		After the reordered item has been animated to its position, completes
		the reordering logic.
	*/
	completeFinishReordering: function(inEvent) {
		this.completeReorderTimeout = null;
		// adjust placeholderRowIndex to now be the final resting place
		if (this.placeholderRowIndex > this.draggingRowIndex) {
			this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1);
		}
		// if the user dropped the item in the same location where it was picked up, and they
		// didn't move any other items in the process, pin the item and go into pinned reorder mode
		if(this.draggingRowIndex == this.placeholderRowIndex &&
			this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
			this.beginPinnedReorder(inEvent);
			return;
		}
		this.removeDraggingRowNode();
		this.removePlaceholderNode();
		this.emptyAndHideReorderContainer();
		// clear this early to prevent scroller code from using disappeared placeholder
		this.pinnedReorderMode = false;
		this.reorderRows(inEvent);
		this.draggingRowIndex = this.placeholderRowIndex = -1;
		this.refresh();
	},
	//* Go into pinned reorder mode
	beginPinnedReorder: function(e) {
		this.buildPinnedReorderContainer();
		this.doSetupPinnedReorderComponents(enyo.mixin(e, {index: this.draggingRowIndex}));
		this.pinnedReorderMode = true;
		this.initialPinPosition = e.pageY;
	},
	//* Clears contents of reorder container, then hides.
	emptyAndHideReorderContainer: function() {
		this.$.reorderContainer.destroyComponents();
		this.$.reorderContainer.setShowing(false);
	},
	//* Fills reorder container with pinned controls.
	buildPinnedReorderContainer: function() {
		this.$.reorderContainer.destroyClientControls();
		for(var i=0;i<this.pinnedReorderComponents.length;i++) {
			this.$.reorderContainer.createComponent(this.pinnedReorderComponents[i], {owner:this.owner});
		}
		this.$.reorderContainer.render();
	},
	//* Swaps the rows that were reordered, and sends up reorder event.
	reorderRows: function(inEvent) {
		// send reorder event
		this.doReorder(this.makeReorderEvent(inEvent));
		// update display
		this.positionReorderedNode();
		// fix indices for reordered rows
		this.updateListIndices();
	},
	//* Adds _reorderTo_ and _reorderFrom_ properties to the reorder event.
	makeReorderEvent: function(e) {
		e.reorderFrom = this.draggingRowIndex;
		e.reorderTo = this.placeholderRowIndex;
		return e;
	},
	//* Moves the node being reordered to its new position and shows it.
	positionReorderedNode: function() {
		// only do this if the page with the initial item is still rendered
		if (!this.removedInitialPage) {
			var insertNode = this.$.generator.fetchRowNode(this.placeholderRowIndex);
			if (insertNode) {
				insertNode.parentNode.insertBefore(this.hiddenNode, insertNode);
				this.showNode(this.hiddenNode);
			}
			this.hiddenNode = null;
			if (this.currentPageNumber != this.initialPageNumber) {
				var mover, movee;
				var currentPage = this.pageForPageNumber(this.currentPageNumber);
				var otherPage = this.pageForPageNumber(this.currentPageNumber + 1);
				// if moved down, move current page's firstChild to the end of previous page
				if (this.initialPageNumber < this.currentPageNumber) {
					mover = currentPage.hasNode().firstChild;
					otherPage.hasNode().appendChild(mover);
				// if moved up, move current page's lastChild before previous page's firstChild
				} else {
					mover = currentPage.hasNode().lastChild;
					movee = otherPage.hasNode().firstChild;
					otherPage.hasNode().insertBefore(mover, movee);
				}
				this.correctPageHeights();
				this.updatePagePositions(this.initialPageNumber);
			}
		}
	},
	//* Updates indices of list items as needed to preserve reordering.
	updateListIndices: function() {
		// don't do update if we've moved further than one page, refresh instead
		if(this.shouldDoRefresh()) {
			this.refresh();
			this.correctPageHeights();
			return;
		}

		var from = Math.min(this.draggingRowIndex, this.placeholderRowIndex);
		var to = Math.max(this.draggingRowIndex, this.placeholderRowIndex);
		var direction = (this.draggingRowIndex - this.placeholderRowIndex > 0) ? 1 : -1;
		var node, i, newIndex, currentIndex;

		if(direction === 1) {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute("data-enyo-index", "reordered");
			}
			for(i=(to-1),newIndex=to;i>=from;i--) {
				node = this.$.generator.fetchRowNode(i);
				if(!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute("data-enyo-index"), 10);
				newIndex = currentIndex + 1;
				node.setAttribute("data-enyo-index", newIndex);
			}
			node = this.hasNode().querySelector('[data-enyo-index="reordered"]');
			node.setAttribute("data-enyo-index", this.placeholderRowIndex);

		} else {
			node = this.$.generator.fetchRowNode(this.draggingRowIndex);
			if (node) {
				node.setAttribute("data-enyo-index", this.placeholderRowIndex);
			}
			for(i=(from+1), newIndex=from;i<=to;i++) {
				node = this.$.generator.fetchRowNode(i);
				if(!node) {
					continue;
				}
				currentIndex = parseInt(node.getAttribute("data-enyo-index"), 10);
				newIndex = currentIndex - 1;
				node.setAttribute("data-enyo-index", newIndex);
			}
		}
	},
	//* Determines if an item was reordered far enough that it warrants a refresh.
	shouldDoRefresh: function() {
		return (Math.abs(this.initialPageNumber - this.currentPageNumber) > 1);
	},
	//* Gets node height, width, top, and left values.
	getNodeStyle: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = enyo.dom.getBounds(node);
		return {h: dimensions.height, w: dimensions.width, left: offset.left, top: offset.top};
	},
	//* Gets offset relative to a positioned ancestor node.
	getRelativeOffset: function (n, p) {
		var ro = {top: 0, left: 0};
		if (n !== p && n.parentNode) {
			do {
				ro.top += n.offsetTop || 0;
				ro.left += n.offsetLeft || 0;
				n = n.offsetParent;
			} while (n && n !== p);
		}
		return ro;
	},
	replaceNodeWithPlaceholder: function(index) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			enyo.log("No node - "+index);
			return;
		}
		// create and style placeholder node
		this.placeholderNode = this.createPlaceholderNode(node);
		// hide existing node
		this.hiddenNode = this.hideNode(node);
		// insert placeholder node where original node was
		var currentPage = this.pageForPageNumber(this.currentPageNumber);
		currentPage.hasNode().insertBefore(this.placeholderNode,this.hiddenNode);
	},
	/**
		Creates and returns a placeholder node with dimensions matching those of
		the passed-in node.
	*/
	createPlaceholderNode: function(node) {
		var placeholderNode = this.$.placeholder.hasNode().cloneNode(true);
		var nodeDimensions = enyo.dom.getBounds(node);
		placeholderNode.style.height = nodeDimensions.height + "px";
		placeholderNode.style.width = nodeDimensions.width + "px";
		return placeholderNode;
	},
	//* Removes the placeholder node from the DOM.
	removePlaceholderNode: function() {
		this.removeNode(this.placeholderNode);
		this.placeholderNode = null;
	},
	removeDraggingRowNode: function() {
		this.draggingRowNode = null;
		var holdingArea = this.$.holdingarea.hasNode();
		holdingArea.innerHTML = "";
	},
	//* Removes the passed-in node from the DOM.
	removeNode: function(node) {
		if(!node || !node.parentNode) {
			return;
		}
		node.parentNode.removeChild(node);
	},
	/**
		Updates _this.pageHeights_ to support the placeholder node's jumping
		from one page to the next.
	*/
	updatePageHeight: function(pageNumber) {
		if (pageNumber < 0) {
			return;
		}
		var pageControl = this.pageForPageNumber(pageNumber, true);
		if (pageControl) {
			var h0 = this.pageHeights[pageNumber];
			var pageHeight = Math.max(1, pageControl.getBounds().height);
			this.pageHeights[pageNumber] = pageHeight;
			this.portSize += pageHeight - h0;
		}
	},
	/**
		Repositions the two passed-in pages to support the placeholder node's
		jumping from one page to the next.
	*/
	updatePagePositions: function(nextPageNumber) {
		this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber));
		this.positionPage(nextPageNumber, this.pageForPageNumber(nextPageNumber));
	},
	//* Corrects page heights array after reorder is complete.
	correctPageHeights: function() {
		this.updatePageHeight(this.currentPageNumber);
		if (this.initialPageNumber != this.currentPageNumber) {
			this.updatePageHeight(this.initialPageNumber);
		}
	},
	hideNode: function(node) {
		node.style.display = "none";
		return node;
	},
	showNode: function(node) {
		node.style.display = "block";
		return node;
	},
	//* @public
	//* Called by client code to finalize a pinned mode reordering, such as when the "Drop" button is pressed
	//* on the pinned placeholder row.
	dropPinnedRow: function(inEvent) {
		// animate reorder container to proper position and then complete reording actions
		this.moveReorderedContainerToDroppedPosition(inEvent);
		this.completeReorderTimeout = setTimeout(
			enyo.bind(this, this.completeFinishReordering, inEvent), 100);
		return;
	},
	cancelPinnedMode: function(inEvent) {
		// make it look like we're dropping in original location
		this.placeholderRowIndex = this.draggingRowIndex;
		this.dropPinnedRow(inEvent);
	},
	//* @protected
	//* Returns the row index that is under the given position on the page.  If the
	//* position is off the end of the list, this will return this.count.  If the position
	//* is before the start of the list, you'll get -1.
	getRowIndexFromCoordinate: function(y) {
		var cursorPosition = this.getScrollTop() + y - enyo.dom.calcNodePosition(this.hasNode()).top;
		// happens if we try to drag past top of list
		if (cursorPosition < 0) {
			return -1;
		}
		var pageInfo = this.positionToPageInfo(cursorPosition);
		var rows = (pageInfo.no == this.p0) ? this.p0RowBounds : this.p1RowBounds;
		// might have only rendered one page, so catch that here
		if (!rows) {
			return this.count;
		}
		var posOnPage = pageInfo.pos;
		var placeholderHeight = this.placeholderNode ? enyo.dom.getBounds(this.placeholderNode).height : 0;
		var totalHeight = 0;
		for(var i=pageInfo.startRow; i <= pageInfo.endRow; ++i) {
			// do extra check for row that has placeholder as we'll return -1 here for no match
			if (i === this.placeholderRowIndex) {
				// for placeholder
				totalHeight += placeholderHeight;
				if(totalHeight >= posOnPage) {
					return -1;
				}
			}
			// originally dragged row is hidden, so don't count it
			if (i !== this.draggingRowIndex) {
				totalHeight += rows[i].height;
				if(totalHeight >= posOnPage) {
					return i;
				}
			}
		}
		return i;
	},
	//* Gets the position of a node (identified via index) on the page.
	getIndexPosition: function(index) {
		return enyo.dom.calcNodePosition(this.$.generator.fetchRowNode(index));
	},
	//* Sets _$item_'s position to match that of the list row at _index_.
	setItemPosition: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var top = (this.getStrategyKind() == "ScrollStrategy") ? clonedNodeStyle.top : clonedNodeStyle.top - this.getScrollTop();
		var styleStr = "top:"+top+"px; left:"+clonedNodeStyle.left+"px;";
		$item.addStyles(styleStr);
	},
	//* Sets _$item_'s width and height to match those of the list row at _index_.
	setItemBounds: function($item,index) {
		var clonedNodeStyle = this.getNodeStyle(index);
		var styleStr = "width:"+clonedNodeStyle.w+"px; height:"+clonedNodeStyle.h+"px;";
		$item.addStyles(styleStr);
	},
	/**
		When in pinned reorder mode, repositions the pinned placeholder when the
		user has scrolled far enough.
	*/
	reorderScroll: function(inSender, e) {
		// if we are using the standard scroll strategy, we have to move the pinned row with the scrolling
		if(this.getStrategyKind() == "ScrollStrategy") {
			this.$.reorderContainer.addStyles("top:"+(this.initialPinPosition+this.getScrollTop()-this.rowHeight)+"px;");
		}
		// y coordinate on screen of the pinned item doesn't change as we scroll things
		this.updatePlaceholderPosition(this.initialPinPosition);
	},
	hideReorderingRow: function() {
		var hiddenNode = this.hasNode().querySelector('[data-enyo-index="'+this.draggingRowIndex+'"]');
		// hide existing node
		if(hiddenNode) {
			this.hiddenNode = this.hideNode(hiddenNode);
		}
	},
	isReordering: function() {
		return (this.draggingRowIndex > -1);
	},

	/**
		---- Swipeable functionality ------------
	*/

	isSwiping: function() {
		// we're swiping when the index is set and we're not in the middle of completing or backing out a swipe
		return (this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null);
	},
	/**
		When a drag starts, gets the direction of the drag as well as the index
		of the item being dragged, and resets any pertinent values. Then kicks
		off the swipe sequence.
	*/
	swipeDragStart: function(inSender, inEvent) {
		// if we're not on a row or the swipe is vertical or if we're in the middle of reordering, just say no
		if(inEvent.index == null || inEvent.vertical) {
			return true;
		}

		// if we are waiting to complete a swipe, complete it
		if(this.completeSwipeTimeout) {
			this.completeSwipe(inEvent);
		}

		// reset swipe complete flag
		this.swipeComplete = false;

		if (this.swipeIndex != inEvent.index) {
			this.clearSwipeables();
			this.swipeIndex = inEvent.index;
		}
		this.swipeDirection = inEvent.xDirection;

		// start swipe sequence only if we are not currently showing a persistent item
		if(!this.persistentItemVisible) {
			this.startSwipe(inEvent);
		}

		// reset dragged distance (for dragfinish)
		this.draggedXDistance = 0;
		this.draggedYDistance = 0;

		return true;
	},
	/**
		When a drag is in progress, updates the position of the swipeable
		container based on the ddx of the event.
	*/
	swipeDrag: function(inSender, inEvent) {
		// if a persistent swipeableItem is still showing, handle it separately
		if (this.persistentItemVisible) {
			this.dragPersistentItem(inEvent);
			return this.preventDragPropagation;
		}
		// early exit if there's no matching dragStart to set item
		if (!this.isSwiping()) {
			return false;
		}
		// apply new position
		this.dragSwipeableComponents(this.calcNewDragPosition(inEvent.ddx));
		// save dragged distance (for dragfinish)
		this.draggedXDistance = inEvent.dx;
		this.draggedYDistance = inEvent.dy;
		return true;
	},
	/*
		When the current drag completes, decides whether to complete the swipe
		based on how far the user pulled the swipeable container.
	*/
	swipeDragFinish: function(inSender, inEvent) {
		// if a persistent swipeableItem is still showing, complete drag away or bounce
		if (this.persistentItemVisible) {
			this.dragFinishPersistentItem(inEvent);
		// early exit if there's no matching dragStart to set item
		} else if (!this.isSwiping()) {
			return false;
		// otherwise if user dragged more than 20% of the width, complete the swipe. if not, back out.
		} else {
			var percentageDragged = this.calcPercentageDragged(this.draggedXDistance);
			if ((percentageDragged > this.percentageDraggedThreshold) && (inEvent.xDirection === this.swipeDirection)) {
				this.swipe(this.fastSwipeSpeedMS);
			} else {
				this.backOutSwipe(inEvent);
			}
		}

		return this.preventDragPropagation;
	},
	// reorder takes precedence over swipes, and not having it turned on or swipeable controls defined also disables this
	isSwipeable: function() {
		return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 &&
			!this.isReordering() && !this.pinnedReorderMode;
	},
	// Positions the swipeable components block at the current row.
	positionSwipeableContainer: function(index,xDirection) {
		var node = this.$.generator.fetchRowNode(index);
		if(!node) {
			return;
		}
		var offset = this.getRelativeOffset(node, this.hasNode());
		var dimensions = enyo.dom.getBounds(node);
		var x = (xDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.$.swipeableComponents.addStyles("top: "+offset.top+"px; left: "+x+"px; height: "+dimensions.height+"px; width: "+dimensions.width+"px;");
	},
	/**
		Calculates new position for the swipeable container based on the user's
		drag action. Don't allow the container to drag beyond either edge.
	*/
	calcNewDragPosition: function(dx) {
		var parentBounds = this.$.swipeableComponents.getBounds();
		var xPos = parentBounds.left;
		var dimensions = this.$.swipeableComponents.getBounds();
		var xlimit = (this.swipeDirection == 1) ? 0 : -1*dimensions.width;
		var x = (this.swipeDirection == 1)
			? (xPos + dx > xlimit)
				? xlimit
				: xPos + dx
			: (xPos + dx < xlimit)
				? xlimit
				: xPos + dx;
		return x;
	},
	dragSwipeableComponents: function(x) {
		this.$.swipeableComponents.applyStyle("left",x+"px");
	},
	/**
		Begins swiping sequence by positioning the swipeable container and
		bubbling the setupSwipeItem event.
	*/
	startSwipe: function(e) {
		// modify event index to always have this swipeItem value
		e.index = this.swipeIndex;
		this.positionSwipeableContainer(this.swipeIndex,e.xDirection);
		this.$.swipeableComponents.setShowing(true);
		this.setPersistentItemOrigin(e.xDirection);
		this.doSetupSwipeItem(e);
	},
	// If a persistent swipeableItem is still showing, drags it away or bounces it.
	dragPersistentItem: function(e) {
		var xPos = 0;
		var x = (this.persistentItemOrigin == "right")
			? Math.max(xPos, (xPos + e.dx))
			: Math.min(xPos, (xPos + e.dx));
		this.$.swipeableComponents.applyStyle("left",x+"px");
	},
	// If a persistent swipeableItem is still showing, completes drag away or bounce.
	dragFinishPersistentItem: function(e) {
		var completeSwipe = (this.calcPercentageDragged(e.dx) > 0.2);
		var dir = (e.dx > 0) ? "right" : (e.dx < 0) ? "left" : null;
		if(this.persistentItemOrigin == dir) {
			if(completeSwipe) {
				this.slideAwayItem();
			} else {
				this.bounceItem(e);
			}
		} else {
			this.bounceItem(e);
		}
	},
	setPersistentItemOrigin: function(xDirection) {
		this.persistentItemOrigin = xDirection == 1 ? "left" : "right";
	},
	calcPercentageDragged: function(dx) {
		return Math.abs(dx/this.$.swipeableComponents.getBounds().width);
	},
	swipe: function(speed) {
		this.swipeComplete = true;
		this.animateSwipe(0,speed);
	},
	backOutSwipe: function(e) {
		var dimensions = this.$.swipeableComponents.getBounds();
		var x = (this.swipeDirection == 1) ? -1*dimensions.width : dimensions.width;
		this.animateSwipe(x,this.fastSwipeSpeedMS);
		this.swipeDirection = null;
	},
	bounceItem: function(e) {
		var bounds = this.$.swipeableComponents.getBounds();
		if(bounds.left != bounds.width) {
			this.animateSwipe(0,this.normalSwipeSpeedMS);
		}
	},
	slideAwayItem: function() {
		var $item = this.$.swipeableComponents;
		var parentWidth = $item.getBounds().width;
		var xPos = (this.persistentItemOrigin == "left") ? -1*parentWidth : parentWidth;
		this.animateSwipe(xPos,this.normalSwipeSpeedMS);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},
	clearSwipeables: function() {
		this.$.swipeableComponents.setShowing(false);
		this.persistentItemVisible = false;
		this.setPersistSwipeableItem(false);
	},
	// Completes swipe and hides active swipeable item.
	completeSwipe: function(e) {
		if(this.completeSwipeTimeout) {
			clearTimeout(this.completeSwipeTimeout);
			this.completeSwipeTimeout = null;
		}
		// if this wasn't a persistent item, hide it upon completion and send swipe complete event
		if(!this.getPersistSwipeableItem()) {
			this.$.swipeableComponents.setShowing(false);
			// if the swipe was completed, update the current row and bubble swipeComplete event
			if(this.swipeComplete) {
				this.doSwipeComplete({index: this.swipeIndex, xDirection: this.swipeDirection});
			}
		} else {
			this.persistentItemVisible = true;
		}
		this.swipeIndex = null;
		this.swipeDirection = null;
	},
	animateSwipe: function(targetX,totalTimeMS) {
		var t0 = enyo.now(), t = 0;
		var $item = this.$.swipeableComponents;
		var origX = parseInt($item.domStyles.left,10);
		var xDelta = targetX - origX;

		this.stopAnimateSwipe();

		var fn = enyo.bind(this, function() {
			var t = enyo.now() - t0;
			var percTimeElapsed = t/totalTimeMS;
			var currentX = origX + (xDelta)*Math.min(percTimeElapsed,1);

			// set new left
			$item.applyStyle("left",currentX+"px");

			// schedule next frame
			this.job = enyo.requestAnimationFrame(fn);

			// potentially override animation TODO

			// go until we've hit our total time
			if(t/totalTimeMS >= 1) {
				this.stopAnimateSwipe();
				this.completeSwipeTimeout = setTimeout(enyo.bind(this, function() {
					this.completeSwipe();
				}), this.completeSwipeDelayMS);
			}
		});

		this.job = enyo.requestAnimationFrame(fn);
	},
	stopAnimateSwipe: function() {
		if(this.job) {
			this.job = enyo.cancelRequestAnimationFrame(this.job);
		}
	}
});