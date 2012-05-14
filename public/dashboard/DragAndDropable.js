document.body.addEventListener('dragover', function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}, false);
document.body.addEventListener('drop', function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	var draggedfiles = evt.dataTransfer.files; // FileList object.
	// files is a FileList of File objects. List some properties.
	var importObj = new Import({files: draggedfiles});
	
}, false);