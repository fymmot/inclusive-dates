
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){


	var $calendar = $('#P1973332106_table'),
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        HELPTEXT = 'Use the left and right arrow keys to browse days. Up and down arrows move between weeks. Select a day using return key or spacebar.'

    
    var $datePickerGrid = $calendar.find('tbody');
	var calendarDates = [];
	var ALL_ACTIVE_DATEPICKER_DAYS = $('table.picker__table > tbody > tr > td[role="button"][aria-disabled!="true"]')

	var RIGHT_KEY = 39;
	var LEFT_KEY = 37;
	var UP_KEY = 38;
	var DOWN_KEY = 40;
	var SPACE_KEY = 32;
	var RETURN_KEY = 13;

	var current_cell;


	function generateDays(){
	    for (var i = 0; i<30; i++){
	    	var d = {
	    		weekday: ((i+5)%7)+1,
	    		day: i+1,
	    		month: 9,
	    		year: 2018
	    	}
	    	calendarDates.push(d);
	    }
	}

    function clearCalendar(){
    	$datePickerGrid.empty();
    }

    function setUpCalendar(){

    	//Generate an array of days for the specified month
    	generateDays();

    	//Always clear the calendar of old content
    	clearCalendar();

    	var x = 0;


    	for (var i = 0; i<6; i++){

    		//Add rows
    		var $row = $('<tr role="presentation"></tr>');
			$datePickerGrid.append($row);
			
			var y = x;
			//Add empty cells in the first row, until the weekday matches
			for (j = 2; j<=days.length; j++){
				if (i==0){
					if (calendarDates[0].weekday != j){
						var $td = $('<td role="presentation"></td>');
						$row.append($td);}
				} 
			}
			//Add cells to each of the rows. One cell for each day in the calendarDates array.
			for (y; $row.children().length<7; y++){

				if (y >= calendarDates.length){ //Break after the last day
					break;

				} else{
					var $td = $('<td></td>');

					$td
						.attr("role", "button")
						.attr("tabindex", "-1")
						.attr("data-weekday", calendarDates[y].weekday)
						.attr("data-day", calendarDates[y].day)
						.attr("data-month", calendarDates[y].month)
						.attr("data-year", calendarDates[y].year)
						.html(calendarDates[y].day);

					setAriaLabel($td);
					$row.append($td);
				}	
			}
			x = x+(y-x);
    	}

    	//Generate list of active datepicker buttons
    	ALL_ACTIVE_DATEPICKER_DAYS = $('table.picker__table > tbody > tr > td[role="button"][aria-disabled!="true"]')

    	//Set first day as active
    	setSelected(ALL_ACTIVE_DATEPICKER_DAYS.first());

		//Make it interactive!    	
	    registerClickListeners();

	    registerKeyListeners();

    }
    //Let's go!
    setUpCalendar()



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

		$("#P1973332106_table").keydown(function( event ) {

			//Find the cell currently in focus
			current_cell = $("#P1973332106_table td[role='button']:focus");

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
		 * Manage tabindex for when the user leaves the table
		 */
		$("#P1973332106_table").focusout(function(){
			ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
			$("td[role='button'].active").attr("tabindex", "0");
		});
	}

	/**
	 * Clean up buttons, reset tabindex
	 */
	function cleanup(){
		ALL_ACTIVE_DATEPICKER_DAYS
			.attr("tabindex", "-1");

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

	}
	/**
	 * Mark the provided cell as active in the calendar and update relevant 
	 * aria attributes and classes.
	 * @param {[type]} cell The new cell to be made active as jQuery object
	 */
	function setSelected(cell){
		var $currently_active = $(".active");
		var $newActiveCell = cell;
		//Clean up previously selected cell
		$currently_active.removeClass("active").removeAttr("aria-describedby");
		setAriaLabel($currently_active);

		//Update the new active cell
		$newActiveCell
			.addClass("active")
			.attr("aria-describedby", "a11y_description")
			.attr("tabindex", "0");

		setAriaLabel($newActiveCell);
		updateA11yDemo($newActiveCell);
	}
	/**
	 * Update the visible screen reader demo text with info from the given cell
	 * @param  {[type]} cell 
	 */
	function updateA11yDemo(cell){
		var a11ySpan = $("#screen-reader-text");
		var a11yDesc = HELPTEXT;

		var label = cell.attr("aria-label");
		var role = "<span id='screen-reader-role'> "+cell.attr('role')+"</span>";

		if (cell.attr("aria-describedby")){
			a11ySpan.html( label + role +'<br>'+ a11yDesc );

		} else

			a11ySpan.html( label + role );

	}
	/**
	 * Set and update the aria-label for a given cell
	 * @param {[type]} cell The given cell as jQuery object
	 */
    function setAriaLabel(cell){
    	var isActive = (cell.hasClass("active"));
    	var label = days[cell.attr("data-weekday")-1] +" "+ cell.attr("data-day") +" "+ months[(cell.attr("data-month"))-1];

    	if (isActive){
    		label = "Selected date. " + label;
    	}
    	else {
    		label = label;
    	}
		cell.attr("aria-label", label);
    }


});





