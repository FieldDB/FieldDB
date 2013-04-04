function(doc) {
  if (doc._id && (doc.status == "Archived" || doc.status == "Transferred")) {
    emit(doc._id, {
      inspectionStage : doc.header.inspectionStage,
      inspectionStage_label : doc.header.inspectionStage.label,
      id : doc._id,
      sku_name : doc.header.sku.name,
      sku_number : doc.header.sku.number,
      sku_description : doc.header.sku.description,
      sku_serial_no : doc.header.sku.serial_no,
      sku_date_forecasted_inspection : doc.header.sku.date_forecasted_inspection,
      inspection_location : doc.header.inspection_location,
      inspection_location_gps : doc.header.inspection_location_gps,
      assignment : doc.header.assignment,
      assignment_id : doc.header.assignment.id,
      assignment_date_first_retrieved : doc.header.assignment.date_first_retrieved,
      purchaseOrder : doc.header.purchaseOrder,
      purchaseOrder_number : doc.header.purchaseOrder.number,
      purchaseOrder_order_date : doc.header.purchaseOrder.order_date,
      inspection_completed_date : doc.conclusion.inspection_completed_date,
      lotSize : doc.header.acceptableQualityLevelMetadata.lotSize,
      starred : doc.starred,
      actionRequired : doc.actionRequired,
      status : doc.status,
      statusColor : doc.status.replace(/ /g,"").toLowerCase(),
      conclusion : doc.conclusion.result,
      conclusionColor : doc.conclusion.result.replace(/ /g,"").toLowerCase(),
      filters : [ doc.header.sku.number + ":skunumber",
                  doc.header.sku.name + ":productname",
                  doc.header.purchaseOrder.number + ":po",
          doc.header.inspection_location + ":location" ,
          doc.header.supplier + ":supplier" ],
      supplier : doc.header.supplier
    });
  }
}