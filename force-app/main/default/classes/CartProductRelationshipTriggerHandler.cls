public with sharing class CartProductRelationshipTriggerHandler extends TriggerHandler{
    private List<Cart_Product_Relationship__c> items = new List<Cart_Product_Relationship__c>();

    Map<Id,Cart_Product_Relationship__c> oldMap = (Map<Id,Cart_Product_Relationship__c>)trigger.oldMap;
    List<Cart_Product_Relationship__c> triggerNew = (List<Cart_Product_Relationship__c>)trigger.new;


    protected override void beforeInsert() {
        items.addAll(triggerNew);
        CartProductRelationshipModel.setPrice(items);
        CartProductRelationshipModel.updateItemTotal(items);
    }

    protected override void beforeUpdate() {
        for(Cart_Product_Relationship__c item : triggerNew) {
            if(item.Price__c != oldMap.get(item.Id).Price__c || item.Quantity__c != oldMap.get(item.id).Quantity__c){
                items.add(item);
            }
        }

        if(!items.isEmpty()) {
            CartProductRelationshipModel.updateItemTotal(items);
        }
    }

}
