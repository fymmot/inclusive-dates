
$(document).ready(function(){

	$("#openModalBtn").click(function(){
		console.log("#openModalBtn");

		//$("#openModalBtn[aria-expanded='false']").text("Öppna").attr("aria-expanded", "true");

		$("#openModalBtn[aria-expanded='true']").text("Stäng modal").attr("aria-expanded", "false");;

		$("#modal1").attr("aria-modal", !!$("#modal1").attr("aria-modal"));

		$("#modal1[aria-expanded='true']")
			.attr("aria-modal", "false");
	})


});





