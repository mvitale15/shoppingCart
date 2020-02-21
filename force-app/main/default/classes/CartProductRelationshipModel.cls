public with sharing class CartProductRelationshipModel {
    public static void setPrice(List<Cart_Product_Relationship__c> itemsNeedingPrice){
        Set<Id> productIds = new Set<Id>();
        for(Cart_Product_Relationship__c item : itemsNeedingPrice){
            if(!productIds.contains(item.Product__c)){
                productIds.add(item.Product__c);
            }
        }

        if(!productIds.isEmpty()){
            Map<Id, Product__c> productMap = new Map<Id, Product__c> ([SELECT Id, Price__c FROM Product__c WHERE Id IN: productIds]);

            for(Cart_Product_Relationship__c item : itemsNeedingPrice){
                item.Price__c = productMap.get(item.Product__c).Price__c;
            }
        }
    }


    public static void updateItemTotal(List<Cart_Product_Relationship__c> itemsToUpdate){
        for(Cart_Product_Relationship__c item : itemsToUpdate){
            item.Total__c = item.Price__c * item.Quantity__c;
        }
    }
}
