enyo.kind({
    name: "App",
    classes: "enyo-fill",
    kind: "FittableRows",
    published:{
        widgets:null,
        owners:[],
        categories:[]
    },
    components: [
        {
            kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", components: [
                {tag: "span", classes: "toolbar-logo", content: "Enyo"},
                {tag: "h1", content: "Community Gallery", fit: true}
            ]
        },
        {
            kind: "Panels",
            arrangerKind: "CollapsingArranger",
            draggable:false,
            fit: true,
            components: [
                {
                    name: "listPanel",
                    kind: "FittableRows",
                    style: "width:100%;",
                    components: [
                        {
                            classes: "toolbar-search enyo-children-inline", components: [
                            {
                                name: "categoriesMenuDecorator",
                                kind: "onyx.MenuDecorator",
                                onSelect: "itemSelected",
                                classes: "toolbar-search-menu-decorator",
                                style: "margin-right:5px;",
                                components: [
                                    {
                                        kind: "FittableColumns",
                                        style: "position:relative; width:100%;",
                                        defaultKind: "onyx.Button",
                                        components: [
                                            {
                                                name: "selectedCategoryButton",
                                                content: "All categories",
                                                kind: "onyx.Button",
                                                onActivate: "preventMenuActivate",
                                                style: "font-size:1.3rem; height:32px; width: 100%; text-align:left; border-right:0px;",
                                                fit: true
                                            },
                                            {
                                                allowHtml: true,
                                                content: "&#x25BC;",
                                                style: "border-radius: 1 3px 3px 1; border-left:0px;"
                                            },
                                        ]
                                    },
                                    {
                                        name:"categoriesMenu",
                                        kind: "onyx.Menu", components: []
                                    }
                                ]
                            },
                            {
                                kind: "onyx.InputDecorator", classes: "toolbar-search-input-decorator", components: [
                                {
                                    kind: "onyx.Input",
                                    name: "searchInput",
                                    placeholder: "Search...",
                                    oninput: "handleSearch",
                                    onblur: "handleBlurFocus",
                                    onfocus: "handleBlurFocus",
                                    defaultFocus: true
                                },
                                {
                                    kind: "Image",
                                    name: "clearInput",
                                    src: "images/search-input-search.png",
                                    style: "float:right;",
                                    ontap: "clearInput"
                                }
                            ]
                            }
                        ]
                        },
                        {
                            name: "list", kind: "enyo.DataGridList",
                            fit: true,
                            selectionType: "group",
                            //orientation:"horizontal",
                            //scrollerOptions:{style:"padding-right:20px;"},
                            minWidth: 320, minHeight: 110, spacing: 10,
                            classes: "gallery-list",
                            components: [
                                {
                                    classes: "repeater-item", ontap: "itemTap", components: [
                                    {
                                        classes: "name-wrapper", components: [
                                        {
                                            style: "width:220px",
                                            components: [
                                                {name: "displayName", classes: "name"},
                                                {name: "createdBy", classes: "author"},
                                            ]
                                        },
                                        {
                                            classes: "icon-holder", tag: "span", components: [
                                            {name: "icon", kind: "Image", classes: "icon"}
                                        ]
                                        },
                                        //{name: "lastNameLetter", classes: "name last-letter", tag: "span"}
                                    ]
                                    }/*,
                                    {name: "name", classes: "name last bottom"},*/
                                ], bindings: [
                                    {from: ".model.name", to: ".$.name.content"},
                                    {from: ".model.displayName", to: ".$.displayName.content"},
                                    {
                                        from: ".model.owner", to: ".$.createdBy.content",
                                        transform: function (v, d, b) {
                                            var ownerInfo = b.owner.owner.lookupOwnerInfo(v);
                                            return ownerInfo ? ("by " + ownerInfo.name) : "";
                                        }
                                    },
                                    {
                                        from: ".model", to: ".$.icon.src", transform: function (v, d, b) {
                                        if (!v) return "";
                                        return ("gallery_images/" + v.get("name") + ".jpg")
                                    }
                                    }
                                ]
                                }
                            ]
                        },


                    ]
                },
                {kind: "Details", fit:true, classes: "details animated-panel", onHide: "hideDetails"},
            ]
        }

    ],
    create: function () {
        this.inherited(arguments);
        window.onhashchange = enyo.bind(this, "hashChange");
        //this.$.scroller.getStrategy().translateOptimized = true;
        this.widgets = new WidgetCollection();
        this.owners = {};
        this.$.list.set("collection", this.widgets);
    },
    rendered: function () {
        this.inherited(arguments);
        this.fetchGalleryData();
    },
    /*
     resizeHandler: function() {
     this.inherited(arguments);
     this.$.details.adjustSize(this.getBounds());
     this.$.details.updatePosition();
     },*/
    fetchGalleryData: function () {
        new enyo.Ajax({url: "gallery_manifest.json"})
            .response(this, function (inSender, inResponse) {
                var ws = inResponse.widgets;
                this.widgets.add(ws, {merge: true});

                var os = inResponse.owners;
                this.owners = os;

                var cs = inResponse.categories;
                this.set("categories", cs);
                console.log("owners", this.owners);
                console.log("wigets", this.widgets);
                this.hashChange();
            })
            .go();
    },

    categoriesChanged: function(){
        this.$.categoriesMenu.destroyClientControls();
        var categoryComponents = [{content:"All categories"}];
        this.categories.sort();
        for (var a=0; a<this.categories.length; a++){
            categoryComponents.push({content: this.categories[a]});
        }
        this.$.categoriesMenu.createComponents(categoryComponents, {owner:this});
        this.$.categoriesMenuDecorator.render();
    },

    itemSelected: function(s,e){
        var searchValue = e.selected.content||"";
        this.$.selectedCategoryButton.setContent(searchValue);
        var searchFunction = function(model){
            var toCheck = "All categories";
            var modelCategories = model.get("categories")||[];
            for (var a=0; a<modelCategories.length; a++){
                toCheck = toCheck + " " + modelCategories[a];
            }
            return (toCheck.toLowerCase().indexOf(searchValue.toLowerCase())!=-1);
        };
        var results = enyo.store.find(WidgetModel, searchFunction);
        this.$.list.set("collection", new WidgetCollection(results));
        this.set("noResultsFound", results.length);
    },

    noResultsFoundChanged: function(){
        if (!this.$.noResultsPopup){
            this.createComponent({
                name:"noResultsPopup",
                kind:"onyx.Popup",
                autoDismiss:false,
                centered:true,
                style:"height:280px; width:320px; text-align:center;",
                components:[
                    {
                        style:"font-size:20px; margin-top:20%;",
                        allowHtml:true,
                        content:"No components matching category search found. <BR/><BR/>Please check out a different category!"
                    }
                ]
            })
            this.$.noResultsPopup.render();
        }
        this.$.noResultsPopup.setShowing(!this.noResultsFound);
    },

    handleBlurFocus: function (inSender, inEvent) {
        inSender.addRemoveClass("toolbar-blurred", inEvent.type === "focus");
    },
    clearInput: function () {
        this.$.searchInput.setValue("");
        this.$.clearInput.setSrc("images/search-input-search.png");
        this.handleSearch();
    },
    handleSearch: function (inSender) {
        if (this.widgets) {
            var searchValue = this.$.searchInput.getValue().toLowerCase();
            if (searchValue === "") {
                this.$.list.set("collection", this.widgets);
            } else {
                var searchFunction = function(model){
                    var toCheck = model.get("displayName") + " " + model.get("name") + " " + model.get("blurb");
                    return (toCheck.toLowerCase().indexOf(searchValue)!=-1);
                };
                var results = enyo.store.find(WidgetModel, searchFunction);
                this.$.list.set("collection", new WidgetCollection(results));
                this.$.clearInput.setSrc("images/search-input-cancel.png");
            }
        }
    },

    lookupOwnerInfo: function (owner) {
        return this.owners[owner];
        ;
    },

    toDateSortedArray: function (inItems) {
        var ls = [];
        for (var n in inItems) {
            ls.push(inItems[n]);
        }
        ls.sort(function (i1, i2) {
            var d1 = new Date(i1.submissionDate);
            var d2 = new Date(i2.submissionDate);
            if (d1 > d2) {
                return -1;
            } else if (d1 < d2) {
                return 1;
            } else {
                return 0;
            }
        });
        return ls;
    },
    itemTap: function (inSender, inEvent) {
        this.itemTapped = true;
        this._selectedIndex = inEvent.index;
        console.log("tapped", inSender, inEvent);
        var name = inEvent.model.get("name");
        this.setHashComponentName(name);
        return true;
    },
    showDetails: function (widget) {

        this.$.details.set("widget", widget);
        this.$.details.set("ownerInfo", this.lookupOwnerInfo(widget.get("owner")));
        if (enyo.Panels.isScreenNarrow()) {
            this.$.panels.set("index", 1);
        } else {
            this.$.panels.set("index", 0);
        }
        this.$.panels.addClass("collapsed");
        this.$.list.scrollToIndex(this._selectedIndex);
    },
    hideDetails: function () {
        this.$.listPanel.setBounds({width: "100%"});
        this.$.panels.set("index", 0);
        this.$.panels.resize();
        this.$.panels.removeClass("collapsed");
        this.back();
        this.$.list.scrollToIndex(this._selectedIndex);
    },
    back: function () {
        if (this.itemTapped) {
            this.itemTapped = false;
            window.history.back();
        } else {
            this.setHashComponentName("");
        }
    },
    preventTap: function (inSender, inEvent) {
        inEvent.preventTap();
    },
    getHashComponentName: function () {
        return window.location.hash.slice(1);
    },
    setHashComponentName: function (inName) {
        window.location.hash = inName;
    },
    hashChange: function () {
        var n = this.getHashComponentName();
        var widget = enyo.store.find(WidgetModel,
            function (model) {
                return (model.get("name") === n);
            },
            {all: false});
        if (n && widget) {
            this.$.listPanel.setBounds({width: "320px"});
            this.$.panels.set("index", 0);
            this.$.panels.resize();
            this.showDetails(widget);
        }
    }
});

