let express = require('express');
let app = express();
let path = require('path');

// tempOrders
let orders = []

function generateOrders() {
    setInterval(function() {
        let side = parseInt(Math.random() * 10) % 2 ? 'ask' : 'bid';
        let price = (50.0 + Math.random() * 180).toFixed(1);
        let quantity = Math.floor(Math.random() * (15 + 1));
        let time = new Date().getTime();
        let obj = {
            number: orders.length + 1,
            side,
            price,
            quantity,
            time
        };

        orders.push(obj);
    }, 1000)
}

generateOrders();
// static router


app.use("/example", function(req, res){
    res.sendFile(path.join(__dirname+'/static/example.html'));
})

// Get Orders List
app.use("/api/getOrders", function(req, res) {
    let start = req.query.start || (orders.length - 20 < 0 ? 0 : orders.length - 20);
    let size = req.query.size || 20;

    if(start < 0 || size < 1){
        res.send('request params error');
        return;
    }
    let end = start + size;
    res.json(orders.slice(start, end));

})

// reset Orders
app.use('/api/reset', function(req, res) {
    orders = [];
    res.send('Orders has reseted')
})

app.use(express.static(`${__dirname}/static/`));
app.use('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/static/index.html'));
});

app.listen(8080, function(){
    console.log('Start Fe Interview Service on 8080')
})