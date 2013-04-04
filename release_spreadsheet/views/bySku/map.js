function(doc) {
  if (doc.header.sku._id) {
      emit(doc.header.sku._id+":sku", doc._id);
      emit(doc.header.purchaseOrder._id+":po", doc._id);
      // emit(doc.sku.number+":sku", doc._id);
      // emit(doc.purchaseOrder.id+":po", doc._id);
      // emit(doc.assignment.id+":assign", doc._id);
  }
}