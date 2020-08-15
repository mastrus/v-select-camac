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
    created() {
        for (let i in this.camacTaglie) {
            this.qtyDaAcquistare[this.camacTaglie[i]] = 0;
        }
    },
    methods: {
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
                        let qtySlot = Math.floor(data / vm.camacCartone)//todo da sostituire in base al camac order

                        /* in base a quanti sono i valori da fornire li ciclo e li inserisco tutti */
                        vm.options = vm.insertOptions(vm.valoriDaFornire, qtySlot, vm.camacCartone)

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
        insertOptions: function (valoriDaFornire, qtySlot, imballo) {
            let options = [];
            let slot = 0;

            /* calcolo i valori superiori */
            for (let i = 1; i <= valoriDaFornire; i++) {
                slot = (qtySlot + i) * imballo;
                options.push(slot);
            }

            /* calcolo i valori inferiori */
            for (let i = valoriDaFornire - 1; i >= 0; i--) {
                slot = (qtySlot - i) * imballo;
                if (slot >= 0 && options.indexOf(slot)) {
                    options.push(slot);
                }
            }

            /* ordino l'array in maniera ascendente */
            options.sort(function (a, b) {
                return a - b
            });
            return options;
        },

        /**
         * la funzione imposta la quantità di merce ordinata in base alla taglia
         *
         * @param value
         */
        setQuantitySelected: function (value) {

            /* verifico che nella stringa non ci siano caratteri strani */
            value=this.sanitize(value);

            /* verifico che le quantita e taglie inserite siano conformi */
            let valueArray = this.verificaInserimento(value)

            this.qtyDaAcquistare[valueArray.taglia] = valueArray.qty;
        },

        /**
         * Verifica che l'inserimento sia conforme
         *
         * @param value
         */
        verificaInserimento(value) {
            let tagliaInserita = '';
            let qtyInserita = 0;

            /* converto il valore in una stringa */
            value = value.toLocaleString();

            /* elimino eventuali caratteri vuoti */
            value = value.trim();

            /* imposto la stringa tutta in caratteri minuscoli */
            value = value.toLocaleLowerCase();

            /* verifico che la taglia inserita sia valida */
            //todo verificare che non siano state inserite anche anltre taglie o parole strane
            //  e che sia case insensitive
            for(let x in this.camacTaglie){
                if(value.includes(this.camacTaglie[x].toLocaleLowerCase())){
                    tagliaInserita = this.camacTaglie[x];
                    //todo rimuovere la taglia dalla stringa

                    /* prelevo la quantita inserita */
                    qtyInserita = value.replace(/\D/g, "");
                    qtyInserita = parseInt(qtyInserita);

                    break
                }
            }

            return {
                taglia: tagliaInserita,
                qty: qtyInserita
            };

        },
        /**
         * serve ad eliminare caratteri strani dalla stringa
         * @param s
         * @returns {*}
         */
        sanitize(s) {
            return s;
            //s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        }
    },
})