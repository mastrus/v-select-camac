Vue.component('v-select', VueSelect.VueSelect)

new Vue({
    el: '#app',
    data: {
        options: [],
        camacOrder: '103',
        camacCartone: 196,
        camacTaglie: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        valoriDaFornire: 2, //valori da fornire sopra e sotto il valore inserito
        qtyDaAcquistare: []
    },
    /**
     * inizializzo tutte le quantita a 0 per ogni taglia disponibile
     */
    created(){
        for(let i in this.camacTaglie)  {
            this.qtyDaAcquistare[this.camacTaglie[i]] = 0;
        }
    },
    computed: {
        /**
         * per gestire i test in maniera casuale del camac order
         * @deprecated non più utilizzata
         * @returns {string}
         */
        randomCamacOrder: function () {
            let tipiCamacOrder = ['103', '104', 'libero', ''];
            let index = Math.floor(Math.random() * Math.floor(tipiCamacOrder.length));
            return tipiCamacOrder[index];
        },
    },
    methods: {
        /**
         * @param data quantità digitata dall'utente
         * @param loading funzione per far comparire il simbolo di caricamento
         */
        onSearch: function (data, loading) {

            /* necessario perchè search passa più volte con un valore "" */
            if (data !== "") {
                loading(true);
                /* attendo che l'utente completi di digitare */
                this.search(data, this);
                loading(false);
            }

        },
        /**
         * tramite _.debounce metto un ritardo per aspettare che l'utente digiti la quantità desiderata
         * in base al camacOrder del prodotto eseguo dei calcoli specifici per mostrargli la quantità
         * corretta che è possibile ordinare
         *
         * @param data quantità digitata dall'utente
         * @param vm mi passo this per modificare direttamente i valori
         *
         */
        search: _.debounce((data, vm) => {

            /* prendo solo i valori che sono interi */
            if (Number.isInteger(Math.floor(data))) {

                /* in base al camac order eseguo opzioni diverse */
                switch (vm.camacOrder) {
                    case "103":
                        /* calcolo lo slot minimo che diventerà il moltiplicatore delle quantità ordinabili */
                        let qtySlot = Math.floor(data/vm.camacCartone)//todo da sostituire in base al camac order

                        /* in base a quanti sono i valori da fornire li ciclo e li inserisco tutti */
                        vm.options=vm.insertOptions(vm.valoriDaFornire, qtySlot, vm.camacCartone)

                        break;
                    default:
                        break;
                }
            }
        }, 500),//millisecondi
        /**
         * restituisce le opzione disponibili da ordinare in base ai parametri
         *
         * @param valoriDaFornire numero di opzioni da fornire sopra e sotto
         * @param qtySlot slot minimo che diventerà il moltiplicatore delle quantità ordinabili
         * @param imballo numero di pezzi per ogni imballo ordinabili
         * @returns {[]}
         */
        insertOptions: function (valoriDaFornire, qtySlot, imballo){
            let options=[];
            let slotQtyDown = 0;
            let slotQtyUp = 0;
            for(let i=0;i<=valoriDaFornire; i++) {
                slotQtyUp = (qtySlot+i) * imballo;
                slotQtyDown = (qtySlot-i) * imballo;
                options.push(slotQtyUp);
                if(slotQtyDown>=0 && options.indexOf(slotQtyDown)){
                    options.push(slotQtyDown);
                }
            }

            /* ordino l'arrai in maniera ascendente */
            options.sort(function(a, b){return a-b});
            return options;
        },

        /**
         * la funzione imposta la quantità di merce ordinata in base alla taglia
         *
         * @param value
         * @param item
         */
        setQuantitySelected: function (value, item) {
            this.qtyDaAcquistare[item] = value;
        },

    },
})