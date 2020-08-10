Vue.component('v-select', VueSelect.VueSelect)

new Vue({
    el: '#app',
    data: {
        options: [],
        camacOrder: '103',
        camacCartone: 196,
        camacTaglie: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        qtyDaAcquistare: [],
        valoriDaFornire: 2,
    },
    computed: {
        randomCamacOrder: function () {
            let tipiCamacOrder = ['103', '104', 'libero', ''];
            let index = Math.floor(Math.random() * Math.floor(tipiCamacOrder.length));
            return tipiCamacOrder[index];
        },
    },
    methods: {
        /**
         * @see https://github.com/sagalbot/vue-select/issues/492
         * @param data
         * @param loading
         */
        onSearch: function (data, loading) {
            /* necessario perchè search passa più volte con un valore "" */
            if (data !== "") {
                //loading(true);
                //this.options=[123,456,789];
                //console.log("this.$refs.select.search", this.$refs.select.index.search);
                //console.log("this.$refs.select.toggleLoading", this.$refs.select.index.toggleLoading);
                this.search(loading, data, this);
            }

        },

        search: _.debounce((loading, data, vm) => {

            /* prendo solo i valori che sono interi */
            if (Number.isInteger(Math.floor(data))) {
                vm.options=[];
                switch (vm.camacOrder) {
                    case "103":
                        let qtySlot = Math.floor(data/vm.camacCartone)
                        for(let i=0;i<vm.valoriDaFornire; i++) {
                            let slotQty = (qtySlot+i) * vm.camacCartone;
                            vm.options.push(slotQty);
                        }
                        break;
                    default:
                        break;
                }
                //loading(false);
            }
        }, 500),
        setQuantitySelected: function (options, item, index) {
            console.log('item ', item);
            console.log('index ', index);
            console.log('options ', options);
            this.qtyDaAcquistare[item] = [{
                "qtyOption": options
            }];
        }

    },
})