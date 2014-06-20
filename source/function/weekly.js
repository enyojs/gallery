enyo.kind({
	name: "weekly",
	classes: "weekly enyo-fit",
	components: [
		{name: "week", classes: "section", components:[
			{kind: "onyx.IconButton", src: "assets/left_arrow.png", ontap:"leftTapped", classes:"prev_button"},
			{name: "weekNumber", classes: "contentSection", ontap: "weekTapped", popup: "popupInput"},
			{name: "popupInput", kind: "onyx.Popup", centered: true, modal: true, floating: true, onShow: "popupShown", onHide: "popupHidden", components:[
				{classes:"inputContainer", components:[
					{name: "yearInput", kind: "onyx.Input", placeholder: "Type Year here", classes:"Typing", style: "margin: 10px", onkeypress:"enterDetected"},
					{content: "년", style: "position: relative; top: 10px; margin: 5px; font-weight: bold; font-size: 18px"},
					{name: "weekInput", kind: "onyx.Input", placeholder: "Type Week here", classes:"Typing", style: "margin: 10px", onkeypress:"enterDetected"},
					{content: "주", style: "position: relative; top: 10px; margin: 5px; font-weight: bold; font-size: 18px"},
				]},
				{tag: "br"},
				{tag: "br"},
				{kind: "onyx.Button", content: "Close", ontap: "closePopup", classes: "popupButton"},
				{kind: "onyx.Button", content: "Apply", ontap: "ApplyYearWeek", classes: "popupButton", popup: "showMessage"},
				{name: "showMessage", kind: "onyx.Popup", onkeypress:"closeMessagePopup2", centered: true, modal: true, floating: true, components:[
					{name:"popupContents", content:"", allowHtml: true, style:"text-align: center"},
					{tag: "br"},
					{kind:"onyx.Button", content: "Close", ontap: "closeMessagePopup", style:"position:relative; left: 50%; margin-left: -39.5px"}
				]}
			]},
			{kind: "onyx.IconButton", src: "assets/right_arrow.png", ontap:"rightTapped", classes:"next_button"}
		]},
		{name: "weekTable", kind: "enyo.Table", components: [
			
		]}
	],
	published:{
		"setYear":"",
		"setWeek":""
	},
	create: function() {
		if(!localStorage.count_w){
			localStorage.setItem('count_w', '0');
		}
		this.inherited(arguments);
		var currentRow,
			dateObj = new Date();
		
		this.setYear = dateObj.getFullYear();
		this.setWeek = this.getWeekNumber(this.setYear, dateObj.getMonth(), dateObj.getDate());

		var currentDate = dateObj.getDate();
		var dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var dayOffset = dateObj.getDay();
		var sundayDate = currentDate - dayOffset;
		
		for( var i = 0; i < 7; i++){
			if(i %7 == 0){
				currentRow = this.$.weekTable.createComponent({});
			}
			
			if(sundayDate < 1){
				sundayDate += this.getDaysInMonth(dateObj.getMonth()-1, dateObj.getYear());
			}
			if(sundayDate + i > this.getDaysInMonth(dateObj.getMonth(), dateObj.getYear())){
				sundayDate -= this.getDaysInMonth(dateObj.getMonth(), dateObj.getYear());
			}
			var cellDay = {content : dayName[i] + " / " + (sundayDate + i)};
			cellDay = enyo.mixin(cellDay, {classes: "header"});
			if (((dateObj.getHours() > 4)? (sundayDate+i == currentDate): (sundayDate+i == currentDate - 1))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
				cellDay = enyo.mixin(cellDay, {classes: "current"});
			}
			currentRow.createComponent(cellDay);
		}
		for (var i = 0; i < 24; i++){
			currentRow = this.$.weekTable.createComponent({});
			for(var j = 0; j < 7 ; j++){
				var cellTime = new functionCell_W();
				cellTime.number = ((i<19)?i:(i-24)) + 5;
				cellTime.year = this.setYear;
				cellTime.week = this.setWeek;
				cellTime.day = j;
				if((((i<19)?i:(i-24)) + 5) == dateObj.getHours() && ((i<19)?(j == dateObj.getDay()):(j == (dateObj.getDay()-1)))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
					cellTime = enyo.mixin(cellTime, {classes: "currentTime"})
				}
				currentRow.createComponent(cellTime);
			}
		}

		this.$.weekNumber.setContent(this.setYear + "년 " + this.setWeek + "주");
	},
	// adapted from http://stackoverflow.com/questions/1810984/number-of-days-in-any-month
	getDaysInMonth: function(m, y) {
		return (/8|3|5|10/).test(m)?30:m==1?((y%4===0)&&y%100)||(y%400===0)?29:28:31;
	},
	getWeekNumber: function(year, month, date){
	    d = new Date();
	    d.setHours(0,0,0);
	    d.setFullYear(year, month, date);
	    // Set to nearest Thursday: current date + 4 - current day number
	    // Make Sunday's day number 7
	    d.setDate(d.getDate() + 4 - (d.getDay()||7));
	    // Get first day of yearc
	    var yearStart = new Date(year,0,1);
	    // Calculate full weeks to nearest Thursday
	    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
	    // Return array of year and week number
	    if(yearStart.getDay() == 6){
	    	if((this.getDaysInMonth( 1,  year) == 29) && (month == 11) && (date == 31)){
	    		return weekNo +2;
	    	}
	    	return weekNo +1;
	    }
	    else{
	    	return weekNo;
	    }
	},

	leftTapped: function(inSender, inEvent){
		this.$.weekTable.destroyComponents();
		var currentRow,
			dateObj = new Date();

		// calculate current date
		var currentDate = dateObj.getDate();
		var dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		this.setWeek -= 1;
		if(this.setWeek < 1){
			var lastWeek = new Date();
			lastWeek.setFullYear((this.setYear-1), 11, 31);
			var lastWeekFirstDate = lastWeek.getDate() - lastWeek.getDay();
			firstWeek = new Date();
			firstWeek.setFullYear(this.setYear, 0, 1);
			var firstWeekFirstDate = firstWeek.getDate() - ((firstWeek.getDay() == 0)? firstWeek.getDay() : (firstWeek.getDay() - 31));
			if(lastWeekFirstDate == firstWeekFirstDate){
				this.setWeek = this.getWeekNumber(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate()) - 1;
			}
			else {
				this.setWeek = this.getWeekNumber(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate());
			}
			this.setYear -= 1;
		}
		var yearStart = new Date(this.setYear, 0, 1);
		var firstSunday = yearStart.getDate() - yearStart.getDay();
		if(firstSunday < 1 ){
			firstSunday += 31;
		}
		var sundayDate = firstSunday;
		var count = 12;
		for(var i = 1; i < this.setWeek ; i++){
			sundayDate += 7;
			if(sundayDate > this.getDaysInMonth(count%12, this.setYear)){
				sundayDate -= this.getDaysInMonth(count%12, this.setYear);
				count++;
			}
		}
		for( var i = 0; i < 7; i++){
			if(i %7 == 0){
				currentRow = this.$.weekTable.createComponent({});
			}
			
			if(sundayDate + i > this.getDaysInMonth(count, this.setYear)){
				sundayDate -= this.getDaysInMonth(count, this.setYear);
			}
			var cellDay = {content : dayName[i] + " / " + (sundayDate + i)};
			cellDay = enyo.mixin(cellDay, {classes: "header"});
			if (((dateObj.getHours() > 4)? (sundayDate+i == currentDate): (sundayDate+i == currentDate - 1))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
				cellDay = enyo.mixin(cellDay, {classes: "current"});
			}
			currentRow.createComponent(cellDay);
		}
		for (var i = 0; i < 24; i++){
			currentRow = this.$.weekTable.createComponent({});
			for(var j = 0; j < 7 ; j++){
				var cellTime = new functionCell_W();
				cellTime.number = ((i<19)?i:(i-24)) + 5;
				cellTime.year = this.setYear;
				cellTime.week = this.setWeek;
				cellTime.day = j;
				if((((i<19)?i:(i-24)) + 5) == dateObj.getHours() && ((i<19)?(j == dateObj.getDay()):(j == (dateObj.getDay()-1)))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
					cellTime = enyo.mixin(cellTime, {classes: "currentTime"})
				}
				currentRow.createComponent(cellTime);
			}
		}
		

		this.$.weekNumber.setContent(this.setYear + "년 " + this.setWeek + "주");
		this.$.weekTable.render();
	},

	rightTapped: function(inSender, inEvent){
		this.$.weekTable.destroyComponents();
		var currentRow,
			dateObj = new Date();

		// calculate current date
		var currentDate = dateObj.getDate();
		var dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		this.setWeek += 1;
		if(this.setWeek == 53){
			var yearStart = new Date(this.setYear, 0, 1);
			var firstSunday = yearStart.getDate() - yearStart.getDay();
			if(firstSunday < 1 ){
				firstSunday += 31;
			}
			var sundayDate = firstSunday;
			var count = 12;
			for(var i = 1; i < this.setWeek ; i++){
				sundayDate += 7;
				if(sundayDate > this.getDaysInMonth(count%12, this.setYear)){
					sundayDate -= this.getDaysInMonth(count%12, this.setYear);
					count++;
				}
			}
			firstWeek = new Date();
			firstWeek.setFullYear((this.setYear+1), 0, 1);
			var firstWeekFirstDate = firstWeek.getDate() - ((firstWeek.getDay() == 0)? firstWeek.getDay() : (firstWeek.getDay() - 31));
			if(sundayDate == firstWeekFirstDate){
				this.setWeek = 1;
				this.setYear += 1;
			}
		}
		else if(this.setWeek == 54){
			this.setWeek = 1;
			this.setYear += 1;
		}
		var yearStart = new Date(this.setYear, 0, 1);
		var firstSunday = yearStart.getDate() - yearStart.getDay();
		if(firstSunday < 1 ){
			firstSunday += 31;
		}
		var sundayDate = firstSunday;
		var count = 12;
		for(var i = 1; i < this.setWeek ; i++){
			sundayDate += 7;
			if(sundayDate > this.getDaysInMonth(count%12, this.setYear)){
				sundayDate -= this.getDaysInMonth(count%12, this.setYear);
				count++;
			}
		}
		for( var i = 0; i < 7; i++){
			if(i %7 == 0){
				currentRow = this.$.weekTable.createComponent({});
			}
			
			if(sundayDate + i > this.getDaysInMonth(count, this.setYear)){
				sundayDate -= this.getDaysInMonth(count, this.setYear);
			}
			var cellDay = {content : dayName[i] + " / " + (sundayDate + i)};
			cellDay = enyo.mixin(cellDay, {classes: "header"});
			if (((dateObj.getHours() > 4)? (sundayDate+i == currentDate): (sundayDate+i == currentDate - 1))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
				cellDay = enyo.mixin(cellDay, {classes: "current"});
			}
			currentRow.createComponent(cellDay);
		}
		for (var i = 0; i < 24; i++){
			currentRow = this.$.weekTable.createComponent({});
			for(var j = 0; j < 7 ; j++){
				var cellTime = new functionCell_W();
				cellTime.number = ((i<19)?i:(i-24)) + 5;
				cellTime.year = this.setYear;
				cellTime.week = this.setWeek;
				cellTime.day = j;
				if((((i<19)?i:(i-24)) + 5) == dateObj.getHours() && ((i<19)?(j == dateObj.getDay()):(j == (dateObj.getDay()-1)))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
					cellTime = enyo.mixin(cellTime, {classes: "currentTime"})
				}
				currentRow.createComponent(cellTime);
			}
		}
		

		this.$.weekNumber.setContent(this.setYear + "   년  " + this.setWeek + "    주");
		this.$.weekTable.render();
	},

	weekTapped: function(inSender, inEvent){
		this.$.popupInput.show();
	},

	closePopup: function(inSender, inEvent){
		this.$.popupInput.hide();
	},

	closeMessagePopup: function(inSender, inEvent){
		this.$.showMessage.hide();
	},
		
	popupShown: function() {
		this.$.yearInput.focus();
	},

	isInt: function(value){
		return typeof(value) === 'number' && value % 1 == 0;
	},
	
	ApplyYearWeek: function(inSender, inEvent){
		var yearInputValue = parseFloat(this.$.yearInput.getValue());
		var weekInputValue = parseFloat(this.$.weekInput.getValue());
		if(this.$.yearInput.getValue() == ""){
				this.$.popupContents.setContent("please input Year value!");
				this.$.showMessage.show();
				return;
		}
		if(this.$.weekInput.getValue() == ""){
				this.$.popupContents.setContent("please input Week value!");
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
		if(this.isInt(weekInputValue) == false){
			this.$.popupContents.setContent("Invalid Week value! <br/> please input integer value");
			this.$.showMessage.show();
			return;	
		}
		else if(weekInputValue < 1 || weekInputValue > this.getWeekNumber(this.setYear, 11, 31)){
			this.$.popupContents.setContent("Invalid Week value! <br/> please input value between 1 ~ " + this.getWeekNumber(this.setYear, 11, 31));
			this.$.showMessage.show();
			return;	
		}
		this.setWeek = weekInputValue; 
		this.$.yearInput.clear();
		this.$.weekInput.clear();
		this.$.popupInput.hide();
		this.$.weekTable.destroyComponents();
		var currentRow,
			dateObj = new Date();

		// calculate current date
		var currentDate = dateObj.getDate();
		var dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var yearStart = new Date(this.setYear, 0, 1);
		var firstSunday = yearStart.getDate() - yearStart.getDay();
		if(firstSunday < 1 ){
			firstSunday += 31;
		}
		var sundayDate = firstSunday;
		var count = 12;
		for(var i = 1; i < this.setWeek ; i++){
			sundayDate += 7;
			if(sundayDate > this.getDaysInMonth(count%12, this.setYear)){
				sundayDate -= this.getDaysInMonth(count%12, this.setYear);
				count++;
			}
		}
		for( var i = 0; i < 7; i++){
			if(i %7 == 0){
				currentRow = this.$.weekTable.createComponent({});
			}
			
			if(sundayDate + i > this.getDaysInMonth(count, this.setYear)){
				sundayDate -= this.getDaysInMonth(count, this.setYear);
			}
			var cellDay = {content : dayName[i] + " / " + (sundayDate + i)};
			cellDay = enyo.mixin(cellDay, {classes: "header"});
			if (((dateObj.getHours() > 4)? (sundayDate+i == currentDate): (sundayDate+i == currentDate - 1))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
				cellDay = enyo.mixin(cellDay, {classes: "current"});
			}
			currentRow.createComponent(cellDay);
		}
		for (var i = 0; i < 24; i++){
			currentRow = this.$.weekTable.createComponent({});
			for(var j = 0; j < 7 ; j++){
				var cellTime = new functionCell_W();
				cellTime.number = ((i<19)?i:(i-24)) + 5;
				cellTime.year = this.setYear;
				cellTime.week = this.setWeek;
				cellTime.day = j;
				if((((i<19)?i:(i-24)) + 5) == dateObj.getHours() && ((i<19)?(j == dateObj.getDay()):(j == (dateObj.getDay()-1)))&& (this.setYear == dateObj.getFullYear()) && (this.setWeek == this.getWeekNumber(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))){
					cellTime = enyo.mixin(cellTime, {classes: "currentTime"})
				}
				currentRow.createComponent(cellTime);
			}
		}
		

		this.$.weekNumber.setContent(this.setYear + "   년  " + this.setWeek + "    주");
		this.$.weekTable.render();
	},

	enterDetected: function(inSender, inEvent){
		if(inEvent.keyCode == 13){
			this.ApplyYearWeek();
		}
	},

	closeMessagePopup2: function(inSender,inEvent){
		if(inEvent.keyCode == 13){
			this.closeMessagePopup();
		}
	}
});

enyo.kind({
	name:"functionCell_W",
	kind:"enyo.TableCell",
	components:[
		{name: "cellContent", popup:"scheduleInput", popup:"scheduleShow", content:"", style:"display:inline"},
		{name:"scheduleInput", kind: "onyx.Popup", centered: true, modal: true, floating: true, onShow: "", components:[
			{content: "제목", style: "position: relative; top: 5px; margin: 5px; font-weight: bold; font-size: 18px; display: inline"},
			{name: "subjectInput", kind: "onyx.Input", placeholder: "Type subject here", classes:"Typing", style: "margin: 10px", onkeypress:""},
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
		{name: "scheduleImage", kind:"enyo.Image", src:"assets/dot.png", active: false, style:"float: right; height: 10px; width: 10px;"},
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
		week: "",
		day: ""
	},
	handlers:{
		ontap:"cellTap",
		onleave: "cellDeactive"
	},
	create: function(){
		this.inherited(arguments);
		this.$.cellContent.setContent(this.number);

		for(var i = 1 ; i < parseInt(localStorage.count_w)+1 ; i++){
			if((localStorage.getItem(i.toString()+'w')) != null){
				var Obj = {};
				Obj = JSON.parse(localStorage.getItem(i.toString()+'w'));
				if(Obj.year == this.year && Obj.week == this.week && Obj.day == this.day && Obj.hours == this.number){
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
		newSchedule.setContent(time + "시에 " + place + "에서 " + subject +"이(가) 있습니다.");
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
			if(this.getClassAttribute() == "currentTime"){
				this.applyStyle("background-color", "#226B9A");
			}
		}
	},
	closePopup: function(inSender, inEvent){
		this.$.scheduleInput.hide();
	},

	applySchedule: function(inSender, inEvent){
		var subject = this.$.subjectInput.getValue();
		var time = this.$.cellContent.getContent();
		var place = this.$.placeInput.getValue();
		this.$.subjectInput.clear();
		this.$.placeInput.clear();

		var newSchedule = new scheduleThing();
		newSchedule.setContent(time + "시에 " + place + "에서 " + subject +"이(가) 있습니다.");
		var count_w = parseInt(localStorage.count_w);
		count_w++;
		localStorage.setItem('count_w', count_w);
		var Obj_w = [];
		Obj_w[count_w] = {year: this.year, week: this.week, day: this.day, hours: this.number, subject: subject, time: time, place: place };
		localStorage.setItem(count_w.toString() + 'w', JSON.stringify(Obj_w[count_w]));
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