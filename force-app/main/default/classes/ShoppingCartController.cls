public with sharing class ShoppingCartController {
    @AuraEnabled()
    public static List<Cart_Product_Relationship__c> getRelatedProducts(Id cartId) {
        return [
            SELECT Id, Price__c, Product__r.Name, Quantity__c, Cart__c, Total__c
            FROM Cart_Product_Relationship__c
            WHERE Cart__c =: cartId
        ];
    }
}
