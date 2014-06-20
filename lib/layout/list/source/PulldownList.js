/**
_enyo.PulldownList_ is a list that provides a pull-to-refresh feature, which
allows new data to be retrieved and updated in the list.

PulldownList provides the _onPullRelease_ event to allow an application to start
retrieving new data.  The _onPullComplete_ event indicates that the pull is
complete and it's time to update the list with the new data.

	{name: "list", kind: "PulldownList", onSetupItem: "setupItem",
		onPullRelease: "pullRelease", onPullComplete: "pullComplete",
		components: [
			{name: "item"}
		]}

	pullRelease: function() {
		this.search();
	},
	processSearchResults: function(inRequest, inResponse) {
		this.results = inResponse.results;
		this.$.list.setCount(this.results.length);
		this.$.list.completePull();
	},
	pullComplete: function() {
		this.$.list.reset();
	}
*/
enyo.kind({
	name: "enyo.PulldownList",
	kind: "List",
	//* @protected
	// Sets touch to true in inherited Scroller kind for touch-based scrolling strategy
	touch: true,
	// The pull notification area at the top of the list
	pully: null,
	pulldownTools: [
		{name: "pulldown", classes: "enyo-list-pulldown", components: [
			{name: "puller", kind: "Puller"}
		]}
	],
	events: {
		//* Fires when user initiates a pull action.
		onPullStart: "",
		//* Fires when user cancels a pull action.
		onPullCancel: "",
		//* Fires while a pull action is in progress.
		onPull: "",
		//* Fires when the list is released following a pull action, indicating
		//* that we are ready to retrieve data.
		onPullRelease: "",
		//* Fires when data retrieval is complete, indicating that the data is
		//* is ready to be displayed.
		onPullComplete: ""
	},
	handlers: {
		onScrollStart: "scrollStartHandler",
		onScrollStop: "scrollStopHandler",
		ondragfinish: "dragfinish"
	},
	//* Message displayed when list is not being pulled 
	pullingMessage: "Pull down to refresh...",
	//* Message displayed while a pull action is in progress
	pulledMessage: "Release to refresh...",
	//* Message displayed while data is being retrieved
	loadingMessage: "Loading...",
	//
	pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
	pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
	loadingIconClass: "",
	//* @protected
	create: function() {
		var p = {kind: "Puller", showing: false, text: this.loadingMessage, iconClass: this.loadingIconClass, onCreate: "setPully"};
		this.listTools.splice(0, 0, p);
		this.inherited(arguments);
		this.setPulling();
	},
	initComponents: function() {
		this.createChrome(this.pulldownTools);
		this.accel = enyo.dom.canAccelerate();
		this.translation = this.accel ? "translate3d" : "translate";
		this.strategyKind = this.resetStrategyKind();
		this.inherited(arguments);
	},
	// Temporarily use TouchScrollStrategy on iOS devices (see ENYO-1714)
	resetStrategyKind: function() {
		return (enyo.platform.android >= 3)
			? "TranslateScrollStrategy"
			: "TouchScrollStrategy";
	},
	setPully: function(inSender, inEvent) {
		this.pully = inEvent.originator;
	},
	scrollStartHandler: function() {
		this.firedPullStart = false;
		this.firedPull = false;
		this.firedPullCancel = false;
	},
	scroll: function(inSender, inEvent) {
		var r = this.inherited(arguments);
		if (this.completingPull) {
			this.pully.setShowing(false);
		}
		var s = this.getStrategy().$.scrollMath || this.getStrategy();
		var over = -1*this.getScrollTop();
		if (s.isInOverScroll() && over > 0) {
			enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + over + "px" + (this.accel ? ",0" : ""));
			if (!this.firedPullStart) {
				this.firedPullStart = true;
				this.pullStart();
				this.pullHeight = this.$.pulldown.getBounds().height;
			}
			if (over > this.pullHeight && !this.firedPull) {
				this.firedPull = true;
				this.firedPullCancel = false;
				this.pull();
			}
			if (this.firedPull && !this.firedPullCancel && over < this.pullHeight) {
				this.firedPullCancel = true;
				this.firedPull = false;
				this.pullCancel();
			}
		}
		return r;
	},
	scrollStopHandler: function() {
		if (this.completingPull) {
			this.completingPull = false;
			this.doPullComplete();
		}
	},
	dragfinish: function() {
		if (this.firedPull) {
			var s = this.getStrategy().$.scrollMath || this.getStrategy();
			s.setScrollY(-1*this.getScrollTop() - this.pullHeight);
			this.pullRelease();
		}
	},
	//* @public
	//* Signals that the list should execute pull completion. This is usually
	//* called after the application has received the new data.
	completePull: function() {
		this.completingPull = true;
		var s = this.getStrategy().$.scrollMath || this.getStrategy();
		s.setScrollY(this.pullHeight);
		s.start();
	},
	//* @protected
	pullStart: function() {
		this.setPulling();
		this.pully.setShowing(false);
		this.$.puller.setShowing(true);
		this.doPullStart();
	},
	pull: function() {
		this.setPulled();
		this.doPull();
	},
	pullCancel: function() {
		this.setPulling();
		this.doPullCancel();
	},
	pullRelease: function() {
		this.$.puller.setShowing(false);
		this.pully.setShowing(true);
		this.doPullRelease();
	},
	setPulling: function() {
		this.$.puller.setText(this.pullingMessage);
		this.$.puller.setIconClass(this.pullingIconClass);
	},
	setPulled: function() {
		this.$.puller.setText(this.pulledMessage);
		this.$.puller.setIconClass(this.pulledIconClass);
	}
});

enyo.kind({
	name: "enyo.Puller",
	classes: "enyo-puller",
	published: {
		text: "",
		iconClass: ""
	},
	events: {
		onCreate: ""
	},
	components: [
		{name: "icon"},
		{name: "text", tag: "span", classes: "enyo-puller-text"}
	],
	create: function() {
		this.inherited(arguments);
		this.doCreate();
		this.textChanged();
		this.iconClassChanged();
	},
	textChanged: function() {
		this.$.text.setContent(this.text);
	},
	iconClassChanged: function() {
		this.$.icon.setClasses(this.iconClass);
	}
});