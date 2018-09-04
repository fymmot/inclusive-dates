
/*
Rolling tabindex datepicker 
*/


$(document).ready(function(){

	/*Variables and selectors*/
	var ALL_ACTIVE_DATEPICKER_DAYS = $('table.picker__table > tbody > tr > td[role="button"][aria-disabled!="true"]')
	
	var RIGHT_KEY = 39;
	var LEFT_KEY = 37;
	var SPACE_KEY = 32;


	// Add click listener to each button

	ALL_ACTIVE_DATEPICKER_DAYS.click(function(){
		
		//Remove active states and set negative tabindex to all elements
		ALL_ACTIVE_DATEPICKER_DAYS.removeAttr("aria-pressed").removeClass("active").attr("tabindex", "-1");

		//Set the clicked button as active
		$(this)
			.attr('aria-pressed', 'true')
			.attr('tabindex', '0')
			.addClass("active");
	});
	
	// Add keylistener to table to move between the days and select using space and enter

	$("#P1973332106_table").keydown(function( event ) {

		//Find the cell currently in focus
		var current_cell = $("#P1973332106_table td[role='button']:focus");
		var matched_cell;
		var nextCell;

		ALL_ACTIVE_DATEPICKER_DAYS.each(function(){
			if ($(this).is(current_cell)){
				matched_cell = $(this);
			}
				
		})


		//Listen for keystrokes
		switch (event.which){

			case RIGHT_KEY:
				event.preventDefault();

				ALL_ACTIVE_DATEPICKER_DAYS
					.attr("tabindex", "-1");

				current_cell.next()
					.attr("tabindex", "0")
					.focus();

		   		break;

		   	case LEFT_KEY:
				event.preventDefault();

				ALL_ACTIVE_DATEPICKER_DAYS
					.attr("tabindex", "-1");

				var previousCell = current_cell.prev();
					if (!previousCell.attr('aria-disabled')){
						previousCell.attr("tabindex", "0").focus();
					}

				
		   		break;

		   	case SPACE_KEY:
				event.preventDefault();
				ALL_ACTIVE_DATEPICKER_DAYS.removeAttr("aria-pressed");	
				current_cell.attr("aria-pressed", "true");
				break;
		}
});

});





