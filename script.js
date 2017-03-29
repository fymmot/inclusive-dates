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
		x.attr("aria-pressed", "true");//.html("Knapp PÅ");
	} else
		x.attr("aria-pressed", "false");//.html("Knapp AV")
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
	x.removeClass("klar hidden");
	x.html("Sidan laddar, vänta...").attr('aria-busy', 'true');
	
	setTimeout(function(){
        x.html("Färdig!").attr('aria-busy', 'false').addClass("klar");
        nollstall();
    }, 10000);
}




