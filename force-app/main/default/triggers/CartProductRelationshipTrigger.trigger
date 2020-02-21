trigger CartProductRelationshipTrigger on Cart_Product_Relationship__c (before insert, after insert, before update, after update, before delete, after delete, after undelete) {
    new CartProductRelationshipTriggerHandler().run();
}