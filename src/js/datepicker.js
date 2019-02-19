
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){


	var $calendar,
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        /*HELPTEXT = 'Use the left and right arrow keys to browse days. Up and down arrows move between weeks. Select a day using return key or spacebar.',*/
        HELPTEXT = '',
        dateInput = $("#date"),
        initialDate;

    
    var $datePickerGrid;
	var calendarDates = [];
	var ALL_ACTIVE_DATEPICKER_DAYS;

	var RIGHT_KEY = 39;
	var LEFT_KEY = 37;
	var UP_KEY = 38;
	var DOWN_KEY = 40;
	var SPACE_KEY = 32;
	var RETURN_KEY = 13;
	var HOME_KEY = 36;
	var END_KEY = 35;
	var PAGEUP_KEY = 33;
	var PAGEDOWN_KEY = 34;

	var current_cell;


	/**
	 * Function to generate a list of date objects containing weekday, day, month and year
	 * @param  {[type]} startDate Starting date in YYYY-MM-DD format (optional)
	 */
	function generateDays(startDate){

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
			console.log(d);
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

		if (calendarDates.length > 0){
			calendarDates = [];
		}

		// If a start date was provided
		if (startDate) {
			var da = new Date(startDate);

		}
		//Otherwise use today
		else {var da = new Date();}


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
	    	calendarDates.push(d);
	    }
	    return calendarDates;
	}

	function generateCalendarTable(){
		$calendar = $('<table id="datepicker_table" role="application" aria-label="Choose date"><thead role="presentation"></thead><tbody role="presentation"></tbody></table>');

		$('#datepicker_wrapper').append($calendar);
		$datePickerGrid = $calendar.find('tbody');
	}

	function generateCalendarHeader(){

		//Generate Month buttons and heading
		
		var fieldset = $('<fieldset class="month-nav__wrapper"><legend class="visually-hidden">Choose month</legend><button class="btn month-nav__sides left">Previous</button><h3 id="month-label" class="">' + months[+calendarDates[0].month-1] + ' ' + calendarDates[0].year + '</h3> <button class="btn month-nav__sides right">Next</button> </fieldset>');

		$('#datepicker_wrapper').prepend(fieldset);

		//Generate table headings with weekdays
		var headerRow = "";

		for (i = 0; i<days.length; i++){
			var myHeaderDay = '<th scope="col" role="presentation"><abbr aria-hidden="true" title="' + days[i] + '">' + daysShort[i] + '</abbr></th>';
			headerRow += myHeaderDay;
		}
		headerRow = $('<tr role="presentation">' + headerRow + '</tr>');
		$calendar.find('thead').append(headerRow);
	}

	function generateA11yHelp(){
		var ah = $('<p class="visually-hidden" id="a11y_description">' + HELPTEXT + '</p>');
		$("#datepicker_wrapper").append(ah);

	}

	function generateKeyboardHelp(){
		var idvalues = {
			dialogID: 'keyboard_shortcuts_modal',
			openID: 'open-keyboard-shortcuts',
			closeID: 'closeKbdModal'
		}

		var $keyboard_shortcuts = $('<div class="keyboard-shortcuts-link"><button id="open-keyboard-shortcuts">Show keyboard shortcuts</button></div>');
		$("#datepicker_wrapper").find(".month-nav__wrapper").after($keyboard_shortcuts);

		var modalContent = '<h3 id="kbd_modal_heading" tabindex="0">Keyboard shortcuts</h3><ul><li><p><kbd>LEFT</kbd>/ <kbd>RIGHT</kbd> to move day to day.</p></li><li><p><kbd>UP</kbd>/ <kbd>DOWN</kbd> to move week to week.</p></li><li><p><kbd>HOME</kbd> to move to the first day of the month.</p></li><li><p><kbd>END</kbd> to move to the last day of the month.</p></li><li><p><kbd>PAGE UP</kbd> to move to the same day in the previous month.</p></li><li><p><kbd>PAGE DOWN</kbd> to move to the same day in the next month.</p></li><li><p><kbd>SPACE</kbd> to select a date.</p></li></ul>'

		var $kbd_modal = $(
			'<div id="keyboard_shortcuts_modal" hidden role="dialog" aria-modal="false" aria-labelledby="kbd_modal_heading"><div class="keyboard_modal__inner"> '+ modalContent + '<button id="closeKbdModal" class="btn">OK!</button></div></div>');

		//Add keyboard modal to dom
		$("#datepicker_wrapper").prepend($kbd_modal);

		initializeKeyboardModal(idvalues.openID, idvalues.dialogID, idvalues.closeID);
	}

	function updateCalendar(newDate){
		clearCalendar();
		setUpCalendar(newDate);
		dateInput.attr("value", newDate);
	}


    function setUpCalendar(startDate){

    	// Hide the <input>
    	$("#input_wrapper").addClass("hidden");

    	$("#datepicker_table").remove();

    	//Generate an array of days for the specified month
    	generateDays(startDate);

    	//Always clear the calendar of old content
    	generateCalendarTable();
    	generateCalendarHeader();
    	generateKeyboardHelp();


		//Populate cells    	
    	var x = 0;
    	for (var i = 0; i<6; i++){

    		//Add rows
    		var $row = $('<tr role="presentation"></tr>');
			$datePickerGrid.append($row);
			
			var y = x;
			//Add empty cells in the first row, until the weekday matches
			for (j = 0; j<days.length; j++){
				if (i==0){
					if (j+1 == calendarDates[0].weekday){
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
				if (y >= calendarDates.length){ 
					// Break on a Sunday
					if (calendarDates[y%7].weekday == 1){
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
						.attr("data-weekday", calendarDates[y].weekday)
						.attr("data-day", calendarDates[y].day)
						.attr("data-month", calendarDates[y].month)
						.attr("data-year", calendarDates[y].year)
						.html(+calendarDates[y].day);

						//Check if date is in the past
						if (new Date('' + calendarDates[y].year + '-' + calendarDates[y].month + '-' + calendarDates[y].day + '').dayHasPassed()){
							$td.addClass("disabled").attr('aria-disabled', true);
						}

					setAriaLabel($td);

					
					$row.append($td);
				}	
			}
			//Iterate
			x = x+(y-x);
    	}

    	if (!$("#a11y_demo").length){
    		generateA11yDemo();
    	}

    	//Generate list of active datepicker buttons
    	ALL_ACTIVE_DATEPICKER_DAYS = $('table#datepicker_table > tbody > tr > td').not('.disabled');

    	//Set first day as tabbable
    	var firstDay = ALL_ACTIVE_DATEPICKER_DAYS.first();
		firstDay.attr("tabindex", "0");
		
		//Make the calendar interactive!    	
	    registerClickListeners();
	    registerKeyListeners();
    }

    /**
     * Clear calendar
     */
    function clearCalendar(){
    	$("#datepicker_wrapper").empty();

    }

	/**
	 * Register mouse listeners for each cell in the table
	 */
	function registerClickListeners() {

		$(".btn.month-nav__sides.right").click(function(){
			nextMonth(null, true);
			console.log($("btn.month-nav__sides.right"));
			$(".btn.month-nav__sides.right").focus();
		})

		$(".btn.month-nav__sides.left").click(function(){
			previousMonth(null, true);
			$(".btn.month-nav__sides.left").focus();
		})

		$('td.disabled').mousedown(function(){
			event.preventDefault();
		});

		ALL_ACTIVE_DATEPICKER_DAYS.click(function(){		
			//Remove active states and set negative tabindex to all elements
			cleanup();

			//Set the clicked button as active
			//$(this).attr('tabindex', '0');

			//Set it as selected
			setSelected($(this));
		});
	
	}
	
	/**
	 * Register keypress listeners for the calendar
	 */
	function registerKeyListeners(){

		$calendar.keydown(function( event ) {

			//Find the cell currently in focus
			current_cell = $(":focus");

			//Listen for keystrokes
			switch (event.which){

				case RIGHT_KEY:
					event.preventDefault();
					nextDay(current_cell);
			   		break;

			   	case LEFT_KEY:
					event.preventDefault();
					previousDay(current_cell);
			   		break;

			   	case UP_KEY:
					event.preventDefault();
					previousWeek(current_cell);
					break;

			   	case DOWN_KEY:
					event.preventDefault();
					nextWeek(current_cell);
			   		break;

			   	//Select cell with spacebar or return key
			   	case SPACE_KEY:
					event.preventDefault();
					setSelected(current_cell);
					break;

				case RETURN_KEY:
					event.preventDefault();
					setSelected(current_cell);
					break;

				case HOME_KEY:
					event.preventDefault();
					firstDayInMonth();
					break;

				case END_KEY:
					event.preventDefault();
					lastDayInMonth();
					break;

				case PAGEUP_KEY:
					event.preventDefault();
					previousMonth(current_cell, false);
					break;

				case PAGEDOWN_KEY:
					event.preventDefault();
					nextMonth(current_cell, false);
					break;
			}
		});
		
		/**
		 * Manage tabindex for when the user leaves the table
		 */
		$calendar.focusout(function(){
			
			//Reset tabindices
			ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");

			// Make the selected date focusable 
			if (ALL_ACTIVE_DATEPICKER_DAYS.hasClass("active")){
				$(".active").attr("tabindex", "0");
			}
			//If nothing is selected, make the first day focusable
			else {
				ALL_ACTIVE_DATEPICKER_DAYS.first().attr("tabindex", "0");
			}

		});
	}

	/**
	 * Set and update the aria-label for a given cell
	 * @param {jQuery object} cell The given cell
	 */
    function setAriaLabel(cell){
    	var isActive = (cell.hasClass("active"));
    	var label = days[cell.attr("data-weekday")-1] +" "+ (+cell.attr("data-day")) +" "+ months[(cell.attr("data-month"))-1];
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
	 * Clean up buttons, reset tabindex
	 */
	function cleanup(){
		return ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
	}

	/**
	 * Go to next active date
	 */
	function nextDay(cell){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		
		var nextElement
		if (a.index(cell) >= a.length-1){
			return nextMonth(cell, false);

		} else 
			var nextElement = $(a[idx + 1]);

		cleanup();
		
		nextElement
			.focus();

		updateA11yDemo(nextElement, false);

		return nextElement;
	}
	/**
	 * Move to the previous non-disabled cell in the table
	 * @param  {[type]} cell The origin cell, as jQuery object
	 */
	function previousDay(cell){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		
		if (a.index(cell) == 0){
			previousMonth(cell, false);
		} else
			var nextElement = $(a[idx -1]);

		cleanup();

		nextElement
			.attr("tabindex", "0")
			//.attr("aria-describedby", "a11y_description")
			.focus();
		updateA11yDemo(nextElement, false);

		return nextElement;

	}
	/**
	 * Move to the next non-disabled cell in the table
	 * @param  {[type]} cell The origin cell, as jQuery object
	 */
	function nextWeek(cell){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);

		//Check if the move is possible, else return
		if ($(a[idx + 7]).length)
			var nextElement = $(a[idx + 7]);
		else return;
		
		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			//.attr("aria-describedby", "a11y_description")
			.focus();
		updateA11yDemo(nextElement, false);

		return nextElement;

	}
	/**
	 * Move one step up in the calendar
	 * @param  {[type]} cell The origin cell, as jQuery object
	 */
	function previousWeek(cell){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		
		//Check if the move is possible, else return
		if ($(a[idx - 7]).length)
			var nextElement = $(a[idx - 7]);
		else return;

		cleanup();
		
		nextElement
			.attr("tabindex", "0");
			//.attr("aria-describedby", "a11y_description")

		updateA11yDemo(nextElement, false);

		return nextElement.focus();

	}

	function nextMonth(cell, button){
		console.log(button);
		myDate = new Date(dateInput.attr("value"));
		var thisMonth = myDate.getMonth();
		var nextMonth = myDate.setMonth(thisMonth+1);


		myDate = myDate.toISOString().slice(0,10);

		updateCalendar(myDate);

		if (button == true){
			console.log("stannar");
			return;

		}

		else return ALL_ACTIVE_DATEPICKER_DAYS.first().focus();;
	}

	function previousMonth(cell, button){
		myDate = new Date(dateInput.attr("value"));
		myDate.setMonth(myDate.getMonth()-1);

		if (myDate.lastDayInMonth().dayHasPassed()){
			return;
		}

		updateCalendar(myDate.toISOString().slice(0,10));

		if (button){
			return;
		}

		else if (cell.attr("data-day") == "01"){
			return ALL_ACTIVE_DATEPICKER_DAYS.last().focus();
		}

		else return;




		/*var thisMonth = myDate.getMonth();

		var firstDay = myDate.setDay(1);



		if (myDate.dayHasPassed())
			return;

		myDate = myDate.toISOString().slice(0,10);

		updateCalendar(myDate);
		return ALL_ACTIVE_DATEPICKER_DAYS.first().focus();*/
	}




	function firstDayInMonth(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		console.log(a.first());

		return a.first().focus();
	}

	function lastDayInMonth(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		return a.last().focus();
	}

	/**
	 * Mark the provided cell as active in the calendar and update relevant 
	 * aria attributes and classes.
	 * @param {[type]} cell The new cell to be made active
	 */
	function setSelected(cell){
		var $currently_active = $(".active");
		var $newActiveCell = cell;
		//Clean up previously selected cell
		$currently_active.removeClass("active").attr('tabindex', -1);
		setAriaLabel($currently_active);

		//Update the new active cell
		$newActiveCell
			.addClass("active")
			.attr("tabindex", "0");

		setAriaLabel($newActiveCell);
		updateA11yDemo($newActiveCell, false);

		//Update the input field value with the selected day
		dateInput.attr("value", ""+$newActiveCell.attr("data-year")+"-"+$newActiveCell.attr("data-month")+"-"+$newActiveCell.attr("data-day"));

		return $newActiveCell;
	}

	//
	//
	//
	
	function generateA11yDemo(){
		var ad = $('<div id="a11y_demo"><h3 style="font-size:1rem; font-weight:400;">Text read by screen reader <strong>(demo only)</strong></h3><div id="screen-reader-text">Text will be displayed here when you interact with the calender </div></div>');
		$("#datepicker_wrapper").after(ad);

		$calendar.focusout(function(){
			clearA11yDemo();
		});
	}
	
	function clearA11yDemo(){
		$("#screen-reader-text")
			.html("Text will be displayed here when you interact with the calender")
			.removeClass("focused selected");

	}

	/**
	 * Update the visible screen reader demo text with info from the given cell
	 * @param  {[type]} cell 
	 */
	function updateA11yDemo(cell){
		if (cell.hasClass("active"))
			var a11ySpan = $("#screen-reader-text").addClass("focused selected");
		else
			var a11ySpan = $("#screen-reader-text").addClass("focused");


		var label = cell.attr("aria-label");
		var role = cell.attr('role');

		/*if (cell.attr("aria-describedby")){
			if (isFirst){
				return a11ySpan.html(label +", "+ role + ". Choose date, application." +'<p id="aria-desc-text">'+ HELPTEXT + '</p>');
			} else{
				return a11ySpan.html( label +", "+ role +' <p id="aria-desc-text">'+ HELPTEXT + '</p>');
			}

		} else*/
			return a11ySpan.html( label +", "+ role );

	}
    //Let's go!
    
    //Get inital date from <input>
    initialDate = dateInput.attr("value");

    //Initalize
    setUpCalendar(initialDate)

      
	


	$("#moredetails").click(function(){
		$("#details").toggleClass("hidden");
		$(this).attr("aria-expanded", true);
	})

});





