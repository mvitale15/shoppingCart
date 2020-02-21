public with sharing class CartPackageRelationshipModel {
	public static void createProductCartRelationships(List<Cart_Package_Relationship__c> packageCartRelationships){
		Set<Id> packageIds = new Set<Id>();
		for(Cart_Package_Relationship__c cpr : packageCartRelationships) {
			if(!packageIds.contains(cpr.Package__c)) {
				packageIds.add(cpr.Package__c);
			}
		}

		if(!packageIds.isEmpty()) {
			List<Cart_Product_Relationship__c> cartProductList = new List<Cart_Product_Relationship__c>();

			Map<Id, Package__c> packageMap = new Map<Id, Package__c> ([SELECT Id,
			                                                           (SELECT Id,
                                                                        Product__c,
                                                                        Product__r.Price__c
			                                                            FROM Product_Package_Relationships__r)
			                                                           FROM Package__c
			                                                           WHERE Id IN: packageIds]);
            for(Cart_Package_Relationship__c cpr : packageCartRelationships) {
                
                for(ProductXPackage__c packageProduct : packagemap.get(cpr.Package__c).Product_Package_Relationships__r){
                    Cart_Product_Relationship__c cartProductInstance = new Cart_Product_Relationship__c();
                    cartProductInstance.Cart__c = cpr.Cart__c;
                    cartProductInstance.Quantity__c = 1;
                    cartProductInstance.Product__c = packageProduct.Product__c;
                    cartProductList.add(cartProductInstance);
                }
 
                
            }
            if(!cartProductList.isEmpty()){
                insert cartProductList;
            }
		}
	}
}
