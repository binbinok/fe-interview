import Vue from './lib/vue.min';
import axios from 'axios';
import '../css/style.css';

var avg = arr => {
    let total = arr.reduce((p, v) => +p + +v);
    return (total / arr.length).toFixed(2)
};

class Order {
    constructor(bid) {
        this.bidInfo = Object.assign({}, bid);
        this.logs = [];
        this.show = false;
        this.time = null;
        this.quantity = bid.quantity;
        this.id = null
    }

    addLog(ask) {
        this.quantity -= ask.quantity;
        this.logs.push(Object.assign({}, ask));
    }

    created() {
        this.time = this.id = new Date().getTime();
        vm.$data.successOrderList.unshift(this);
    }
}

var vm = new Vue({
    el: '#app',
    data: {
        asks: [],
        bids: [],
        successOrderList: []
    },
    created() {
        setInterval(this.loadData, 1000);
        // this.loadData();
    },
    computed: {
        filterAsk() {
            let spliceList = this.spliceList(this.asks);
            return this.sort(spliceList, 'time').slice(0, 5);
        },
        filterBid() {
            let spliceList = this.spliceList(this.bids);
            return this.sort(spliceList, 'time').slice(0, 5);
        },
        filterSuccess() {
            return this.successOrderList.slice(0, 30);
        }
    },
    methods: {
        loadData() {
            axios.get('/api/getOrders').then(response => {
                if (response.status === 200) {
                    let data = response.data;
                    if (data.join('')) {
                        var list = this.filterData(data);
                        this.asks = this.asks.concat(list.a);
                        this.bids = this.bids.concat(list.b);
                        this.createOrder();
                    }
                } else {
                    console.error(response);
                }
            });
        },
        filterData(list) {
            var a = list.filter(t => t.side === 'ask'), 
                b = list.filter(t => t.side === 'bid');
            
            return {a, b}
        },
        createOrder() {
            let asks = this.sort(this.asks, ['price', 'number']),
                bids = this.sort(this.bids, ['price', 'number'], true);

            let findOrder = (bid, newOrder = {}) => {
                    if (bid.quantity <= 0) return false;
                    let order = asks.find(ask => ask && ask.quantity > 0 && +ask.price < +bid.price);
                    return order;
                };

            let getAsk = bid => {
                let order = new Order(bid);
                return () => {
                    let ask = findOrder(bid);
                    if (ask) {
                        let _quantity = Math.min(bid.quantity, ask.quantity),
                            log = Object.assign({}, ask, {
                                quantity: _quantity,
                                priceAvg: [ask.price],
                                time: new Date().getTime()
                            });
                        order.addLog(log);
                        ask.quantity -= _quantity;
                        bid.quantity -= _quantity;
                        return order;
                    } else {
                        return null;
                    }
                }
            }

            bids.map(bid => {
                var getOrder = getAsk(bid),
                    order;
                
                do {
                    order = getOrder();
                } while (order !== null && order.quantity > 0);
                
                order && order.created();
            });
        },
        spliceList(list) {
            list = list.filter(t => +t.quantity > 0);
            return list;
        },
        sort(list, key, ro) {
            /**
             * list: 排序数组
             * key：排序条件， 如果值为数据而为多级排序
             * ro：是否倒序
             */
            let is_key_strong = typeof key === 'string',
                key1 = is_key_strong ? key : key[0],
                key2 = key[1],
                arr = [].concat(list);
            
            return arr.sort((a, b) => {
                var ak1 = a[key1],
                    bk1 = b[key1],
                    ak2 = a[key2],
                    bk2 = b[key2];

                if (is_key_strong) {
                    return ro ? ak1 - bk1 : bk1 - ak1;
                } else {
                    if (ak1 === bk1) {
                        return bk2 - ak2;
                    } else {
                        return ro ? ak1 - bk1 : bk1 - ak1;
                    }
                }
            });
        },
        getTime(t, year) {
            let d = new Date(t);
            return year ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}` : `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        },

        avg() {
            return avg.apply(this, arguments)
        }
    }
});