enyo.kind({
	name: "calendar",
	classes: "calendar enyo-fit",
	published:{
		"setYear":"",
		"setMonth":""
	},
	components: [
		{name: "month", classes: "section", allowHtml: true, components:[
			{kind: "onyx.IconButton", src: "assets/left_arrow.png", ontap:"leftTapped", classes:"prev_button"},
			{name: "innerMonth", classes: "contentSection", ontap:"calendarTapped", popup:"popupInput"},
			{name: "popupInput", kind: "onyx.Popup", centered: true, modal: true, floating: true, onShow: "popupShown", onHide: "popupHidden", components:[
				{classes:"inputContainer", components:[
					{name: "yearInput", kind: "onyx.Input", placeholder: "Type Year here", classes:"Typing", style: "margin: 10px", onkeypress:"enterDetected"},
					{content: "년", style: "position: relative; top: 10px; margin: 5px; font-weight: bold; font-size: 18px"},
					{name: "monthInput", kind: "onyx.Input", placeholder: "Type Month here", classes:"Typing", style: "margin: 10px", onkeypress:"enterDetected"},
					{content: "월", style: "position: relative; top: 10px; margin: 5px; font-weight: bold; font-size: 18px"},
				]},
				{tag: "br"},
				{tag: "br"},
				{kind: "onyx.Button", content: "Close", ontap: "closePopup", classes: "popupButton"},
				{kind: "onyx.Button", content: "Apply", ontap: "applyYearMonth", classes: "popupButton", popup: "showMessage"},
				{name: "showMessage", kind: "onyx.Popup",onkeypress:"closeMessagePopup2", centered: true, modal: true, floating: true, components:[
					{name:"popupContents", content:"", allowHtml: true},
					{tag: "br"},
					{kind:"onyx.Button", content: "Close", ontap: "closeMessagePopup", style:"position:relative; left: 50%; margin-left: -39.5px"}
				]}
			]},
			{kind: "onyx.IconButton", src: "assets/right_arrow.png", ontap:"rightTapped", classes:"next_button"}
		]},
		{name:"monthTable", kind: "enyo.Table", components: [
			{classes: "header", components: [
				{content: "Sun"},
				{content: "Mon"},
				{content: "Tue"},
				{content: "Wed"},
				{content: "Thu"},
				{content: "Fri"},
				{content: "Sat"}
			]}
		]}
	],
	create: function() {
		if(!localStorage.count_c){
			localStorage.setItem('count_c', '0');
		}
		this.inherited(arguments);
		
		var currentRow,
			dateObj = new Date();

		// calculate current date
		var currentDate = dateObj.getDate();

		// calculate date of first day of the month
		dateObj.setDate(1);
		var offset = dateObj.getDay();

		// calculate date of last day of the month
		this.setYear = dateObj.getFullYear();
		this.setMonth = dateObj.getMonth();
		var lastDate = this.getDaysInMonth(dateObj.getMonth(), dateObj.getFullYear());

		// this calculation can probably be simplified, but allows for padding blank spaces in
		// the calendar to display a "full" table
		for (var i=0; i<lastDate+offset+(((lastDate+offset)%7)?7-((lastDate+offset)%7):0); i++) {
			if (i%7 === 0) {
				currentRow = this.$.monthTable.createComponent({});
			}
			if (i<offset || i>=lastDate+offset) {
				currentRow.createComponent({});
			} else {
				var cellDay = new functionCell();
				cellDay.number = (i-offset+1);
				cellDay.year = this.setYear;
				cellDay.month = this.setMonth;
				if ((i-offset+1) === currentDate) {
					cellDay.active = true;
					cellDay = enyo.mixin(cellDay, {classes: "current"});
				}
				currentRow.createComponent(cellDay);
			}
		}

		// set month display
		this.$.innerMonth.setContent(dateObj.getFullYear() + "년 " + (dateObj.getMonth()+1) +"월");
	},
	// adapted from http://stackoverflow.com/questions/1810984/number-of-days-in-any-month
	getDaysInMonth: function(m, y) {
		return (/8|3|5|10/).test(m)?30:m==1?((y%4===0)&&y%100)||(y%400===0)?29:28:31;
	},

	leftTapped: function(inSender, inEvent){
		this.$.monthTable.destroyComponents();
		var currentRow,
			dateObj = new Date();
		if(this.setMonth > 0){
			this.setMonth -= 1;
		}
		else{
			this.setMonth = 11;
			this.setYear -= 1;
		}
		var dateObj2 = new Date(this.setYear, this.setMonth, 1);
		var currentDate = dateObj.getDate();
		var offset = dateObj2.getDay();
		var lastDate = this.getDaysInMonth(this.setMonth, this.setYear);
		// this calculation can probably be simplified, but allows for padding blank spaces in
		// the calendar to display a "full" table
		for (var i=0; i<lastDate+offset+(((lastDate+offset)%7)?7-((lastDate+offset)%7):0); i++) {
			if (i%7 === 0) {
				currentRow = this.$.monthTable.createComponent({});
			}
			if (i<offset || i>=lastDate+offset) {
				currentRow.createComponent({});
			} else {
				var cellDay = new functionCell();
				cellDay.number = (i-offset+1);
				cellDay.year = this.setYear;
				cellDay.month = this.setMonth;
				if ((i-offset+1) === currentDate && dateObj.getFullYear() == this.setYear && dateObj.getMonth() == this.setMonth) {
					cellDay.active = true;
					cellDay = enyo.mixin(cellDay, {classes: "current"});
				}
				currentRow.createComponent(cellDay);
			}
		}

		// set month display
		this.$.innerMonth.setContent(this.setYear + "년 " + (this.setMonth+1) +"월");
		this.$.monthTable.render();
	},

	rightTapped: function(inSender,inEvent){
		this.$.monthTable.destroyComponents();
		var currentRow,
			dateObj = new Date();
		if(this.setMonth < 11){
			this.setMonth += 1;
		}
		else{
			this.setMonth = 0;
			this.setYear += 1;
		}
		var dateObj2 = new Date(this.setYear, this.setMonth, 1);
		var currentDate = dateObj.getDate();
		var offset = dateObj2.getDay();
		var lastDate = this.getDaysInMonth(this.setMonth, this.setYear);
		// this calculation can probably be simplified, but allows for padding blank spaces in
		// the calendar to display a "full" table
		for (var i=0; i<lastDate+offset+(((lastDate+offset)%7)?7-((lastDate+offset)%7):0); i++) {
			if (i%7 === 0) {
				currentRow = this.$.monthTable.createComponent({});
			}
			if (i<offset || i>=lastDate+offset) {
				currentRow.createComponent({});
			} else {
				var cellDay = new functionCell();
				cellDay.number = (i-offset+1);
				cellDay.year = this.setYear;
				cellDay.month = this.setMonth;
				if ((i-offset+1) === currentDate && dateObj.getFullYear() == this.setYear && dateObj.getMonth() == this.setMonth) {
					cellDay.active = true;
					cellDay = enyo.mixin(cellDay, {classes: "current"});
				}
				currentRow.createComponent(cellDay);
			}
		}

		// set month display
		this.$.innerMonth.setContent(this.setYear + "년 " + (this.setMonth+1) +"월");
		this.$.monthTable.render();
	},

	calendarTapped: function(inSender, inEvent){
		this.$.popupInput.show();
	},

	closePopup: function(inSender, inEvent){
		this.$.popupInput.hide();
	},

	popupShown: function() {
		this.$.yearInput.focus();
	},

	enterDetected: function(inSender, inEvent){
		if(inEvent.keyCode == 13){
			this.applyYearMonth();
		}
	},

	applyYearMonth: function(inSender, inEvent){
		var yearInputValue = parseFloat(this.$.yearInput.getValue());
		var monthInputValue = parseFloat(this.$.monthInput.getValue() - 1);
		if(this.$.yearInput.getValue() == ""){
				this.$.popupContents.setContent("please input Year value!");
				this.$.showMessage.show();
				return;
		}
			if(this.$.monthInput.getValue() == ""){
				this.$.popupContents.setContent("please input Month value!");
				this.$.showMessage.show();
				return;
		}
		if(this.isInt(yearInputValue) == false){
			this.$.popupContents.setContent("Invalid Year value! <br/> please input integer value");
			this.$.showMessage.show();
			return;	
		}
		else if(yearInputValue < 1000 || yearInputValue > 3000){
			this.$.popupContents.setContent("Invalid Year value! <br/> please input value between 1000 ~ 3000");
			this.$.showMessage.show();
			return;	
		}
		this.setYear = yearInputValue;
		if(this.isInt(monthInputValue) == false){
			this.$.popupContents.setContent("Invalid Month value! <br/> please input integer value");
			this.$.showMessage.show();
			return;	
		}
		else if(monthInputValue < 0 || monthInputValue > 11){
			this.$.popupContents.setContent("Invalid Month value! <br/> please input value between 1 ~ 12");
			this.$.showMessage.show();
			return;	
		}
		this.setMonth = monthInputValue; 
		this.$.popupInput.hide();
		this.$.monthTable.destroyComponents();
		var currentRow,
			dateObj = new Date();
		this.$.yearInput.clear();
		this.$.monthInput.clear();
		
		var dateObj2 = new Date(this.setYear, this.setMonth, 1);
		var currentDate = dateObj.getDate();
		var offset = dateObj2.getDay();
		var lastDate = this.getDaysInMonth(this.setMonth, this.setYear);
		// this calculation can probably be simplified, but allows for padding blank spaces in
		// the calendar to display a "full" table
		for (var i=0; i<lastDate+offset+(((lastDate+offset)%7)?7-((lastDate+offset)%7):0); i++) {
			if (i%7 === 0) {
				currentRow = this.$.monthTable.createComponent({});
			}
			if (i<offset || i>=lastDate+offset) {
				currentRow.createComponent({});
			} else {
				var cellDay = new functionCell();
				cellDay.number = (i-offset+1);
				cellDay.year = this.setYear;
				cellDay.month = this.setMonth;
				if ((i-offset+1) === currentDate && dateObj.getFullYear() == this.setYear && dateObj.getMonth() == this.setMonth) {
					cellDay.active = true;
					cellDay = enyo.mixin(cellDay, {classes: "current"});
				}
				currentRow.createComponent(cellDay);
			}
		}

		// set month display
		this.$.innerMonth.setContent(this.setYear + "년 " + (this.setMonth+1) +"월");
		this.$.monthTable.render();
	},

	closeMessagePopup: function(inSender, inEvent){
		this.$.showMessage.hide();
	},
	
	closeMessagePopup2: function(inSender,inEvent){
		if(inEvent.keyCode == 13){
			this.closeMessagePopup();
		}
	},

	isInt: function(value){
		return typeof(value) === 'number' && value % 1 == 0;
	},

	ontapTest: function(inSender, inEvent){
		alert('this is a ' + inSender.getContent());
		
	},
});

