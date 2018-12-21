$(document).ready(function(){

	//Show/hide password
	//
	function setUpPasswordVisibilityBtn(){
		$.each($('.form-field input[type="password"]'), function(){
			//Create a button and add it to all password fields
			var x = $('<div class="toggle-pw"><button type="button" class="text-btn">Show password</button></div>');
			$(this).after(x); 


			var pwbutton = x.find("button");
			var x = $(this);

			//Register click listeners for password buttons
			pwbutton.click(function(){
				if (x.attr("type") === "password") {
				    x.attr("type", "text");
				    pwbutton.text("Hide password");

				  } else {
				    x.attr("type", "password");
				    pwbutton.text("Show password");
				  }
			});
		});
	}
	function setUpHints(){
		// Set up hint texts and error texts
		$.each($('.form-field'), function(){
			var input = $(this).find('input, fieldset');
			var x = input.attr('data-hint-text'); //Get hint text from HTML attribute
			var y = input.attr('id') + '-hint'; //Find ID for aria-describedby
			
			if (x !== undefined){ 
				$(this).append('<div class="helper" id="' + y + '">' + x + '</div>');
				input.attr('aria-describedby', y);
			}


		});
	}

	function setUpRequired(){
		$.each($('.form-field').find('input, select, textarea'), function(){
			if ($(this).attr('required') == 'required') //Fix screen reader bug with required attribute
				$(this).attr('aria-invalid', false);
				//Add visible text to optional fields
				//$(this).prev('label, fieldset').append('<span class="optional-span"> (optional)</span>');

		});

	}

	function initiateValidation(){
		//Initiate form validation
		$('#form').parsley({
			uiEnabled: true,
			trigger: 'blur',
			errorsWrapper: '<div></div>',
	  		errorTemplate: '<div class="error"></div>'
		});

		window.Parsley.on('field:error', function() {
		  // This global callback will be called for any field that fails validation.
		  // 
		  this.$element.parents('.form-field').addClass('hasError');
		  this.$element.attr('aria-invalid', true);

		  if (this.$element.find('.error').length > 0){
		  	var errorID = 'parsley-id-' + this.$element.attr('data-parsley-id');

			  this.$element.attr('aria-describedby', errorID);
			  
		}
		  
		  	
		});

		window.Parsley.on('field:success', function() {
		  // This global callback will be called for any field that passes validation.
		  this.$element.attr('aria-invalid', false);
		  this.$element.parents('.form-field').removeClass('hasError');

		  //Set the aria-describedby back to the hint id
		  if (this.$element.attr('data-hint-text') !== undefined){
		  	var hintID = this.$element.attr('id') + '-hint';
		  	this.$element.attr('aria-describedby', hintID);
			}
		});

	}
	
	// Lets go!
	setUpPasswordVisibilityBtn();
	setUpHints();
	setUpRequired();
	initiateValidation();

	

	






});