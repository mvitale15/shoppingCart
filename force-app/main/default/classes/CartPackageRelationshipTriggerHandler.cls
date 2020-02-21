public with sharing class CartPackageRelationshipTriggerHandler extends TriggerHandler{
    List<Cart_Package_Relationship__c> triggerNew = (List<Cart_Package_Relationship__c>)trigger.new;

    protected override void beforeInsert() {
        CartPackageRelationshipModel.createProductCartRelationships(triggerNew);
    }
}