enyo.kind({
	name:"functionCell",
	kind:"enyo.TableCell",
	components:[
		{name: "cellContent", popup:"scheduleInput", popup:"scheduleShow", content:""},
		{name:"scheduleInput", kind: "onyx.Popup", centered: true, modal: true, floating: true, onShow: "", components:[
			{content: "제목", style: "position: relative; top: 5px; margin: 5px; font-weight: bold; font-size: 18px; display: inline"},
			{name: "subjectInput", kind: "onyx.Input", placeholder: "Type subject here", classes:"Typing", style: "margin: 10px", onkeypress:""},
			{tag:"br"},
			{content: "시간", style: "position: relative; top: 5px; margin: 5px; font-weight: bold; font-size: 18px; display: inline"},
			{name: "timeInput", kind: "onyx.Input", placeholder: "Type Time(00:00) here", classes:"Typing", style: "margin: 10px", onkeypress:""},
			{tag:"br"},
			{content: "장소", style: "position: relative; top: 5px; margin: 5px; font-weight: bold; font-size: 18px; display: inline"},
			{name: "placeInput", kind: "onyx.Input", placeholder: "Type Place here", classes:"Typing", style: "margin: 10px", onkeypress:""},
			{tag:"br"},
			{tag:"br"},
			{kind: "onyx.Button", content: "Close", ontap: "closePopup", classes: "popupButton"},
			{kind: "onyx.Button", content: "Apply", ontap: "applySchedule", classes: "popupButton"}
		]},
		{name:"scheduleShow", kind:"onyx.Popup", onHide:"ScheduleListHide", modal: true, floating: true, components:[
			{kind: "onyx.Groupbox", components: [
				{name:"scheduleList", kind: "onyx.GroupboxHeader", content: "Schedule List"}
			]}
		]},
		{name: "scheduleImage", kind:"enyo.Image", src:"assets/dot.png", active: false, style:"position: relative; left: 95%; height: 10px; width: 10px;"},
		{name: "schedule", components:[
			{name:"subject", content:""},
			{name:"time", content:""},
			{name:"place", content:""}
		]}
	],
	published:{
		active: false,
		isSchedule: false,
		number: "",
		year: "",
		month: "",
	},
	handlers:{
		ontap:"cellTap",
		onleave: "cellDeactive"
	},
	create: function(){
		this.inherited(arguments);
		this.$.cellContent.setContent(this.number);

		for(var i = 1 ; i < parseInt(localStorage.count_c)+1 ; i++){
			if((localStorage.getItem(i.toString()+'c')) != null){
				var Obj = {};
				Obj = JSON.parse(localStorage.getItem(i.toString()+'c'));
				if(Obj.year == this.year && Obj.month == this.month && Obj.date == this.number){
					this.restoreSchedule(Obj.subject, Obj.time, Obj.place);
				}
			}
		}

		this.$.schedule.hide();
		if(this.isSchedule == false){
			this.$.scheduleImage.hide();
		}
	},
	restoreSchedule: function(subject, time, place){
		var newSchedule = new scheduleThing();
		newSchedule.setContent(time + "에 " + place + "에서 " + subject +"이(가) 있습니다.");
		this.$.scheduleList.createComponent(newSchedule);
		this.$.scheduleList.render();
		this.isSchedule = true;
		this.$.scheduleImage.show();
	},
	cellTap: function(inSender, inEvent){
		if(this.active == false){
			this.active = true;
			this.applyStyle("background-color","yellow");
			if(this.isSchedule == true){
				this.$.scheduleShow.showAtEvent(inEvent);
			}
		}
		else if(this.active == true){
			this.$.scheduleInput.show();
		}
	},
	cellDeactive: function(inSender, inEvent){
		if(this.active == true){
			this.active = false;
			this.applyStyle("background-color", "white");
			if(this.getClassAttribute() == "current"){
				this.applyStyle("background-color", "#226B9A");
			}
		}
	},
	closePopup: function(inSender, inEvent){
		this.$.scheduleInput.hide();
	},

	applySchedule: function(inSender, inEvent){
		var subject = this.$.subjectInput.getValue();
		var time = this.$.timeInput.getValue();
		var place = this.$.placeInput.getValue();
		this.$.subjectInput.clear();
		this.$.timeInput.clear();
		this.$.placeInput.clear();

		var newSchedule = new scheduleThing();
		newSchedule.setContent(time + "에 " + place + "에서 " + subject +"이(가) 있습니다.");
		var count_c = parseInt(localStorage.count_c);
		count_c++;
		localStorage.setItem('count_c', count_c);
		var Obj_c = [];
		Obj_c[count_c] = {year: this.year, month: this.month, date: this.number, subject: subject, time: time, place: place };
		localStorage.setItem(count_c.toString() + 'c', JSON.stringify(Obj_c[count_c]));
		this.$.scheduleList.createComponent(newSchedule);
		this.$.scheduleList.render();
		this.isSchedule = true;
		this.$.scheduleImage.show();
		this.$.scheduleInput.hide();
	},

	ScheduleListHide: function(inSender, inEvent){
		if(this.active == false){
			this.active = true;
			this.applyStyle("background-color","yellow");
		}
	}
});

enyo.kind({
	name: "scheduleThing",
	content: "",
	handlers:{
		ontap: "editSchedule"
	}
});