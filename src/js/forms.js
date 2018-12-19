$(document).ready(function(){

	//Show/hide password
	var pwbutton = $(".toggle-pw").find("button");
	var x = $(".toggle-pw").prev("input");

	pwbutton.click(function(){
		if (x.attr("type") === "password") {
		    x.attr("type", "text");
		    pwbutton.text("Hide password");

		  } else {
		    x.attr("type", "password");
		    pwbutton.text("Show password");
		  }
	})

	$('#form').parsley({
		uiEnabled: true,
		trigger: 'blur',
		errorsWrapper: '<div></div>',
  		errorTemplate: '<div class="error"></div>'
	});
	/*$('#username').attr('data-parsely-minlength', 4);
	console.log(instance.isValid());*/

// Set up hint texts and error texts
	$.each($('.form-field'), function(){
		var input = $(this).find('input');
		var x = input.attr('data-hint-text');
		var y = input.attr('id') + '-hint';
		
		if (x !== undefined){ 
			$(this).append('<div class="helper" id="' + y + '">' + x + '</div>');
			input.attr('aria-describedby', y);
		}

		input.attr('aria-invalid', false);

		/*var z = $(this).find('input').attr('data-error-text');
		var a = $(this).find('input').attr('id') + '-error';
		
		if (z !== undefined)
			$(this).append('<div class="error" id="' + y + '">' + x + '</div>');*/
	});



	window.Parsley.on('field:error', function() {
	  // This global callback will be called for any field that fails validation.
	  this.$element.attr('aria-invalid', true);
	  this.$element.parent().addClass('hasError');


	  //Set the aria-describedby to the error message ID
	  var errorID = 'parsley-id-' + this.$element.attr('data-parsley-id');
	  if (errorID !== undefined)
	  	this.$element.attr('aria-describedby', errorID);



	});

	window.Parsley.on('field:success', function() {

	  // This global callback will be called for any field that fails validation.
	  this.$element.attr('aria-invalid', false);
	  this.$element.parent().removeClass('hasError');

	  //Set the aria-describedby back to the hint
	  var hintID = this.$element.attr('id') + '-hint';
	  if (hintID !== undefined)
	  	this.$element.attr('aria-describedby', hintID);

	});






});