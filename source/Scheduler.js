enyo.kind({
	name: "Scheduler",
	kind: "FittableRows",
	fit: true,
	published:{
		init : 0
	},
	components:[
		//toobar showing the tapped function
		{kind: "onyx.Toolbar", name: "scheduler_toolbar", id: "upper_toolbar", content: "To do Lists"},
		{kind: "enyo.Scroller", fit: true, components: [
			{name: "main", classes: "nice-padding", allowHtml: true}
		]},
		// bottom toolbar and buttons
		{kind: "onyx.Toolbar", id: "bottom_toolbar", components: [
			//buttons
			{kind: "Group", onActivate:"buttonActivated", classes: "onyx-sample-tools group", defaultKind: "onyx.Button", highlander: true,
			components: [
			{components:[{kind:"Image", classes:"button_image" ,src: "assets/check.png"}] , id: "To do Lists", active: true, classes: "button"},
			{components:[{kind:"Image", classes:"button_image" ,src: "assets/week.png"}] , id: "Weekly Schedule", classes: "button"},
			{components:[{kind:"Image", classes:"button_image" ,src: "assets/month.png"}] , id: "Calendar", classes: "button"}]},
		]},
	],

	buttonActivated: function(inSender, inEvent) {
		// render only when it is started
		if (this.init == 0){
			this.$.main.createComponent({kind:"To_do", name: "To_do"});
			this.$.main.createComponent({kind:"weekly", name: "weekly"});
			this.$.main.createComponent({kind: "calendar", name:"calendar"});
			this.$.main.render();
			this.init++;
		}
		// when each button is tapped show the tapped component and hide the others
		if (inEvent.originator.getActive()) {
			this.$.scheduler_toolbar.setContent(inEvent.originator.getId());
			if(inEvent.originator.getId() == "To do Lists"){
				this.$.main.$.weekly.hide();
				this.$.main.$.calendar.hide();
				this.$.main.$.To_do.show();
			}
			else if(inEvent.originator.getId() == "Weekly Schedule"){
				this.$.main.$.To_do.hide();
				this.$.main.$.calendar.hide();
				this.$.main.$.weekly.show();
			}
			else{
				this.$.main.$.To_do.hide();
				this.$.main.$.weekly.hide();
				this.$.main.$.calendar.show();
			}
		}
	}
	
});
