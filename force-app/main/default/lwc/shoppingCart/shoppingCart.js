import { LightningElement, wire } from 'lwc';
import { createRecord, deleteRecord } from 'lightning/uiRecordApi';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import getRelatedProducts from '@salesforce/apex/ShoppingCartController.getRelatedProducts';

import CART_OBJECT from '@salesforce/schema/Cart__c';
import PRODUCT_FIELD from '@salesforce/schema/Cart_Product_Relationship__c.Product__c';
import PRICE_FIELD from '@salesforce/schema/Cart_Product_Relationship__c.Price__c';
import QUANTITY_FIELD from '@salesforce/schema/Cart_Product_Relationship__c.Quantity__c';
import PACKAGE_FIELD from '@salesforce/schema/Cart_Package_Relationship__c.Package__c';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }
];

const columns = [
    { label: 'Product', fieldName: 'Name', sortable: true },
    { label: 'Quantity', fieldName: 'Quantity', type: 'number', sortable: true },
    { label: 'Price', fieldName: 'Price', type: 'currency', sortable: true },
    { label: 'Total', fieldName: 'Total', type: 'currency', sortable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: actions }
    }
];

export default class ShoppingCart extends LightningElement {
    isLoading = false;
    showModal = false;
    cartId;
    title;
    total = '$0.00';
    lineItemId;
    fields;
    fieldDefaults;
    objectType;
    products = [];
    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;


    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('cartSelected', this.handleCartSelected, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleCartSelected(selectedCartId) {
        this.cartId = selectedCartId;
        this.updateProductsList();
    }

    updateProductsList() {
        this.products = [];

        if (this.cartId) {
            getRelatedProducts({ cartId: this.cartId })
                .then(result => {
                    let total = 0;

                    result.forEach(el => {
                        this.products.push({
                            Id: el.Id,
                            Quantity: el.Quantity__c,
                            Price: el.Price__c,
                            Total: el.Total__c,
                            Name: el.Product__r.Name
                        });
                        total += el.Total__c;
                    });
                    this.products = [...this.products];
                    this.total = '$' + total.toFixed(2);
                })
                .catch(error => {
                    console.error(error);
                })
        }
    }

    handleNewCart(event) {
        this.products = [];
        this.cartId = '';
        this.total = '$0.00';
        const recordInput = { apiName: CART_OBJECT.objectApiName };

        createRecord(recordInput)
            .then(result => {
                this.cartId = result.id;
                fireEvent(this.pageRef, 'newCart', result.id);
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleAddProduct(event) {
        let defaults = [{ "Cart__c": this.cartId }];
        let modalFields = [PRODUCT_FIELD, QUANTITY_FIELD];

        this.openModal('Add Product', 'Cart_Product_Relationship__c', '', modalFields, defaults);
    }

    handleAddPackage(event) {
        let defaults = [{ "Cart__c": this.cartId }];

        this.openModal('Add Package', 'Cart_Package_Relationship__c', '', [PACKAGE_FIELD], defaults);
    }

    handleDeleteCart(event) {
        this.delete(this.cartId);

        fireEvent(this.pageRef, 'deleteCart', this.cartId);

        this.products = [];
        this.cartId = null;
        this.total = '$0.00';
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'delete':
                this.delete(row.Id);
                break;
            case 'edit':
                let modalFields = [PRODUCT_FIELD, PRICE_FIELD, QUANTITY_FIELD];
                this.openModal('Edit', 'Cart_Product_Relationship__c', row.Id, modalFields, null);
                break;
            default:
        }
    }

    delete(Id) {
        this.isLoading = true;

        deleteRecord(Id)
            .then(() => {
                this.updateProductsList();
                this.isLoading = false;
            })
            .catch(error => {
                console.error(error);
                this.isLoading = false;
            })
    }


    submitHandler() {
        this.isLoading = true;
    }

    successHandler() {
        if (this.lineItemId) {
            this.lineItemId = null;
        }

        this.isLoading = false;

        this.closeModal();
        this.updateProductsList();
    }

    errorHandler() {
        this.isLoading = false;
    }

    closeHandler() {
        this.closeModal();
    }

    openModal(title, objectType, recordId, fields, fieldDefaults) {
        this.title = title;
        this.objectType = objectType;
        this.lineItemId = recordId;
        this.fields = fields;
        this.fieldDefaults = fieldDefaults;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.products];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.products = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

}