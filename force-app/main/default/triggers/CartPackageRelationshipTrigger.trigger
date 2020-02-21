trigger CartPackageRelationshipTrigger on Cart_Package_Relationship__c (before insert, after insert, before update, after update, before delete, after delete, after undelete) {
    new CartPackageRelationshipTriggerHandler().run();
}
