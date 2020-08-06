//create module by create self invoked anynoums function
var budgetController = (function (){
    var a = 23;

    function add(x){
        return x+a;
    }

    return {
        publicTest: function(b){
            return add(b);
        }
    }
})();

var UIController = (function(){
    // do some code
})();


// create anther controller to can access budgetController and UIController
var controller = (function(bdgtCtrl,uiCtrl){
    var z = bdgtCtrl.publicTest(30);

    return {
        method1: function(){
            console.log(z);
        }
    }
})(budgetController, UIController);