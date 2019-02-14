
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

	var current_cell;


	/**
	 * Function to generate a list of date objects containing weekday, day, month and year
	 * @param  {[type]} startDate Starting date in YYYY-MM-DD format (optional)
	 */
	function generateDays(startDate){

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
		/*
		var fieldset = $('<fieldset><legend class="visually-hidden">Choose month</legend><button>Previous month</button><h3 id="month-label">' + months[+calendarDates[0].month-1] + ' ' + calendarDates[0].year + '</h3> <button>Next month</button> </fieldset>');
		$('#datepicker_wrapper').before(fieldset);*/

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
		var $keyboard_shortcuts = $('<div class="keyboard-shortcuts-link"><a href="#">Show keyboard shortcuts</a></div>');
		$("#datepicker_wrapper").prepend($keyboard_shortcuts);
	}

	function updateCalendar(newDate){
		clearCalendar();

		//setUpCalendar(newDate);
		console.log("uppdaterar");

	}


    function setUpCalendar(startDate){

    	// Hide the <input>
    	$("#input_wrapper").addClass("hidden");

    	//Generate an array of days for the specified month
    	generateDays(startDate);

    	//Always clear the calendar of old content
    	generateCalendarTable();
    	generateCalendarHeader();
    	generateKeyboardHelp();


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

					setAriaLabel($td);

					$row.append($td);
				}	
			}
			//Iterate
			x = x+(y-x);
    	}

    	generateA11yDemo();
    	/*generateA11yHelp();*/

    	//Generate list of active datepicker buttons
    	ALL_ACTIVE_DATEPICKER_DAYS = $('table#datepicker_table > tbody > tr > td').not('.disabled');

    	//Set first day as tabbable
    	var firstDay = ALL_ACTIVE_DATEPICKER_DAYS.first();
		firstDay.attr("tabindex", "0");
		//Give it the aria-description
    	moveA11yDesc(firstDay);

		//Make the calendar interactive!    	
	    registerClickListeners();
	    registerKeyListeners();

    }

    /**
     * Clear calendar
     */
    function clearCalendar(){
    	$("#datepicker_wrapper").empty();
    	return $("#datepicker_wrapper");
    }

	/**
	 * Register mouse listeners for each cell in the table
	 */
	function registerClickListeners() {

		ALL_ACTIVE_DATEPICKER_DAYS.click(function(){
		
			//Remove active states and set negative tabindex to all elements
			cleanup();

			//Set the clicked button as active
			$(this).attr('tabindex', '0');

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
			}
		});

		$calendar.focusin(function(){

			//Show keyboard icon in bottom left
			//$("html[data-whatintent='keyboard'] .keyboard_prompt").removeClass("hidden");

		});
		
		/**
		 * Manage tabindex for when the user leaves the table
		 */
		$calendar.focusout(function(){
			//Remove the keyboard icon
			//$(".keyboard_prompt").addClass("hidden");

			//Remove tabindices
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

    	if (isActive){
    		label = "Selected date. " + label;
    	}
    	else {
    		label = label;
    	}
		return cell.attr("aria-label", label);

    }

    /**
 * Move the aria-description to a given cell. Remove from all other cells. 
 * @param  {[type]} cell the cell that should have the aria-description
 */
	function moveA11yDesc(cell){
		$newCell = cell;

		ALL_ACTIVE_DATEPICKER_DAYS
			.removeAttr("aria-describedby");

		return $newCell.attr("aria-describedby", "a11y_description");
	}
	

	/**
	 * Clean up buttons, reset tabindex
	 */
	function cleanup(){
		//return ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");

	}
	/*
	function nextMonth(cell){
		var currentMonth = parseInt(cell.attr("data-month"));
		var currentYear = parseInt(cell.attr("data-year"));
		var newMonth, newYear;
		var newdatestring = "";


		if (currentMonth == 12){
			newMonth = 1;
			newYear = currentYear+1;
		}
		else {
			newMonth = currentMonth+1;
			newYear = currentYear;
		}
		newdatestring = ""+newYear+"-"+newMonth;
		console.log(newdatestring);
		
		updateCalendar(newdatestring);



	}*/

	/**
	 * Go to next active date
	 */
	function nextDay(cell){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(cell);
		
		if (a.index(cell) >= a.length-1){
			var nextElement = $(a[0])
		} else 
			var nextElement = $(a[idx + 1]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
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
			var nextElement = $(a[a.length-1])
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

	/**
	 * Mark the provided cell as active in the calendar and update relevant 
	 * aria attributes and classes.
	 * @param {[type]} cell The new cell to be made active
	 */
	function setSelected(cell){
		var $currently_active = $(".active");
		var $newActiveCell = cell;
		//Clean up previously selected cell
		$currently_active.removeClass("active")
		setAriaLabel($currently_active);

		//Update the new active cell
		$newActiveCell
			.addClass("active")
			.attr("tabindex", "0");

		/*moveA11yDesc($newActiveCell);*/
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
		var ad = $('<h3 style="font-size:1rem; font-weight:400;">Text read by screen reader <strong>(demo only)</strong></h3><div id="screen-reader-text">Text will be displayed here when you interact with the calender </div>');
		$("#datepicker_wrapper").append(ad);

		/**
		 * Manage focusin events
		 */
		$calendar.focusin(function(){
			var $focused = $(':focus');
			updateA11yDemo($focused, true);
		});

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
	function updateA11yDemo(cell, isFirst){
		if (cell.hasClass("active"))
			var a11ySpan = $("#screen-reader-text").addClass("focused selected");
		else
			var a11ySpan = $("#screen-reader-text").addClass("focused");


		var label = cell.attr("aria-label");
		var role = cell.attr('role');

		if (cell.attr("aria-describedby")){
			if (isFirst){
				return a11ySpan.html(label +", "+ role + ". Choose date, application." +'<p id="aria-desc-text">'+ HELPTEXT + '</p>');
			} else{
				return a11ySpan.html( label +", "+ role +' <p id="aria-desc-text">'+ HELPTEXT + '</p>');
			}

		} else

			return a11ySpan.html( label +", "+ role );

	}

    //Let's go!
    
    //Get inital date from <input>
    initialDate = dateInput.attr("value");

    //Initalize
    setUpCalendar(initialDate)



});