enyo.kind({
    name: "Details",
    kind: "FittableRows",
    //kind: "onyx.Popup",
    kindClasses: "details",
    layoutKind: "FittableRowsLayout",
    published: {
        widget: null,
        ownerInfo: null,
        maxHeight: ""
    },
    events: {
        onHide: ""
    },
    bindings: [
        {from: ".ownerInfo.name", to: ".$.owner.content"},
        {
            from: ".ownerInfo", to: ".$.links.content", transform: function (v, d, b) {
            if (!v) {
                return "";
            }
            var links = "";
            if (v.website) {
                links = "<a href='" + v.website + "' target='_blank'>Website</a>";
            }
            if (v.twitter) {
                links += "<a href='http://www.twitter.com/" + v.twitter + "' target='_blank'>Twitter</a>";
            }
            return links;
        }
        }
    ],
    components: [
        {
            classes: "details-header", components: [
            {name: "name", classes: "details-name", tag: "h1"},
            {name: "owner", classes: "details-owner", tag: "h2"},
            {name: "links", classes: "details-links", allowHtml: true},
            {name: "close", kind: "onyx.Icon", src: "images/close-icon.png", classes: "details-close", ontap: "doHide"},
        ]
        },
        {
            kind: "Scroller", horizontal: "hidden", fit: true, classes: "details-scroller", components: [
            {
                classes: "details-scroller-content", components: [
                {name: "blurb", kind: "Field", classes: "blurb"},
                {
                    classes: "details-icon-holder", components: [
                    {name: "icon", kind: "Image", classes: "details-icon"}
                ]
                },
                {tag: "br"},
                {
                    classes: "details-buttons", defaultKind: "onyx.Button", components: [
                    {name: "demo", classes: "onyx-blue", content: "Demo", ontap: "gotoDemo"},
                    {name: "source", classes: "onyx-blue", content: "View Source", ontap: "gotoSource"}
                ]
                },
                {name: "submissionDate", kind: "Field"},
                {name: "testedPlatforms", kind: "Field"},
                {name: "license", kind: "Field"},
                {name: "dependencies", kind: "Field"}
            ]
            }
        ]
        }
    ],
    create: function () {
        this.inherited(arguments);
        this.widgetChanged();
    },
    adjustSize: function (inContainerBounds) {
        var b = inContainerBounds;
        this.applyStyle("width", Math.min(720, b.width - 40) + "px");
        this.applyStyle("height", Math.min(800, b.height - 80) + "px");
    },
    widgetChanged: function () {
        if (!this.widget) {
            return;
        }
        //console.log("widget in details is", this.widget);
        var i = this.widget.raw();
        if (!i) {
            return;
        }
        //
        this.$.demo.setShowing(i.demoUrl);
        //
        this.$.name.setContent(i.displayName);
        this.$.owner.setContent("by " + i.owner.name);
        this.$.icon.setSrc("gallery_images/" + i.name + ".jpg");
        this.$.blurb.setNameValue({name: "Description", value: (i.blurb || "")});
        //
        this.$.submissionDate.setNameValue({name: "Submission Date", value: (i.submissionDate || "Unknown")});
        this.$.testedPlatforms.setNameValue({name: "Tested Platforms", value: (i.testedPlatforms || "Unknown")});
        this.$.license.setNameValue({name: "License", value: i.license});
        var dep = [];
        enyo.forEach(i.dependencies, function (d) {
            dep.push(d.name + (d.version ? "/" + d.version : ""));
        });
        this.$.dependencies.setNameValue({name: "Dependencies", value: (dep.length && dep.join(", ") || "None")});
    },
    gotoSource: function () {
        window.open(this.widget.get("url"));
        return true;
    },
    gotoDemo: function () {
        window.open(this.widget.get("demoUrl"));
        return true;
    }
});

enyo.kind({
    name: "Field",
    classes: "field",
    components: [
        {name: "name", classes: "field-name"},
        {name: "value", classes: "field-value", allowHtml: true}
    ],
    setNameValue: function (inNameValue) {
        this.$.name.setContent(inNameValue.name);
        this.$.value.setContent(inNameValue.value);
    }
});
