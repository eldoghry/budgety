//create module by create self invoked anynoums function
var budgetController = (function () {

    // 1. Create suitable data structure
    // Item datatype

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1
    }

    var addItemToData = function (type, item) {
        data.allItems[type].push(item);
        return item;
    }

    var calcTotal = function (type, value) {
        data.totals[type] += value;
    }

    var getBudget = function () {
        return {
            budget: data.budget,
            inc: data.totals.inc,
            exp: data.totals.exp,
            percentage: data.percentage,
        }
    }

    return {
        addItem: function (obj) {
            var item, id, len;

            len = data.allItems[obj.type].length;
            len > 0 ? id = data.allItems[obj.type][len - 1].id + 1 : id = 0;

            if (obj.type === 'exp')
                item = new Expense(id, obj.description, obj.value);
            else if (obj.type === 'inc')
                item = new Income(id, obj.description, obj.value);

            calcTotal(obj.type,obj.value);
            this.testing();
            return addItemToData(obj.type, item);
        },

        delItem: function(type,id){
            var value, itemIndex = -1;
            // get index of item which should delete
            data.allItems[type].map(function(cur,index){
                if (cur.id === id){
                    itemIndex = index;
                    value = cur.value;
                }
            })

            // validate id is in array
            if(itemIndex !== -1){
                // decrease total 
                value = -1 * value;
                calcTotal(type,value);
                // remove item from datastructure
                data.allItems[type].splice(itemIndex,1);
                this.testing();
            }
        },

        updateBudget: function () {
            data.budget = data.totals.inc - data.totals.exp;

            if (data.budget > 0) {
                data.percentage = Math.round((data.totals.exp / data.budget) * 100);
            }

            return getBudget();
        },


        testing: function () {
            console.log(data);
        }
    }



})();

var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        container: '.container',
        incList: '.inc__list',
        expList: '.exp__list',
        itemBtn: '.item__delete--btn',
        budgetLabel: '.budget__value',
        incLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        dateLabel: '.budget__title--month',

    }

    return {
        getDOMStrings: function () {
            return DOMStrings;
        },

        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fields.forEach(function (current) {
                current.value = '';
            })

            document.querySelector(DOMStrings.inputDescription).focus();
        },

        getItem: function () {
            var item = {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }

            return item;
        },

        addListItem: function (item, type) {
            //TODO
            var html, selector;
            if (type === 'inc') {
                html = `<div class="item clearfix" id="${type}-${item.id}">
                <div class="item__description">${item.description}</div>
                <div class="right clearfix"><div class="item__value">${item.value}</div>
                <div class="item__delete"><button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i></button></div></div></div>`;

                selector = DOMStrings['incList'];
            } else if (type === 'exp') {
                html = `<div class="item clearfix" id="${type}-${item.id}">
                <div class="item__description">${item.description}</div>
                <div class="right clearfix">
                <div class="item__value">${item.value}</div>
                <div class="item__percentage">${item.percentage}%</div>
                <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;

                selector = DOMStrings['expList'];
            }

            document.querySelector(selector).insertAdjacentHTML('beforeend', html);
        },

        delListItem(type,id){
            var el;
            el = document.getElementById(type+'-'+id);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (obj) {
            // obj {budget, totalinc, totalexp, percentage}
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incLabel).textContent = obj.inc;
            document.querySelector(DOMStrings.expLabel).textContent = obj.exp;
            if (obj.budget > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayDate: function (date) {
            var year, month, months;

            year = date.getFullYear();
            month = date.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' of ' + year;
        },

        changeType: function () {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fields.forEach(function (current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    }
})();


// create anther controller to can access budgetController and UIController
var controller = (function (bdgtCtrl, uiCtrl) {

    var DOM = uiCtrl.getDOMStrings();
    var now = new Date();
    
    // controll functions ----------------------------------------------------------------

    var ctrlAddItem = function () {
        //1. get input from ui 
        var input = uiCtrl.getItem(); //{type,description,value}

        //validate input before adding it
        if (input.description !== '' && input.value > 0 && input.value != '') {
            //2. save item into datastructure
            var newItem = bdgtCtrl.addItem(input);

            // 4. display items list
            uiCtrl.addListItem(newItem, input.type);

            // 3. clear fields
            uiCtrl.clearFields();

            //4. calc budget & display it
            updateBuget();
        }

    };

    var ctrlDelItem = function(event){
        var itemID, ID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //inc-0 or exp-0
        if(itemID){
            // validate id first
            // 1. extract type from string id
            itemID = itemID.split('-');
            type = itemID[0];
            ID= parseInt(itemID[1]);
        
            // 2. delete item from budget controller
            bdgtCtrl.delItem(type,ID);

            // 3. calc budget and display it 
            updateBuget();
            
            // 4. re calculate items Percentages
            
            // 4. delete item form ui list
            uiCtrl.delListItem(type, ID);
        }        
    };

    var setupEventListeners = function () {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);
    }

    
    // helper functions ----------------------------------------------------------------

    var updateBuget = function(){
        var budgetData = bdgtCtrl.updateBudget();
        uiCtrl.displayBudget(budgetData);
    };

    return {
        init: function () {
            console.log("Application Has Started")
            uiCtrl.displayBudget({
                budget: 0,
                inc: 0,
                exp: 0,
                percentage: -1
            });

            uiCtrl.displayDate(now);
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();
