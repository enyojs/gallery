/**
	_enyo.ImageCarousel_ is an <a href="#enyo.Panels">enyo.Panels</a> that
	uses <a href="#enyo.CarouselArranger">enyo.CarouselArranger</a> as its
	arrangerKind. An ImageCarousel dynamically creates and loads instances of
	<a href="#enyo.ImageView">enyo.ImageView</a> as needed, creating a gallery
	of images.

		{kind:"ImageCarousel", images:[
			"assets/mercury.jpg",
			"assets/venus.jpg",
			"assets/earth.jpg",
			"assets/mars.jpg",
			"assets/jupiter.jpg",
			"assets/saturn.jpg",
			"assets/uranus.jpg",
			"assets/neptune.jpg"
		], defaultScale:"auto"},

	All of the events (_onload_, _onerror_, and _onZoom_) from the contained
	ImageView objects are bubbled up to the ImageCarousel, which also inherits
	the	_onTransitionStart_ and	_onTransitionFinish_ events from _enyo.Panels_.

	The _images_ property is an array containing the file paths of the images in
	the	gallery.  The _images_ array may be altered and updated at any time, and
	the	current index may be manipulated at runtime via the inherited
	_getIndex()_ and _setIndex()_ functions.

	Note that it's best to specify a size for the ImageCarousel in order to
	avoid complications.
*/

enyo.kind({
	name: "enyo.ImageCarousel",
	kind: enyo.Panels,
	arrangerKind: "enyo.CarouselArranger",
	/**
		The default scale value to be applied to each ImageView. Can be "auto",
		"width", "height", or any positive numeric value.
	*/
	defaultScale: "auto",
	//* If true, ImageView instances are created with zooming disabled.
	disableZoom:  false,
	/**
		If true, any ImageViews that are not in the immediate viewing area
		(i.e., the currently active image and the first image on either
		side of it) will be destroyed to free up memory. This has the benefit of
		using minimal memory (which is good for mobile devices), but has the
		downside that, if you want to view the images again, the ImageViews will
		have to be re-created and the images re-fetched (thus increasing the
		number of image-related GET calls). Defaults to false.
	*/
	lowMemory: false,
	published: {
		//* Array of image source file paths
		images:[]
	},
	//* @protected
	handlers: {
		onTransitionStart: "transitionStart",
		onTransitionFinish: "transitionFinish"
	},
	create: function() {
		this.inherited(arguments);
		this.imageCount = this.images.length;
		if(this.images.length>0) {
			this.initContainers();
			this.loadNearby();
		}
	},
	initContainers: function() {
		for(var i=0; i<this.images.length; i++) {
			if(!this.$["container" + i]) {
				this.createComponent({
					name: "container" + i,
					style: "height:100%; width:100%;"
				});
				this.$["container" + i].render();
			}
		}
		for(i=this.images.length; i<this.imageCount; i++) {
			if(this.$["image" + i]) {
				this.$["image" + i].destroy();
			}
			this.$["container" + i].destroy();
		}
		this.imageCount = this.images.length;
	},
	loadNearby: function() {
		var range = this.getBufferRange();
		for (var i in range) {
			this.loadImageView(range[i]);
		}
	},
	getBufferRange: function() {
		var range = [];
		if (this.layout.containerBounds) {
			var prefetchRange = 1;
			var bounds = this.layout.containerBounds;
			var m, img, c, i, x, xEnd;
			// get the lower range
			i=this.index-1;
			x=0;
			xEnd = bounds.width * prefetchRange;
			while (i>=0 && x<=xEnd) {
				c = this.$["container" + i];
				x+= c.width + c.marginWidth;
				range.unshift(i);
				i--;
			}
			// get the upper range
			i=this.index;
			x=0;
			xEnd = bounds.width * (prefetchRange + 1);
			while (i<this.images.length && x<=xEnd) {
				c = this.$["container" + i];
				x+= c.width + c.marginWidth;
				range.push(i);
				i++;
			}
		}
		return range;
	},
	reflow: function() {
		this.inherited(arguments);
		this.loadNearby();
	},
	loadImageView: function(index) {
		// NOTE: wrap bugged in enyo.CarouselArranger, but once fixed, wrap should work in this
		if(this.wrap) {
			// Used this modulo technique to get around javascript issue with negative values
			// ref: http://javascript.about.com/od/problemsolving/a/modulobug.htm
			index = ((index % this.images.length)+this.images.length)%this.images.length;
		}
		if(index>=0 && index<=this.images.length-1) {
			if(!this.$["image" + index]) {
				this.$["container" + index].createComponent({
					name: "image" + index,
					kind: "ImageView",
					scale: this.defaultScale,
					disableZoom: this.disableZoom,
					src: this.images[index],
					verticalDragPropagation: false,
					style: "height:100%; width:100%;"
				}, {owner: this});
				this.$["image" + index].render();
			} else {
				if(this.$["image" + index].src != this.images[index]) {
					this.$["image" + index].setSrc(this.images[index]);
					this.$["image" + index].setScale(this.defaultScale);
					this.$["image" + index].setDisableZoom(this.disableZoom);
				}
			}
		}
		return this.$["image" + index];
	},
	setImages: function(inImages) {
		// always invoke imagesChanged because this is an array property
		// which might otherwise seem to be the same object
		this.setPropertyValue("images", inImages, "imagesChanged");
	},
	imagesChanged: function() {
		this.initContainers();
		this.loadNearby();
	},
	indexChanged: function() {
		this.loadNearby();
		if(this.lowMemory) {
			this.cleanupMemory();
		}
		this.inherited(arguments);
	},
	transitionStart: function(inSender, inEvent) {
		if(inEvent.fromIndex==inEvent.toIndex)
			return true; //prevent from bubbling if there's no change
	},
	transitionFinish: function(inSender, inEvent) {
		this.loadNearby();
		if(this.lowMemory) {
			this.cleanupMemory();
		}
	},
	//* @public
	//* Returns the currently displayed ImageView.
	getActiveImage: function() {
		return this.getImageByIndex(this.index);
	},
	//* Returns the ImageView with the specified index.
	getImageByIndex: function(index) {
		return this.$["image" + index] || this.loadImageView(index);
	},
	/**
		Destroys any ImageView objects that are not in the immediate viewing
		area (i.e., the currently active image and the first image on either
		side of	it) to free up memory. If you set the Image Carousel's
		_lowMemory_ property to true, this function will be called automatically
		as needed.
	*/
	cleanupMemory: function() {
		var buffer = getBufferRange();
		for(var i=0; i<this.images.length; i++) {
			if(enyo.indexOf(i, buffer) ===-1) {
				if(this.$["image" + i]) {
					this.$["image" + i].destroy();
				}
			}
		}
	}
});
