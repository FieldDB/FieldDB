function(doc) {
  if (doc.header.assignment.id)
    if (doc.status != "Completed") {
      return;
    }
  /*
   * @nicolas, add other fields you want into this object, the tablet will send
   * them to you in the xml as json using this schema Create a copy of the doc,
   * with the attachments in a non-canonical locaiton to ensure that they can be
   * uploaded later, using the files transfered via dropbox
   */
  var copy = JSON.parse(JSON.stringify(doc));
    copy.attachmentsUploadedByDropbox = doc._attachments;
    delete copy._attachments;
    
  var reducedSkuInspectionContainingOnlyWhatThePlatformNeeds = {
    "actionRequired" : doc.actionRequired,
    "conclusion" : doc.conclusion,
    "sku" : doc.header.sku, 
    "workOrder" :doc.header.workOrder,
    "purchaseOrder" :doc.header.purchaseOrder,
    "sku_inspection_id" : doc._id,
    "inspectionAttributes": { "assignment_number": doc.header.assignment.id },
    "usersDB" : doc.validation_metadata.usersDB,
    "revisionWhichWasSubmitted": doc._rev,
    "skuInspectionWithoutAttachments": copy
    
  };
  emit(doc.header.assignment.id, reducedSkuInspectionContainingOnlyWhatThePlatformNeeds);
}