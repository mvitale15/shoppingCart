import { LightningElement, api} from 'lwc';

export default class CustomModal extends LightningElement {
    @api title;
    @api objectType;
    @api fields;
    @api recordId;
    @api fieldDefaults =[];

    connectedCallback() {
  
    }

    handleSubmit(event) {
        this.dispatchEvent(new CustomEvent('submit'));
        event.preventDefault();       // stop the form from submitting
        let fields = event.detail.fields;
        if(this.fieldDefaults){
            this.fieldDefaults.forEach((el) => {
                let field = Object.keys(el);
                fields[field] = el[field];
            });
        }
        this.template.querySelector('lightning-record-form').submit(fields);
    }

    handleSuccess(event){
        this.dispatchEvent(new CustomEvent('success'));
    }

    handleError(event){
        this.dispatchEvent(new CustomEvent('error'));
    }

    handleClose(event){
        this.dispatchEvent(new CustomEvent('close'));
    }
}