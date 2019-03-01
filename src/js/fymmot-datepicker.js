
/*
Rolling tabindex datepicker 
*/

(function(factory){
	if (typeof define === "function" && define.amd) {
		define(["jquery"], factory);
	} else if (typeof exports === 'object') {
		factory(require('jquery'));
	} else {
		if (typeof jQuery === 'undefined') {
			throw new Error('Datepicker\'s JavaScript requires jQuery')
		}
		factory(jQuery);
	}
}(function($, undefined){
	'use strict';
	var that;

	var Patedicker = function (target, options) {
		that = this;
		this.$target = $(target);
		this.options = options;


		this.keys = {
			tab: 9,
			enter: 13,
			esc: 27,
			space: 32,
			pageup: 33,
			pagedown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};

		this.$calendar;
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        this.daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.initialDate = this.$target.attr("value");
        this.$datePickerGrid;
		this.calendarDates = [];
		this.ALL_ACTIVE_DATEPICKER_DAYS;
		this.current_cell;


		//Initialize calendar
		this.updateCalendar(this.initialDate);

	}

	Patedicker.prototype.generateButton = function(){
		var btn = $("<button class='btn'>Test</button>");

		this.$target.after(btn);

		btn.click(function(){
			that.$calendar.toggleClass("hidden");
		});
	}


	Patedicker.prototype.generateDays = function(startDate){

		/**
		 * Extend Date object with Helper function to check if the date is today or not. Returns a boolean
		 */

		Date.prototype.isToday = function(){
			var d = new Date();
			var bool = (d.toDateString() === this.toDateString());
			return bool;
		}

		Date.prototype.lastDayInMonth = function(){
			var d = new Date(this.getTime());
			d.setDate(this.monthDays());
			return d;
		}
		/**
		 * Extend Date object with Helper function to check if a date has already passed or not. Returns a boolean.
		 */
		Date.prototype.dayHasPassed = function(){
			var now = new Date();
			now.setHours(0,0,0,0);
		  	if (this < now) {
		    	return true;
	    	} else {
		    	return false;
		  	}
		}
		/**
		 * Extend Date object with Helper function to get number of days in the month
		 */
		Date.prototype.monthDays = function(){
		    var d= new Date(this.getFullYear(), this.getMonth()+1, 0);
		    return d.getDate();
		}

		/**
		 * Extend Date object with Helper function to determine the first weekday of a given month
		 */
		Date.prototype.firstWeekday = function(){
			var d= new Date(this.getFullYear(), this.getMonth(), 1);
		    return d.getDay();
		}
		//Clear calendardayes
		if (this.calendarDates.length > 0){
			this.calendarDates = [];
		}

		// If a start date was provided
		if (startDate) 
			var da = new Date(startDate)
		
		//Otherwise use today
		else {
			console.log("No start date provided")
			return;
		}


		//Create a list of day objects
	    for (var i = 0; i<da.monthDays(); i++){
	    	var weekday_check = ((i+da.firstWeekday())%7);
	    	var monthString = da.getMonth()+1+"";
	    	var dayString = i+1+"";

	    	//Add inital 0 in day and month number
	    	monthString = monthString.padStart(2,'0');
	    	dayString = dayString.padStart(2,'0');

	    	//Special case for sunday
	    	if (weekday_check == 0) 
	    		weekday_check = 7;

	    	//Build Days object
	    	var d = {
	    		weekday: weekday_check,
	    		day: dayString,
	    		month: monthString,
	    		year: da.getFullYear()
	    	}
	    	this.calendarDates.push(d);
	    }
	    return this.calendarDates;
	    
	}
	Patedicker.prototype.generateCalendarTable = function(){
		this.$calendar = $('<table id="datepicker_table" role="application" aria-label="Choose date"><thead role="presentation"></thead><tbody role="presentation"></tbody></table>');

		$('#datepicker_wrapper').append(this.$calendar);
		this.$datePickerGrid = this.$calendar.find('tbody');
	}

	Patedicker.prototype.generateCalendarHeader = function(){
		//Generate Month buttons and heading
		var calendarHeaderNav = $('<div class="month-nav__wrapper"><button class="btn month-nav__sides left">Previous<span class="visually-hidden"> month</span></button><h3 id="month-label" aria-live="assertive" class="">' + this.months[+this.calendarDates[0].month-1] + ' ' + this.calendarDates[0].year + '</h3> <button class="btn month-nav__sides right">Next<span class="visually-hidden"> month</span></button> </div>');
		$('#datepicker_wrapper').prepend(calendarHeaderNav);

		//Generate table headings with weekdays
		var headerRow = "";

		for (var i = 0; i<this.days.length; i++){
			var myHeaderDay = '<th scope="col" role="presentation"><abbr aria-hidden="true" title="' + this.days[i] + '">' + this.daysShort[i] + '</abbr></th>';
			headerRow += myHeaderDay;
		}
		headerRow = $('<tr role="presentation">' + headerRow + '</tr>');
		this.$calendar.find('thead').append(headerRow);
	}

	Patedicker.prototype.generateKeyboardHelp = function(){
		var idvalues = {
			dialogID: 'keyboard_shortcuts_modal',
			openID: 'open-keyboard-shortcuts',
			closeID: 'closeKbdModal'
		}

		var $keyboard_shortcuts = $('<div class="keyboard-shortcuts-link"><button id="open-keyboard-shortcuts">Show keyboard shortcuts</button></div>');
		$("#datepicker_wrapper").find(".month-nav__wrapper").after($keyboard_shortcuts);

		var modalContent = '<h3 id="kbd_modal_heading" tabindex="0">Keyboard shortcuts</h3><ul><li><p><kbd>LEFT</kbd>/ <kbd>RIGHT</kbd> to change day.</p></li><li><p><kbd>UP</kbd>/ <kbd>DOWN</kbd> to change week.</p></li><li><p><kbd>HOME</kbd> to move to the first day of the month.</p></li><li><p><kbd>END</kbd> to move to the last day of the month.</p></li><li><p><kbd>PAGE UP</kbd> to move to the same day in the previous month.</p></li><li><p><kbd>PAGE DOWN</kbd> to move to the same day in the next month.</p></li><li><p><kbd>SPACE</kbd> to select a date.</p></li></ul>'

		var $kbd_modal = $(
			'<div id="keyboard_shortcuts_modal" hidden role="dialog" aria-modal="false" aria-labelledby="kbd_modal_heading"><div class="keyboard_modal__inner"> '+ modalContent + '<button id="closeKbdModal" class="btn">OK!</button></div></div>');

		//Add keyboard modal to dom
		$("#datepicker_wrapper").prepend($kbd_modal);

		initializeKeyboardModal(idvalues.openID, idvalues.dialogID, idvalues.closeID);
	}

	Patedicker.prototype.updateCalendar = function(newDate){
		//Check if a startdate has been provided
		var date;
		if (newDate.length){
			date = newDate;
		}
		//Otherwise use today
		else {
			date = new Date().toISOString().slice(0,10);
		}
		this.clearCalendar();
		this.$target.attr("value", date);
		this.setUpCalendar(date);
	}

	Patedicker.prototype.setUpCalendar = function(startDate){

    	$("#datepicker_table").remove();

    	//Generate an array of days for the specified month
    	var da;
    	var daString;
    	
    	if (startDate){
    		da = new Date(startDate)
    
    	}
    	else
    		da = new Date();
    	
    	
    	da.setHours(12);
    	daString = da.toISOString().slice(0,10);
    	this.generateDays(daString);

    	//Always clear the calendar of old content
    	this.generateCalendarTable();
    	this.generateCalendarHeader();
    	this.generateKeyboardHelp();

    	// Hide the <input>
    	if (this.options.popup){
    		this.generateButton();
    	}
    	else {
    		$("#input_wrapper").addClass("hidden");
    	}

		//Populate cells    	
    	var x = 0;
    	for (var i = 0; i<6; i++){

    		//Add rows
    		var $row = $('<tr role="presentation"></tr>');
			this.$datePickerGrid.append($row);
			
			var y = x;
			//Add empty cells in the first row, until the weekday matches
			for (var j = 0; j<this.days.length; j++){
				if (i==0){
					if (j+1 == this.calendarDates[0].weekday){
						break;
					} else {
						var $td = $('<td class="disabled" role="presentation"></td>');
						$row.append($td);
					}
				} 
			}
			//Add cells to each of the rows. One cell for each day in the calendarDates array.
			for (y; $row.children().length<7; y++){

				//Check if we've reached the last day
				if (y >= this.calendarDates.length){ 
					// Break on a Sunday
					if (this.calendarDates[y%7].weekday == 1){
						break;
					}
					// Otherwise fill the row with empty cells
					else {
						var $td = $('<td class="disabled" role="presentation"></td>');
						$row.append($td);
					}

				//Fill calendar with days
				} else{
					var $td = $('<td></td>');

					$td
						.attr("role", "button")
						.attr("tabindex", "-1")
						.attr("data-weekday", this.calendarDates[y].weekday)
						.attr("data-day", this.calendarDates[y].day)
						.attr("data-month", this.calendarDates[y].month)
						.attr("data-year", this.calendarDates[y].year)
						.html(+this.calendarDates[y].day);

						//Check if date is in the past
						if (new Date('' + this.calendarDates[y].year + '-' + this.calendarDates[y].month + '-' + this.calendarDates[y].day + '').dayHasPassed()){
							$td.addClass("disabled").attr('aria-disabled', true);
						}

					this.setAriaLabel($td);

					
					$row.append($td);
				}	
			}
			//Iterate
			x = x+(y-x);
    	}
    	//Generate a11y demo div, if not already present

    	if (this.options.demo && !$("#a11y_demo").length){
    		this.generateA11yDemo();
    	}

    	//Populate the list of active datepicker buttons
    	this.ALL_ACTIVE_DATEPICKER_DAYS = $('table#datepicker_table > tbody > tr > td').not('.disabled');

    	//Set first day as tabbable
    	var firstDay = this.ALL_ACTIVE_DATEPICKER_DAYS.first();
		firstDay.attr("tabindex", "0");
		
		//Make the calendar interactive!
		//console.log(that);
	    this.registerClickListeners();
	    this.registerKeyListeners();
    }
	/**
	 * Register mouse listeners for each cell in the table
	 */
	Patedicker.prototype.registerClickListeners = function(){

		var listenerTarget = this.$calendar;

		$(".btn.month-nav__sides.right").click(function(){
			that.incrementMonth(undefined, 1);
			$(".btn.month-nav__sides.right").focus();
		})

		$(".btn.month-nav__sides.left").click(function(){
			that.incrementMonth(undefined, -1);
			$(".btn.month-nav__sides.left").focus();
		})

		$('td.disabled').mousedown(function(){
			event.preventDefault();
		});

		this.ALL_ACTIVE_DATEPICKER_DAYS.click(function(){		
			//Remove active states and set negative tabindex to all elements
			that.cleanup();
			//Set it as selected
			that.setSelected($(this));
		});
	
	}

	Patedicker.prototype.registerKeyListeners = function(){

		this.$calendar.keydown(function( event ) {

			//Find the cell currently in focus
			this.current_cell = $(":focus");

			//Listen for keystrokes
			switch (event.which){

				case that.keys.right:
					event.preventDefault();
					//alert("Right key!")
					that.incrementDay(this.current_cell, 1);
			   		break;

			   	case that.keys.left:
					event.preventDefault();
					that.incrementDay(this.current_cell, -1);
			   		break;

			   	case that.keys.up:
					event.preventDefault();
					that.incrementWeek(this.current_cell, -1);
					break;

			   	case that.keys.down:
					event.preventDefault();
					that.incrementWeek(this.current_cell, 1);
			   		break;

			   	//Select cell with spacebar or return key
			   	case that.keys.space:
					event.preventDefault();
					that.setSelected(this.current_cell);
					break;

				case that.keys.enter:
					event.preventDefault();
					that.setSelected(this.current_cell);
					break;

				case that.keys.home:
					event.preventDefault();
					that.firstDayInMonth();
					break;

				case that.keys.end:
					event.preventDefault();
					that.lastDayInMonth();
					break;

				case that.keys.pageup:
					event.preventDefault();
					that.incrementMonth(this.current_cell, -1);
					break;

				case that.keys.pagedown:
					event.preventDefault();
					that.incrementMonth(this.current_cell, 1);
					break;
				
			}
		});
		
		/**
		 * Manage tabindex for when the user leaves the table
		 */
		this.$calendar.focusout(function(){
			
			//Reset tabindices
			that.cleanup();
			// Make the selected date focusable 
			if (that.ALL_ACTIVE_DATEPICKER_DAYS.hasClass("active")){
				$(".active").attr("tabindex", "0");
			}
			//If nothing is selected, make the first day focusable
			else {
				that.ALL_ACTIVE_DATEPICKER_DAYS.first().attr("tabindex", "0");
			}
		});
	}

    Patedicker.prototype.setAriaLabel = function(cell){
    	var isActive = (cell.hasClass("active"));
    	
    	var label = this.days[cell.attr("data-weekday")-1] +" "+ (cell.attr("data-day")) +" "+ this.months[(cell.attr("data-month"))-1] + " " + cell.attr("data-year");
    	
    	var isToday = new Date('' + cell.attr("data-year") + ' ' + cell.attr("data-month") + ' ' + cell.attr("data-day") + '').isToday();

    
    	if (isToday){
    		label = "Today " + label;
    	}

    	if (isActive){
    		label = "Selected date. " + label;
    	}
    	else {
    		label = label;
    	}
		return cell.attr("aria-label", label);
    }

	/**
	 * Go to next or previous day
	 */
	Patedicker.prototype.incrementDay = function(cell, delta){
		var a = this.ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		
		var nextElement;

		//If at the last day in month and moving forward
		if (delta == 1 && a.index(cell) >= a.length-1){
			return this.incrementMonth(cell, delta);

		} 
		//If at the first day in month and moving backwards
		else if (delta == -1 && a.index(cell) == 0) {
			return this.incrementMonth(cell, delta);
		}

		//Otherwise move focu one step
		else{
			var nextElement = $(a[idx + delta]);
			nextElement.focus();
			if (this.options.demo)
				this.updateA11yDemo(nextElement, false);
			return nextElement;
		}
	}
	

	Patedicker.prototype.incrementWeek = function(cell, delta){
		var a = this.ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		var weekday = cell.attr('data-weekday');
		var myDate = new Date(this.$target.attr("value"));


		//Check if the move is possible, else return
		if ($(a[idx + delta*7]).length)
			var nextElement = $(a[idx + delta*7]);

		//If moving into the next month
		else if (idx+(delta*7) >= a.length){
			this.incrementMonth(cell, 1);
			a = this.ALL_ACTIVE_DATEPICKER_DAYS;
			var nextElement = a.filter("[data-weekday='" + weekday + "']").first();
		}
		//If moving into the previous month
		else if (idx+(delta*7) < a.length){
			//Check if the move is possible
			myDate.setMonth(myDate.getMonth()+delta);
			if (myDate.lastDayInMonth().dayHasPassed()){
				return;
			}
			this.incrementMonth(cell, -1);
			a = this.ALL_ACTIVE_DATEPICKER_DAYS;
			var nextElement = a.filter("[data-weekday='" + weekday + "']").last();
		}


		nextElement
			.focus();

		if (this.options.demo)
			this.updateA11yDemo(nextElement, false);

		return nextElement;

	}

	Patedicker.prototype.incrementMonth = function(cell, delta){

		var newDay;
		var myDate = new Date(this.$target.attr("value"));
		myDate.setHours(12);

		myDate.setMonth(myDate.getMonth()+delta);


		//If no cell provided
		if (cell == undefined){
			console.log("cell is undefined")
			this.updateCalendar(myDate.toISOString().slice(0,10));
			if (this.options.demo)
				this.clearA11yDemo();
			return;
		}

		switch (delta){
			case -1:
				//Stop if the previous month is non-selectable
				if (myDate.lastDayInMonth().dayHasPassed()){
					return;
				}
				//If the origin cell is the first in month, set focus to the last in previous month
				this.updateCalendar(myDate.toISOString().slice(0,10));
				
				newDay = this.ALL_ACTIVE_DATEPICKER_DAYS.last();
				
				if (this.options.demo)
					this.updateA11yDemo(newDay);
				return newDay.focus();
			case 1:
				//If the origin cell is the last in month, set focus to the first in previous month
				this.updateCalendar(myDate.toISOString().slice(0,10));
				
				newDay = this.ALL_ACTIVE_DATEPICKER_DAYS.first();

				if (this.options.demo)
					this.updateA11yDemo(newDay);

				return newDay.focus();
		}

	}
	Patedicker.prototype.firstDayInMonth = function(){
		var a = this.ALL_ACTIVE_DATEPICKER_DAYS;
		return a.first().focus();
	}

	Patedicker.prototype.lastDayInMonth = function(){
		var a = this.ALL_ACTIVE_DATEPICKER_DAYS;
		return a.last().focus();
	}

	/**
	 * Mark the provided cell as active in the calendar and update relevant 
	 * aria attributes and classes.
	 * @param {[type]} cell The new cell to be made active
	 */

	Patedicker.prototype.setSelected = function(cell){
		var $currently_active = $(".active");
		var $newActiveCell = cell;
		//Clean up previously selected cell
		$currently_active.removeClass("active").attr('tabindex', -1).removeAttr("aria-pressed");
		this.setAriaLabel($currently_active);

		//Update the new active cell
		$newActiveCell
			.addClass("active")
			.attr("tabindex", "0")
			.attr("aria-pressed", true)

		this.setAriaLabel($newActiveCell);
		if (this.options.demo)
			this.updateA11yDemo($newActiveCell, false);

		//Update the input field value with the selected day
		this.$target.attr("value", ""+$newActiveCell.attr("data-year")+"-"+$newActiveCell.attr("data-month")+"-"+$newActiveCell.attr("data-day"));

		return $newActiveCell;
	}


    /**
     * Clear calendar
     */
    Patedicker.prototype.clearCalendar = function(){
    	$("#datepicker_wrapper").empty();
    }


	Patedicker.prototype.cleanup = function (){
		return this.ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
	}


	Patedicker.prototype.generateA11yDemo = function(){
		var ad = $('<div id="a11y_demo"><h3 style="font-size:1rem; font-weight:400;">Text read by screen reader <strong>(demo only)</strong></h3><div id="screen-reader-text">Text will be displayed here when you interact with the calender </div></div>');
		$("#datepicker_wrapper").after(ad);

		this.$calendar.focusin(function(){
			var focusedcell = $(":focus");
			that.updateA11yDemo(focusedcell);
		});


		this.$calendar.focusout(function(){
			that.clearA11yDemo();
		});
	}
	
	Patedicker.prototype.clearA11yDemo = function(){
		$("#screen-reader-text")
			.html("Text will be displayed here when you interact with the calender")
			.removeClass("focused selected");
	}

	/**
	 * Update the visible screen reader demo text with info from the given cell
	 * @param  {[type]} cell 
	 */
	Patedicker.prototype.updateA11yDemo = function(cell){
		if (cell.hasClass("active"))
			var a11ySpan = $("#screen-reader-text").addClass("focused selected");
		else
			var a11ySpan = $("#screen-reader-text").addClass("focused");


		var label = cell.attr("aria-label");
		var role = cell.attr('role');
		var pressed = cell.attr('aria-pressed') ? ', pressed' : '';
		return a11ySpan.html( label +", "+ role + pressed);

	}




	// DATEPICKER PLUGIN DEFINITION
	// ==========================

	var old = $.fn.datepicker

	$.fn.patedicker = function (options, value) {
				var $this   = $(this);
				var data    = $this.data('a11y.datepicker');
				if (!data){ 
					$this.data('a11y.datepicker', (data = new Patedicker(this, options)));
				}
	}

	$.fn.patedicker.Constructor = Patedicker

	// DATEPICKER NO CONFLICT
	// ====================

	$.fn.patedicker.noConflict = function () {
		$.fn.datepicker = old
		return this
	}


}
));







