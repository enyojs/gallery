enyo.kind({
	name: "To_do",
	components:[
		{kind: "onyx.InputDecorator", style: "width: 100%;", components: [
				{kind: "onyx.Input", name:"to_do_input", classes: "Input", style: "width: 100%;", placeholder: "What do you need to do?", onkeypress:"inputChanged"}
		]},
		{tag: "br"},
		{kind: "onyx.Groupbox", classes:"onyx-sample-result-box", components: [
				{kind: "onyx.GroupboxHeader", classes: "result_header", content: "To do Lists"},
				{name:"result_2", classes:"onyx-sample-result", content:"There is not things to do"}
		]}
	],
	//by enter key, create new component
	inputChanged: function(inSender, inEvent) {
		if(inEvent.keyCode == 13){
			var count = parseInt(localStorage.count);
			var Obj =[];
			count++;
			localStorage.setItem('count', count);
			Obj[count] = {number : count, state : 1, value : inSender.getValue()};
			localStorage.setItem(count, JSON.stringify(Obj[count]));
			this.$.result_2.createComponent({kind:"Things", Things_content: inSender.getValue(), id: count});
			this.$.result_2.render();
			this.$.to_do_input.clear();
		}
	},
	changeFocus: function(inSender, inEvent) {
		enyo.forEach([this.$.inputDecorator, this.$.inputDecorator2, this.$.inputDecorator3], function(inItem) {
			inItem.setAlwaysLooksFocused(inSender.getValue());
			// If disabling alwaysLooksFocused, we need to blur the
			// InputDecorator for the setting to go into effect
			if (!inSender.getValue()) {
				inItem.triggerHandler("onblur");
			}
		});
	},
	
	create: function(){
		//localStorage.clear();
		this.inherited(arguments);
		if(!localStorage.count){
			localStorage.setItem('count','0');
		}
		else{
			for(var i = 1; i < parseInt(localStorage.count)+1 ; i++){
				if(localStorage.getItem(i) != null){
					var Obj = {};
					Obj = JSON.parse(localStorage.getItem(i));
					this.$.result_2.createComponent({kind:"Things", Things_content: Obj.value, state: Obj.state, id: i });
				}
			}
			this.$.result_2.render();
		}

	}

});


enyo.kind({
	name: "Things",
	classes: "ThingsCss",
	kind: "onyx.Toolbar",
	published:{
		"Things_content":"",
		"state": 1
	},
	components:[
		{name: "ThingsCheck", kind:"onyx.Checkbox", onchange:"checkboxChanged", classes:"ThingsCheckbox"},
		{name: "ThingsName", content:"", classes: "ThingsContent"},
		{kind: "onyx.IconButton", src: "assets/delete_button.png", ontap:"iconTapped", classes:"del_button"}
	],
	create: function(){
		this.inherited(arguments);
		if(this.state != 1){
			this.$.ThingsCheck.active = true;
		}
		if(this.Things_content){
			this.Things_contentChanged();
		}
	},
	Things_contentChanged: function(){
		this.$.ThingsName.setContent(this.Things_content);
		if(this.$.ThingsCheck.active == true){
			this.$.ThingsName.applyStyle("text-decoration","line-through");
		}
	},
	checkboxChanged: function(inSender, inEvent) {
		if(inSender.getValue()){
			this.$.ThingsName.applyStyle("text-decoration","line-through");
			var Obj = {}
			Obj = JSON.parse(localStorage.getItem(this.id));
			Obj.state = 0;
			localStorage.setItem(this.id, JSON.stringify(Obj));
		}
		else{
			this.$.ThingsName.applyStyle("text-decoration","none");
			var Obj = {};
			Obj = JSON.parse(localStorage.getItem(this.id));
			Obj.state = 1;
			localStorage.setItem(this.id, JSON.stringify(Obj));
		}
	},
	iconTapped: function(inSender, inEvent){
		var parent = this.parent;
		this.destroy();
		parent.render();
	},

	destroy: function(){
		localStorage.removeItem(this.id);
		this.inherited(arguments);
	}
});