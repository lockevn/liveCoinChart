/**********************************/
/*
this page declare component that act as input or group of inputs to control data, modify data
*/
/**********************************/

// Display contact us information, contact the support team
// $emit "input", with what user choose in this component
var dataSourceSelectorComponent = Vue.component('datasource-selector', {
    props: ['allowcurrencies'],
    template: `
<div :id="'dataSourceSelectorComponent_' + _uid" class="box controlBox">    
    <label>
         symbol
        <input class="" v-model="symbol" list="symbollist" :title="Object.keys(workingCurrencies).length">
        <datalist id="symbollist">
            <option v-for="(val, key) in workingCurrencies" :key="key"  v-if="!key.startsWith('.')">{{key}}</option>
        </datalist>
    </label>
    
    <button class="pure-button-primary pure-button" @click="onGetData(true);">Save and reload</button>
</div>
`,
    data: function () {
        return {
            symbolCategory: 'Global247',
            limitLength: 0,
            tickPeriod: '',
            symbol: '',            
        }
    },

    computed: {
        // tickPeriod depends on symbolCategory
        workingTickPeriods: function () {
            var vm = this;
            return [
                'M1',
                'M3',
                'M5',
                'M15',
                'M30',
                'H1',
                'H4',
                'D1',
                'D7',
                '1M'
            ]
        },

        // merge the default currencies with list of currencies from firebase, to be workingCurrencies
        workingCurrencies: function () {
            var vm = this;
            var arrRet = {};
            if (vm.symbolCategory == "Global247") {
                var defaultCoinWorkingCurrencies = {
                    BTCUSD: true,
                    BTGUSD: true,
                    BCHUSD: true,
                    DASHUSD: true,
                    DGBUSD: true,
                    ETHUSD: true,
                    ETCUSD: true,
                    LTCUSD: true,
                    NEOUSD: true,
                    XRPUSDT: true,
                };
                arrRet = Object.assign(defaultCoinWorkingCurrencies, vm.allowcurrencies);
            }            

            return arrRet;
        }
    },

    methods: {
        // on clicking GetData button, emit event input with current state of input controls inside this component
        onGetData: function (needToReload) {
            localStorage.setItem('symbolCategory', this.symbolCategory);
            localStorage.setItem('limitLength', this.limitLength);
            localStorage.setItem('tickPeriod', this.tickPeriod);
            localStorage.setItem('symbol', this.symbol);

            this.$emit('input', {
                symbol: this.symbol.toUpperCase(),
                limitLength: +(this.limitLength),
                symbolCategory: this.symbolCategory,
                tickPeriod: this.tickPeriod
            });

            if(needToReload){
                window.location.reload();
            }
        },

    },

    created: function () {
        var vm = this;

        this.symbolCategory = xcUtil.getOrSetLocalStorage('symbolCategory', 'Global247');
        this.symbol = xcUtil.getOrSetLocalStorage('symbol', 'BTCUSD');
        this.limitLength = xcUtil.getOrSetLocalStorage('limitLength', 100);
        this.tickPeriod = xcUtil.getOrSetLocalStorage('tickPeriod', 'M30');        

        vm.onGetData();
    },    

});

