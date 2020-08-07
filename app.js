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

    Expense.prototype.getPercentage = function () {
        return this.percentage;
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
    };

    var calcPercentages = function () {
        var percentages = [];

        //calc percentage for each item
        percentages = data.allItems.exp.map(function (cur) {
            if (data.totals.inc > 0) {
                cur.percentage = Math.round((cur.value / data.totals.inc) * 100);
            } else {
                cur.percentage = -1;
            }
            return cur.percentage;
        });

        return percentages;
    };

    return {
        addItem: function (obj) {
            var item, id, len;

            len = data.allItems[obj.type].length;
            len > 0 ? id = data.allItems[obj.type][len - 1].id + 1 : id = 0;

            if (obj.type === 'exp')
                item = new Expense(id, obj.description, obj.value);
            else if (obj.type === 'inc')
                item = new Income(id, obj.description, obj.value);

            calcTotal(obj.type, obj.value);
            return addItemToData(obj.type, item);
        },

        delItem: function (type, id) {
            var value, itemIndex = -1;
            // get index of item which should delete
            data.allItems[type].map(function (cur, index) {
                if (cur.id === id) {
                    itemIndex = index;
                    value = cur.value;
                }
            })

            // validate id is in array
            if (itemIndex !== -1) {
                // decrease total 
                value = -1 * value;
                calcTotal(type, value);
                // remove item from datastructure
                data.allItems[type].splice(itemIndex, 1);
            }
        },

        updateBudget: function () {
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }

            return getBudget();
        },


        testing: function () {
            console.log(data);
        },

        updatePercentages: function () {
            // calc percentages 
            return calcPercentages();
            // return items to pass it to ui
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
        itemPercetageLabel: '.item__percentage',

    };

    var updateNodeList = function (list, percentages) {
        list.forEach(function (el, index) {
            el.textContent = formatPercentage(percentages[index]);
        })
    };

    var formatNum = function (value, type) {
        var sign, numArr, int, fra;
        type === 'inc' ? sign = '+ ' : sign = '- ';

        // remove default negitive sign
        value < 0 ? value *= -1 : '';

        // 2 fixed fraction -> 12.34
        value = value.toFixed(2); // toFixed return string

        //+ 12,236
        numArr = value.split('.'); //12345.67 [12345,67]
        int = numArr[0];
        fra = numArr[1];

        int.length > 3 ? int = int.slice(0, int.length - 3) + ',' + int.slice(length - 3) : '';
        value = int + '.' + fra;

        // add + or - sign
        value = sign + value;
        return value;
    };

    var formatPercentage = function (value) {
        return value === -1 ? value = '---' : value = value + '%';
    };

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
                <div class="right clearfix"><div class="item__value">${formatNum(item.value, type)}</div>
                <div class="item__delete"><button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i></button></div></div></div>`;

                selector = DOMStrings['incList'];
            } else if (type === 'exp') {
                html = `<div class="item clearfix" id="${type}-${item.id}">
                <div class="item__description">${item.description}</div>
                <div class="right clearfix">
                <div class="item__value">${formatNum(item.value, type)}</div>
                <div class="item__percentage">${item.percentage}%</div>
                <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;

                selector = DOMStrings['expList'];
            }

            document.querySelector(selector).insertAdjacentHTML('beforeend', html);
        },

        delListItem: function (type, id) {
            var el;
            el = document.getElementById(type + '-' + id);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (obj) {
            // obj {budget, totalinc, totalexp, percentage}
            var type;
            obj.budget > 0 ? type = 'inc' : 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNum(obj.budget, type);
            document.querySelector(DOMStrings.incLabel).textContent = formatNum(obj.inc, 'inc');
            document.querySelector(DOMStrings.expLabel).textContent = formatNum(obj.exp, 'exp');
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

        displayPercentages: function (percentages) {
            var elements;
            elements = document.querySelectorAll(DOMStrings.itemPercetageLabel); // return  nodelist

            updateNodeList(elements, percentages);
        },

        // change outline based on type
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

            // 5. re calculate items Percentages & display it
            updatePercentages();
        }

    };

    var ctrlDelItem = function (event) {
        var itemID, ID, type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //inc-0 or exp-0
        if (itemID) {
            // validate id first
            // 1. extract type from string id
            itemID = itemID.split('-');
            type = itemID[0];
            ID = parseInt(itemID[1]);

            // 2. delete item from budget controller
            bdgtCtrl.delItem(type, ID);

            // 3. calc budget and display it 
            updateBuget();

            // 4. delete item form ui list
            uiCtrl.delListItem(type, ID);

            // 5. re calculate items Percentages & display it
            updatePercentages();
        }
    };

    var setupEventListeners = function () {

        // enter input event linsteners
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // change type listener
        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);

        // delete item listern
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);
    }


    // helper functions ----------------------------------------------------------------

    var updateBuget = function () {
        var budgetData = bdgtCtrl.updateBudget();
        uiCtrl.displayBudget(budgetData);
    };

    var updatePercentages = function () {
        // calc persentages & get arr pf percentages from budget controller
        var persentages = bdgtCtrl.updatePercentages();
        // display percentages
        uiCtrl.displayPercentages(persentages);
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
