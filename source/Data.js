enyo.kind({
    name:"WidgetCollection",
    kind:"enyo.Collection",
    model:"WidgetModel"
});


enyo.kind({
    name:"OwnerCollection",
    kind:"enyo.Collection",
    model:"OwnerModel",
    parse: function(data){
        console.log("mydata", data);
        return data;
    }
});

enyo.kind({
    name:"OwnerModel",
    kind:"enyo.Model",
    attributes: {
        "id": "",
        "name": "",
        "website": "",
        "twitter": ""
        }
});


enyo.kind({
    name:"WidgetModel",
    kind:"enyo.Model",
    attributes:
    {
        "name": "",
        "displayName": "",
        "owner": "",
        "dependencies": [
        {
            "name": "",
            "version": ""
        }
        ],
        "url": "",
        "demoUrl": "",
        "submissionDate": "",
        "testedPlatforms": "",
        "license": "",
        "version": "",
        "blurb": ""
    }
});