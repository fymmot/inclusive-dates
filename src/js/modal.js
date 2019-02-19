var openButton;
var dialog;
var closeButton;
var keyHandle;

var tabHandle;
var disabledHandle;
var hiddenHandle;
var focusedElementBeforeDialogOpened;



	function openDialog() {
		if (openButton.hasAttribute("aria-expanded")){
			openButton.setAttribute("aria-expanded", true);
		}
		// Remember the focused element before we opened the dialog
		// so we can return focus to it once we close the dialog.
		focusedElementBeforeDialogOpened = document.activeElement;
		// Show the dialog and set focus to the first tabbable element

		dialog.hidden = false;
		var element = ally.query.firstTabbable({
			context: dialog, // context === dialog
			defaultToContext: true,
		});
		element.focus();
		// Make sure that no element outside of the dialog
		// can be interacted with while the dialog is visible.
		// This means we don't have to handle Tab and Shift+Tab,
		// but can defer that to the browser's internal handling.
		disabledHandle = ally.maintain.disabled({
			filter: dialog,
		});
		// Make sure that no element outside of the dialog
		// is exposed via the Accessibility Tree, to prevent
		// screen readers from navigating to content it shouldn't
		// be seeing while the dialog is open. See example:
		// https://marcysutton.com/slides/mobile-a11y-seattlejs/#/36
		hiddenHandle = ally.maintain.hidden({
			filter: dialog,
		});
		// Make sure that Tab key controlled focus is trapped within
		// the tabsequence of the dialog and does not reach the
		// browser's UI, e.g. the location bar.
		tabHandle = ally.maintain.tabFocus({
			context: dialog,
		});
		// React to enter and escape keys as mandated by ARIA Practices
		keyHandle = ally.when.key({
			escape: closeDialogByKey,
		});
	}

	function closeDialogByKey() {
		setTimeout(closeDialog);
	}

	function closeDialog() {

		if (openButton.hasAttribute("aria-expanded")){
			openButton.setAttribute("aria-expanded", false);
		}
		// undo listening to keyboard
		keyHandle.disengage();
		// undo trapping Tab key focus
		tabHandle.disengage();
		// undo hiding elements outside of the dialog
		hiddenHandle.disengage();
		// undo disabling elements outside of the dialog
		disabledHandle.disengage();
		// return focus to where it was before we opened the dialog
		focusedElementBeforeDialogOpened.focus();
		// hide or remove the dialog
		dialog.hidden = true;
	}

	function initializeKeyboardModal(o, d, c) {
		openButton = document.getElementById(o);
		dialog = document.getElementById(d);
		closeButton = document.getElementById(c);


		// wire up showing/hiding the dialog
		openButton.addEventListener('click', openDialog, false);
		closeButton.addEventListener('click', closeDialog, false);
	}

	

