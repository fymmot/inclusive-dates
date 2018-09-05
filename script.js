
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){

	/*Variables and selectors*/
	var ALL_ACTIVE_DATEPICKER_DAYS = $('table.picker__table > tbody > tr > td[role="button"][aria-disabled!="true"]')
	
	//Keycodes shorthand
	var RIGHT_KEY = 39;
	var LEFT_KEY = 37;
	var UP_KEY = 38;
	var DOWN_KEY = 40;
	var SPACE_KEY = 32;
	var RETURN_KEY = 13;

	var current_cell;

	/**
	 * @param  {}
	 * @return {}
	 *
	 * Register click listener for date buttons
	 */
	ALL_ACTIVE_DATEPICKER_DAYS.click(function(){
		
		//Remove active states and set negative tabindex to all elements
		ALL_ACTIVE_DATEPICKER_DAYS.removeAttr("aria-pressed").removeClass("active").attr("tabindex", "-1");

		//Set the clicked button as active
		$(this)
			.attr('aria-pressed', 'true')
			.attr('tabindex', '0')
			.addClass("active");
	});

	/**
	 * Manage tabindex for when the user leaves the table
	 */
	$("#P1973332106_table").focusout(function(){
		ALL_ACTIVE_DATEPICKER_DAYS.attr("tabindex", "-1");
		$("td[role='button'][aria-pressed='true']").attr("tabindex", "0");
	});
	
	/**
	 *
	 * Add keylistener to table to move between the days and select using space and enter
	 */
	$("#P1973332106_table").keydown(function( event ) {

		//Find the cell currently in focus
		current_cell = $("#P1973332106_table td[role='button']:focus");
//	

		//Listen for keystrokes
		switch (event.which){

			case RIGHT_KEY:
				event.preventDefault();
				nextDay();
		   		break;

		   	case LEFT_KEY:
				event.preventDefault();
				previousDay();
		   		break;

		   	case UP_KEY:
				event.preventDefault();
				previousWeek();

				break;

		   	case DOWN_KEY:
				event.preventDefault();
				nextWeek();

		   		break;

		   	//Select cell with spacebar or return key
		   	case SPACE_KEY:
				event.preventDefault();
				ALL_ACTIVE_DATEPICKER_DAYS.removeAttr("aria-pressed");	
				current_cell.attr("aria-pressed", "true");
				current_cell.focus();
				break;

			case RETURN_KEY:
				event.preventDefault();
				ALL_ACTIVE_DATEPICKER_DAYS.removeAttr("aria-pressed");	
				current_cell.attr("aria-pressed", "true");
				current_cell.focus();
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
	function nextDay(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(current_cell);
		
		if (a.index(current_cell) >= a.length-1){
			var nextElement = $(a[0])
		} else 
			var nextElement = $(a[idx + 1]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
	}
	/**
	 * Go to previous active date
	 */
	function previousDay(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(current_cell);
		
		if (a.index(current_cell) == 0){
			var nextElement = $(a[a.length-1])
		} else
			var nextElement = $(a[idx -1]);

		cleanup();

		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
	}
	/**
	 * Go to next week (+7 days)
	 */
	function nextWeek(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(current_cell);
		
		var nextElement = $(a[idx + 7]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
	}
	/**
	 * Go to previous week (-7 days)
	 */
	function previousWeek(){
		var a = ALL_ACTIVE_DATEPICKER_DAYS;
		var idx = a.index(current_cell);
		
		var nextElement = $(a[idx - 7]);

		cleanup();
		
		nextElement
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description")
			.focus();
	}
	/*Function to set focus to the next cell in a specified direction

	function setFocusToCell(direction){
		//Cleanup
		ALL_ACTIVE_DATEPICKER_DAYS
			.attr("tabindex", "-1");

		//Select the currently focused cell
		var a = $(":focus");

		//Are we at the first or last elements in the row or column? Used for wrapping.
		var xFirstChild = a.is( ":first-child" ) || a.prev().is( "[aria-disabled='true']");
		var xLastChild = a.is( ":last-child" );
		var yFirstChild = a.parents().first().is( ":first-child" );
		var yLastChild = a.parents().first().is( ":last-child" );

		//Decide current cell's grid coordinates
		currentY = a.parents().index()+1;
		currentX = a.index()+1;

		var newX;
		var newY;

		switch (direction) {
			case "left":
				if (xFirstChild || a.prev().is( "[aria-disabled='true']")){
					console.log("Test1!")
					if (yFirstChild){
						newX = GRID_COLS;
						newY = GRID_ROWS;
					} else {
						newX = GRID_COLS;
						newY = currentY-1;
					}
				} else {
					newX = currentX-1;
					newY = currentY;
				} 
				break;

			case "right":

				if (xLastChild || a.next().is( "[aria-disabled='true']")){
					if (yLastChild){
						newX = 3; //Hardcoded! Needs to be fixed to ignore disabled buttons
						newY = 1;
					} else{
						newX = 1;
						newY = currentY+1;
					}
					
				} else {
					newX = currentX+1;
					newY = currentY;
				} 
				break;

			case "down":
				if (yLastChild){
					newX = currentX;
					newY = 1;
				} else {
					newX = currentX;
					newY = currentY+1;
				}
				if (targetCell(newY,newX).is( "[aria-disabled='true']")){
					newY = newY+1;
				}

				break;

			case "up":
				if (yFirstChild){
					newX = currentX;
					newY = GRID_ROWS;
				} else {
					newX = currentX;
					newY = currentY-1;
				} 

				if (targetCell(newY,newX).is( "[aria-disabled='true']")){
					newY = GRID_ROWS;

					if (targetCell(newY,newX).is( "[aria-disabled='true']")){
						newY = newY-1;
					}

				}
				break;
		}
		//Set focus to the new cell

		function targetCell(y,x){
			return $('table.picker__table > tbody > tr:nth-child(' + y +') > td[role="button"]:nth-child(' + x + ')');
		}
		
		
		targetCell(newY,newX)
			.attr("tabindex", "0")
			.attr("aria-describedby", "a11y_description") //Transfer help text to new button
			.focus();

	}*/


});





