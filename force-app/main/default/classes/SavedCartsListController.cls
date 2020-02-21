public with sharing class SavedCartsListController {
    @AuraEnabled()
    public static List<Cart__c> getSavedCarts() {
        return [
            SELECT Id, Name, Total__c
            FROM Cart__c
            ORDER BY Name
        ];
    }
}
