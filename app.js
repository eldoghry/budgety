//create module by create self invoked anynoums function
var budgetController = (function (){
    //TODO
})();

var UIController = (function(){
    //TODO
})();


// create anther controller to can access budgetController and UIController
var controller = (function(bdgtCtrl,uiCtrl){
    //TODO
})(budgetController, UIController);