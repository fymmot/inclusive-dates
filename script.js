
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){


	var $datePicker = $('#calendar'),
        $calendar = $('#P1973332106_table'),
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

    	generateDays();

    	//Always clear the calendar
    	clearCalendar();

    	var x = 0;


    	for (var i = 0; i<6; i++){
    		//Add rows
    		var $row = $('<tr role="presentation"></tr>');
			$datePickerGrid.append($row);

			var y = x;

			for (j = 2; j<=days.length; j++){
				if (i==0){
					if (calendarDates[0].weekday != j){
						var $td = $('<td role="presentation"></td>');
						$row.append($td);}
				} 
			}

			for (y; $row.children().length<7; y++){

				if (y >= calendarDates.length){
					break;
					/*var $td = $('<td role="presentation"></td>');
					$row.append($td);*/
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

					$row.append($td);
					setLabel($td);
				}	
			}
			x = x+(y-x);
    	}

    	ALL_ACTIVE_DATEPICKER_DAYS = $('table.picker__table > tbody > tr > td[role="button"][aria-disabled!="true"]')
    	ALL_ACTIVE_DATEPICKER_DAYS.first().addClass("active").attr("tabindex", "0");

    }
    setUpCalendar()

	/**
	 *
	 * Register click listener for all date buttons
	 */
	ALL_ACTIVE_DATEPICKER_DAYS.click(function(){
		console.log(ALL_ACTIVE_DATEPICKER_DAYS)
		
		//Remove active states and set negative tabindex to all elements
		ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");

		//Set the clicked button as active
		$(this).attr('tabindex', '0');

		setSelected($(this));
	});

	/**
	 * Manage tabindex for when the user leaves the table
	 */
	$("#P1973332106_table").focusout(function(){
		ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
		$("td[role='button'].active").attr("tabindex", "0");
	});
	
	/**
	 * Keyboard listeners for table
	 */
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
	 * Clean up buttons, reset tabindex
	 */
	function cleanup(){
		ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
	}
	/**
	 * Go to next active date
	 */
	function nextDay(c){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(c);
		
		if (a.index(c) >= a.length-1){
			var nextElement = $(a[0])
		} else 
			var nextElement = $(a[idx + 1]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
		updateInfo(nextElement);
	}
	/**
	 * Go to previous active date
	 */
	function previousDay(c){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(c);
		
		if (a.index(c) == 0){
			var nextElement = $(a[a.length-1])
		} else
			var nextElement = $(a[idx -1]);

		cleanup();

		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
		updateInfo(nextElement);

	}
	/**
	 * Go to next week (+7 days)
	 */
	function nextWeek(c){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(c);
		
		var nextElement = $(a[idx + 7]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
		updateInfo(nextElement);

	}
	/**
	 * Go to previous week (-7 days)
	 */
	function previousWeek(c){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(current_cell);
		
		var nextElement = $(a[idx - 7]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
		updateInfo(nextElement);

	}

	function setSelected(cell){
		var $currently_active = $(".active");
		$currently_active.removeClass("active");
		
		setLabel($currently_active);

		//setLabel(cell);
		cell
			.addClass("active");


		setLabel(cell);
		updateInfo(cell);
		cell.focus();
	}

	function updateInfo(c){
		var infoDiv = $("#screen-reader-text");
		var label = c.attr("aria-label");

		infoDiv.html(label);
	}
	
    //createCalendar(getTheDate());

    function setLabel(cell){
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
    //createCalendar(getTheDate());



});





