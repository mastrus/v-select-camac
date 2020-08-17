Vue.component('v-select', VueSelect.VueSelect)

new Vue({
    el: '#app',
    data: {
        options: [],
        camacOrder: 'libero',
        camacCartone: 196,
        camacTaglie: ['2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
        valoriDaFornire: 2, //valori da fornire sopra e sotto il valore inserito
        qtyDaAcquistare: []
    },
    /**
     * inizializzo tutte le quantita a 0 per ogni taglia disponibile
     */
    created() {
        this.resetQtyDaAcquistare();
    },
    methods: {
        resetQtyDaAcquistare: function (){for (let i in this.camacTaglie) {
            this.qtyDaAcquistare[this.camacTaglie[i]] = 0;
        }},
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
         * tramite _.debounce metto in attesa la funzione per aspettare che l'utente digiti la quantità desiderata
         * in base al camacOrder del prodotto eseguo dei calcoli specifici per mostrargli la quantità
         * corretta che è possibile ordinare
         *
         * @param data quantità digitata dall'utente
         * @param vm mi passo this per modificare direttamente i valori
         *
         */
        search: _.debounce((data, vm) => {

            /** array res(qty, taglia) */
            let res = vm.verificaInserimento(data);

            /* prendo solo i valori che sono interi */
            res.qty=Math.floor(res.qty)
            if (Number.isInteger(res.qty)) {

                /* in base al camac order eseguo opzioni diverse */
                switch (vm.camacOrder) {
                    case "103":
                        /* calcolo lo slot minimo che diventerà il moltiplicatore delle quantità ordinabili */
                        let qtySlot = Math.floor(res.qty / vm.camacCartone);//todo da sostituire in base al camac order

                        /* in base a quanti sono i valori da fornire li ciclo e li inserisco tutti */
                        res.qty = vm.getQtyOptions(vm.valoriDaFornire, qtySlot, vm.camacCartone);

                        for (let i in res.qty) {
                            vm.options.push(
                                {
                                    taglia: res.taglia,
                                    qty: res.qty[i],
                                }
                            );
                        }

                        break;
                    case "libero":
                        vm.options=[]
                        vm.options.push(
                            {
                                taglia: res.taglia,
                                qty: res.qty,
                            }
                        );
                        break
                    default:
                        break;
                }

                /* elimino il valore digitato */
                vm.$refs.reference.search = '';
            }
        }, 500),//millisecondi
        /**
         * restituisce le opzioni di quantità ordinabili ai parametri
         *
         * @param valoriDaFornire numero di opzioni da fornire sopra e sotto
         * @param qtySlot slot minimo che diventerà il moltiplicatore delle quantità ordinabili
         * @param imballo numero di pezzi per ogni imballo ordinabili
         *
         * @returns {[]} array di quantita numeriche
         */
        getQtyOptions: function (valoriDaFornire, qtySlot, imballo) {
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
         * @param data - il valore può provenire direttamente dalle options o da un imput
         */
        setQuantitySelected: function (data) {

            /* prendo solo l'ultimo inserimento */
            let value = data[data.length - 1];

            /* verfico che l'input non sia l'ultimo elemento */
            if (value !== undefined) {

                /*
                * verifico che l'ultimo inserimento non sia gia presente
                * se presente lo sovrascrivo nei valori che compaiono in v-select
                */

                //accedo direttamente ai valori di v-select
                let datiAttuali = this.$refs.reference._data._value

                /* cerco se gia presente la taglia */
                let datiFiltrati = datiAttuali.filter(function (item) { return item.taglia === value.taglia });
                if(datiFiltrati.length >1){

                    //elimino l'utimo inserimento
                    datiAttuali.pop();

                    //sovrascivo il valore nella casella in v-select
                    for (let i in datiAttuali) {
                        if (datiAttuali[i].taglia === value.taglia) {
                            //sovrascrivo il precedente valore
                            datiAttuali[i].qty = value.qty
                            break
                        }

                    }
                }

                /* azzero tutte le quantità in quanto in caso di eliminazione di un valore non so quale sia stato
                * eliminato */
                this.resetQtyDaAcquistare();

                /* inserisco il nuovo valore nella variabile che invierà il form */
                for(let i in datiAttuali){
                    this.qtyDaAcquistare[datiAttuali[i].taglia] = datiAttuali[i].qty;
                }

                /* svuoto le opzioni inserite */
                this.options = [];

            } else {
                /* azzero tutte le taglia non sapendo quale ultimo valore è stato cancellato */
                this.resetQtyDaAcquistare();

            }
        },

        /**
         * Verifica che l'inserimento sia conforme
         *
         * @param value
         */
        verificaInserimento: function (value) {
            let tagliaInserita = '';
            let qtyInserita = 0;

            /* converto il valore in una stringa */
            value = value.toLocaleString();

            /* elimino eventuali caratteri vuoti */
            value = value.trim();

            /* imposto la stringa tutta in caratteri minuscoli */
            value = value.toLocaleLowerCase();

            /* Estra la taglia inserita se valida*/
            tagliaInserita = this.estraiTagliaInserita(value);

            if (tagliaInserita !== false) {

                /* prelevo la quantita inserita */
                //rimuovo la taglia da dentro la stringa, dato che ci possono essere taglie numeriche
                //imposto la taglia minuscola per la logica del metodo
                qtyInserita = value.replace(tagliaInserita.toLocaleLowerCase(), "");
                //lascio dentro alla stringa solo valori numerici
                qtyInserita = qtyInserita.replace(/\D/g, "");
                //converto ad intero la taglia inserita
                qtyInserita = parseInt(qtyInserita);

                return {
                    taglia: tagliaInserita,
                    qty: qtyInserita
                };
            } else {
                return false;
            }

        },
        /**
         * Estrae la taglia inserita nella stringa
         * se non trova niente restituisce false
         *
         * @param value
         * @returns {boolean|*|string}
         */
        estraiTagliaInserita: function (value) {

            let taglieDisponibili = _.clone(this.camacTaglie);
            let taglieDaRimuovere = [];

            /* verifico le taglie numeriche se presenti e se non presenti le rimuovo */
            for (let i in taglieDisponibili) {
                if (parseInt(taglieDisponibili[i])) {
                    let taglia = taglieDisponibili[i]
                    if (value.includes(taglia.toLocaleLowerCase())) {
                        return taglia;
                    }
                    taglieDaRimuovere.push(taglia);
                }
            }

            /* rimuovo la taglie non trovate */
            for (let i in taglieDaRimuovere) {
                this.rimuoviTaglia(taglieDaRimuovere[i], taglieDisponibili);
            }

            /*
            * Verifico tutte le taglie letterali
            * non devo confondere L con XL o casi similari
            * per evitare il problema verifico dalla stringa più lunga alla più corta
            */
            taglieDisponibili.sort(function (a, b) {
                // ASC  -> a.length - b.length
                // DESC -> b.length - a.length
                return b.length - a.length;
            });

            for (let i in taglieDisponibili) {
                let taglia = taglieDisponibili[i]
                if (value.includes(taglia.toLocaleLowerCase())) {
                    return taglia;
                }
            }

            /* se non trovo nessuna taglia torno false */
            return false;
        },
        /**
         * rimuove la taglia richiesta dall'array
         *
         * @param taglia
         * @param taglieDisponibili
         * @returns {*}
         */
        rimuoviTaglia: function (taglia, taglieDisponibili) {

            for (let i = 0; i < taglieDisponibili.length; i++) {
                if (taglieDisponibili[i] === taglia) {
                    taglieDisponibili.splice(i, 1);
                }
            }

            return taglieDisponibili

        },
    },
})