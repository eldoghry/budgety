//create module by create self invoked anynoums function
var budgetController = (function () {

    // 1. Create suitable data structure
    // Item datatype

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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

    var addItem = function (type, item) {
        data.allItems[type].push(item);
        calcTotal(type, item.value);

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
        createItem: function (obj) {
            // validate input first
            if (obj.description !== '' && obj.value > 0 && obj.value !== '') {
                var item, id, len;

                len = data.allItems[obj.type].length;
                if (len > 0) {
                    id = data.allItems[obj.type][len - 1].id + 1;
                } else {
                    id = 0;
                }

                if (obj.type === 'exp') {
                    item = new Expense(id, obj.description, obj.value);
                } else if (obj.type === 'inc') {
                    item = new Income(id, obj.description, obj.value);
                }

                return addItem(obj.type, item);
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

        clearFields: function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fields.forEach(function(current){
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

        addListItem: function(obj,type){
            //TODO
            console.log(obj);
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

        changeType: function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fields.forEach(function(current){
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

    var ctrlAddItem = function () {

        //1. get input from ui 
        var input = uiCtrl.getItem(); //{type,description,value}
        // console.log(input)

        //2. save item into datastructure
        var newItem = bdgtCtrl.createItem(input);
        
        // 4. display items list
        uiCtrl.addListItem(newItem, input.type);

        // 3. clear fields
        uiCtrl.clearFields();

        //4. calc budget
        var budgetData = bdgtCtrl.updateBudget();
        //bdgtCtrl.testing()

        //4. update ui
        uiCtrl.displayBudget(budgetData);

    }

    var setupEventListeners  = function () {

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if( event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changeType);
        
    }

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
