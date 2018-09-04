/**
*	2. Aria-expanded
**/

function myFunction() {
  var x = document.getElementById("b1").getAttribute("aria-expanded"); 
  if (x == "true") {
  	x = "false";
  	document.getElementById("new-area").style.display = "none";
  }
  else {
  	x = "true";
  	document.getElementById("new-area").style.display = "block";
  }
  document.getElementById("b1").setAttribute("aria-expanded", x);

  var y = document.getElementById("b2").getAttribute("aria-expanded"); 
  if (y == "true") {
  	y = "false";
  	document.getElementById("new-area").style.display = "none";
  }
  else {
  	y = "true";
  	document.getElementById("new-area").style.display = "block";
  }
  document.getElementById("b2").setAttribute("aria-expanded", x);
}

/*
*	5. Aria-haspopup
*/

$(document).ready(function(){
console.log("test!");

$('[role="navigation"] ul ul').prev('a')
  .attr('aria-haspopup', 'true')
  .append('<span aria-hidden="true"> &#x25be;</span>');

var showSubmenu = function(dropdown) {
  dropdown.attr('aria-hidden', 'false');
};

var hideSubmenu = function(dropdown) {
  dropdown.attr('aria-hidden', 'true');
};

$('.with-dropdowns > li > a').on('focus', function(e) {
  hideSubmenu($('[aria-label="submenu"]'));
});

$('[aria-haspopup]').on('click', function(e) {
  var submenu = $(this).next();
  showSubmenu(submenu);
  //$(submenu).find('li:first-child a').focus();
  return false;
});

$('[aria-haspopup]').hover(function() {
  showSubmenu($(this).next());
  $(this).off('click');
});

$('[aria-haspopup]').parents('li').mouseleave(function() {
  hideSubmenu($(this).find('[aria-label="submenu"]'));
});

});

/**
*	6. Aria-pressed
*
**/

function myToggle() {
	var x = $(".toggle");
	if (x.attr("aria-pressed")=="false"){
		x.attr("aria-pressed", "true").html("Slå av");
	} else
		x.attr("aria-pressed", "false").html("Slå på")
}

/**
*	7. Aria-selected
**/

$(document).ready(function(){
		  $("li[role='tab']").click(function(){
			$("li[role='tab']:not(this)").attr("aria-selected","false");
		 	//$("li[role='tab']").attr("tabindex","-1");
			$(this).attr("aria-selected","true");
			//$(this).attr("tabindex","0");
		  var tabpanid= $(this).attr("aria-controls");
		   var tabpan = $("#"+tabpanid);
		$("div[role='tabpanel']:not(tabpan)").attr("aria-hidden","true");
		$("div[role='tabpanel']:not(tabpan)").addClass("hidden");

		tabpan.removeClass("hidden");
		//tabpan.className = "panel";
		tabpan.attr("aria-hidden","false");		
		  });
		  
		  //This adds keyboard accessibility by adding the enter key to the basic click event.
		  $("li[role='tab']").keydown(function(ev) {
		if (ev.which ==13) {
		$(this).click();
		}
		}); 
		 
		  //This adds keyboard function that pressing an arrow left or arrow right from the tabs toggel the tabs. 
		   $("li[role='tab']").keydown(function(ev) {
		if ((ev.which ==39)||(ev.which ==37))  {
		var selected= $(this).attr("aria-selected");
		if  (selected =="true"){
			$("li[aria-selected='false']").attr("aria-selected","true").focus() ;
			$(this).attr("aria-selected","false");

		  var tabpanid= $("li[aria-selected='true']").attr("aria-controls");
		   var tabpan = $("#"+tabpanid);
		$("div[role='tabpanel']:not(tabpan)").attr("aria-hidden","true");
		$("div[role='tabpanel']:not(tabpan)").addClass("hidden");

		tabpan.attr("aria-hidden","false");
		tabpan.removeClass("hidden");
		//tabpan.className = "panel";


		}
		}
		}); 

});

/**
*	Aria-live
*
**/ 

function politeClick() {
	$(".livearea").addClass("hidden");
	var x = $("#polite-area");
	x.removeClass("hidden").html("Nu tryckte du på knappen polite");
}

function assertiveClick() {
	$(".livearea").addClass("hidden");
	var x = $("#assertive-area");
	x.removeClass("hidden").html("Nu tryckte du på knappen assertive");
}

function offClick() {
	$(".livearea").addClass("hidden");
	var x = $("#off-area");
	x.removeClass("hidden").html("Nu tryckte du på knappen off");
}

/**
*	Aria-live med aria-busy
*
**/ 

function nollstall() {
	setTimeout(function(){
        $("#busy-area").html("").addClass("hidden").removeClass("klar");
    }, 10000);
}

function busyClick() {
	var x = $("#busy-area");
	x.removeClass("hidden").attr('aria-busy', 'true').html("Jag är upptagen, vänta...<br>(den här texten ska inte läsas upp)</br>");
	
	
	setTimeout(function(){
        x.html("Nu är jag klar!").attr('aria-busy', 'false').addClass("klar");
        nollstall();
    }, 10000);

}

/*
	Aria-activedescendant datepikcer
*/
$(document).ready(function(){
	$("#datepicker-btn").click(function(){
		$(this).attr('aria-expanded', 'true');
	    $("#datepicker-grid").removeClass("hidden").attr('aria-activedescendant', 'grid3').focus();
	    $("#grid3").addClass("active").attr("aria-selected", "true");

	});
	$('td[id^="grid"]').click(function(){
		if ($(this).attr('aria-disabled') == 'true'){
			//Do nothing
		} else{
			$('td[id^="grid"]').removeAttr("aria-pressed").removeClass("active");
			$(this).attr("aria-selected", "true").addClass("active");
			$("#datepicker-grid").attr('aria-activedescendant', this.id);
	}

	});
});

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
		
		//Remove active states and tabindices
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
		
		//Create a list of all focusable days
		var myMap = ALL_ACTIVE_DATEPICKER_DAYS.map( function( index, element ) {
		    return this;
		}).get();

		//Listen for keystrokes
		switch (event.which){

			case RIGHT_KEY:
				event.preventDefault();

				ALL_ACTIVE_DATEPICKER_DAYS
					.attr("tabindex", "-1");

				var nextCell = current_cell.next();

				if (current_cell)

				if (!nextCell.attr('aria-disabled')){
					nextCell.attr("tabindex", "0").focus();
				}


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





