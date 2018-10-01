
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){


	var $calendar,
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        HELPTEXT = 'Use the left and right arrow keys to browse days. Up and down arrows move between weeks. Select a day using return key or spacebar.',
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


	function generateDays(startDate){

		Date.prototype.monthDays = function(){
		    var d= new Date(this.getFullYear(), this.getMonth()+1, 0);
		    return d.getDate();
		}

		Date.prototype.firstWeekday = function(){
			var d= new Date(this.getFullYear(), this.getMonth(), 1);
		    return d.getDay();
		}

		// If provided a start date
		if (startDate) {
			var da = new Date(startDate);

		}
		else {var da = new Date();}


	    for (var i = 0; i<da.monthDays(); i++){
	    	var weekday_check = ((i+da.firstWeekday())%7);
	    	var monthString = da.getMonth()+1+"";
	    	var dayString = i+1+"";

	    	monthString = monthString.padStart(2,'0');
	    	dayString = dayString.padStart(2,'0');

	    	if (weekday_check == 0) 
	    		weekday_check = 7;
	    	var d = {
	    		weekday: weekday_check,
	    		day: dayString,
	    		month: monthString,
	    		year: da.getFullYear()
	    	}
	    	calendarDates.push(d);
	    }
	}

	function generateCalendarTable(){
		$calendar = $('<table id="datepicker_table"><thead></thead><tbody></tbody></table>');
		$calendar
			.attr("role", "application")
			.attr("aria-label", "Choose date");

		$('#datepicker_wrapper').append($calendar);
		$datePickerGrid = $calendar.find('tbody');
	}

	function generateCalendarHeader(){

		var fieldset = $('<fieldset><legend class="visually-hidden">Choose month</legend><button aria-label="Previous month"><</button><span id="month-label" role="heading" aria-level="3">' + months[+calendarDates[0].month-1] + ' ' + calendarDates[0].year + '</span> <button aria-label="Next month">></button> </fieldset>');
		$('#datepicker_wrapper').prepend(fieldset);


		var headerRow = "";

		for (i = 0; i<days.length; i++){
			var myHeaderDay = '<th scope="col" role="presentation"><abbr title="' + days[i] + '">' + daysShort[i] + '</abbr></th>';
			headerRow += myHeaderDay;
		}
		headerRow = $('<tr role="presentation">' + headerRow + '</tr>');
		$calendar.find('thead').append(headerRow);
	}

	function generateA11yDemo(){
		var ad = $('<h3>Text read by screen reader:</h3><div id="screen-reader-text"></div>');
		$("#datepicker_wrapper").append(ad);

	}

	function generateA11yHelp(){
		var ah = $('<p class="visually-hidden" id="a11y_description">Use the left and right arrow keys to browse days. Up and down arrows move between weeks. Select a day using return key or spacebar.</p>');
		$("#datepicker_wrapper").append(ah);

	}

	function updateCalendar(newDate){
		clearCalendar();

		//setUpCalendar(newDate);
		console.log("uppdaterar")

	}


    function setUpCalendar(){

    	//Get the start date from the date input. Hide the input
    	initialDate = dateInput.attr("value");
    	$("#input_wrapper").hide();

    	//Generate an array of days for the specified month
    	generateDays(initialDate);

    	//Always clear the calendar of old content

    	generateCalendarTable();

    	generateCalendarHeader();


    	var x = 0;

    	
    	for (var i = 0; i<6; i++){

    		//Add rows
    		var $row = $('<tr role="row"></tr>');
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

				if (y >= calendarDates.length){ //Break after the last day
					if (calendarDates[y%7].weekday == 1){
						break;
					}
					else {
						var $td = $('<td class="disabled" role="presentation"></td>');
						$row.append($td);
					}

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
    	generateA11yHelp();


    	//Generate list of active datepicker buttons
    	ALL_ACTIVE_DATEPICKER_DAYS = $('table#datepicker_table > tbody > tr > td').not('.disabled');

    	//Set first day as tabbable
    	var firstDay = ALL_ACTIVE_DATEPICKER_DAYS.first();
		firstDay.attr("tabindex", "0");
    	moveA11yDesc(firstDay);

		//Make it interactive!    	
	    registerClickListeners();

	    registerKeyListeners();

    }
    //Let's go!
    setUpCalendar()

	
    function clearCalendar(){
    	$("#datepicker_wrapper").empty();
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
		/**
		 * Manage focusin events. Update demo div
		 * 
		 */
		$calendar.focusin(function(){
			var $focused = $(':focus');
			updateA11yDemo($focused);
		});
		

		/**
		 * Manage tabindex for when the user leaves the table
		 */
		$calendar.focusout(function(){
			ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");

			if (ALL_ACTIVE_DATEPICKER_DAYS.hasClass("active")){
				$(".active").attr("tabindex", "0");
				
			}
			else {
				ALL_ACTIVE_DATEPICKER_DAYS.first().attr("tabindex", "0");
				
			}
			clearA11yDemo();
		});
	}
	

	/**
	 * Clean up buttons, reset tabindex
	 */
	function cleanup(){
		ALL_ACTIVE_DATEPICKER_DAYS
			.attr("tabindex", "-1");

		return;

	}
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



	}

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
		updateA11yDemo(nextElement);

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
		updateA11yDemo(nextElement);

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
		updateA11yDemo(nextElement);

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
			.attr("tabindex", "0")
			//.attr("aria-describedby", "a11y_description")
			.focus();

		updateA11yDemo(nextElement);

		return nextElement;

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

		moveA11yDesc($newActiveCell);
		setAriaLabel($newActiveCell);
		updateA11yDemo($newActiveCell);

		//Update the input field value with the selected day
		dateInput.attr("value", ""+$newActiveCell.attr("data-year")+"-"+$newActiveCell.attr("data-month")+"-"+$newActiveCell.attr("data-day"));

		return $newActiveCell;
	}
	/**
	 * Update the visible screen reader demo text with info from the given cell
	 * @param  {[type]} cell 
	 */
	
	function clearA11yDemo(){
		$("#screen-reader-text").html("");
		//console.log("rensat! " + allySpan);
	}

	function updateA11yDemo(cell){
		var a11ySpan = $("#screen-reader-text");
		var a11yDesc = HELPTEXT;

		var label = cell.attr("aria-label");
		var role = "<span id='screen-reader-role'> "+cell.attr('role')+"</span>";

		if (cell.attr("aria-describedby")){
			return a11ySpan.html( label + role +'<p id="aria-desc-text">'+ a11yDesc + '</p>');

		} else

			return a11ySpan.html( label + role );

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


});





