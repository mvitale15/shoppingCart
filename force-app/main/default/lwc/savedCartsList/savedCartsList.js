import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getSavedCarts from '@salesforce/apex/SavedCartsListController.getSavedCarts';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

const columns = [
    { label: 'Cart', fieldName: 'Name' }
];

export default class SavedCartsList extends LightningElement {
    columns = columns;
    savedCarts = [];
    selectedRows = [];

    @wire(CurrentPageReference) pageRef;

    connectedCallback(){
        this.updateSavedCartsList();
        registerListener('newCart', this.handleNewCart, this);
        registerListener('deleteCart', this.handleCartDelete, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    updateSavedCartsList() {
        this.savedCarts = [];
        return new Promise((resolve, reject) => {
            getSavedCarts()
            .then(result =>{
                console.log('result');
                result.forEach(el => {
                    this.savedCarts.push({
                        Id: el.Id,
                        Name: el.Name, 
                        Total: el.Total__c});
                });
                this.savedCarts = [...this.savedCarts];
                resolve(result);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            })
        })
    }

    handleSelection(event){
        const row = event.detail.selectedRows[0];
        fireEvent(this.pageRef, 'cartSelected', row.Id);
    }

    async handleNewCart(cartId){
        this.clearRowSelection();

        const rows = [cartId];
        

        await this.updateSavedCartsList();
        console.log('after');
        this.selectedRows = rows;
    }

    handleCartDelete(cartId){
        this.clearRowSelection();

        const rows = this.savedCarts;
        let rowIndex = rows.findIndex( ({ Id }) => Id === cartId);
        rows.splice(rowIndex, 1);
        this.savedCarts = [...rows];
    }

    clearRowSelection(){
        var el = this.template.querySelector('lightning-datatable');  
        el.selectedRows = [];
    }
}