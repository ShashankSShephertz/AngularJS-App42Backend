 
 App42.initialize("API_KEY","SECRET_KEY");
 var dbName = "todolist",
 colName = "angularTodos";
 
function Register ($scope,$injector) {
      $scope.word = /^\s*\w*\s*$/;
       $scope.setComponent = function(val){
        $scope.component = val;
    }
	$scope.registerUser = function(){
		var userName = $scope.registerForm.input.$viewValue,
		email = $scope.registerForm.email.$viewValue,
		password = $scope.registerForm.password.$viewValue;
		showLoading();
		new App42User().createUser(userName,password,email,{
			success:function(object){
				console.log(object)
				hideLoading();
				$scope.$emit('registerComplete',"registerComplete");
			},
			error:function(error){
                hideLoading();				
				var errorObj = JSON.parse(error)
				 var message = errorObj.app42Fault.details;
				 alert(message);
			}
		})
	};
 }
 
 function Login ($scope) {
     $scope.word = /^\s*\w*\s*$/;
	 
	$scope.setComponent = function(val){
	$scope.component = val;
	$scope.val = true;
	}
	
	$scope.$on('registerComplete', function() {
	$scope.component = "todo"
	
	$scope.show = {
			 register: false,
			 todo: false,
			 login: false,
			 logout: true
		 }
		 $scope.$apply()
	});
	
	$scope.$on('logoutComplete', function() {
	$scope.component = "login"
	
	$scope.show = {
			 register: true,
			 todo: false,
			 login: false,
			 logout: false
		 }
		 $scope.$apply()
	});
	
	$scope.$on('loginComplete', function() {
	$scope.component = "todo"
	
	$scope.show = {
			 register: false,
			 todo: false,
			 login: false,
			 logout: true
		 }
		 $scope.$apply()
	});
	
	if(localStorage._App42_SessionId != undefined){
	 $scope.component = "todo"	
	 if($scope.component == "todo"){
		$scope.show = {
			 register: false,
			 todo: false,
			 login: false,
			 logout: true
		 }
		}
	}else{
	  $scope.component = "login"
      $scope.show = {
			 register: true,
			 todo: false,
			 login: false,
			 logout: false
		 }	  
	}
	
	$scope.setActive = function(t){
	if($scope.component == "login"){
	$scope.show = {
			 register: true,
			 todo: false,
			 login: false,
			 logout: false
		 }
	}
	if($scope.component == "register"){
	$scope.show = {
			 register: false,
			 todo: false,
			 login: true,
			 logout: false
		 }
	}
	}
	$scope.login = function() {
	   var userName = $scope.myForm.input.$viewValue,
		password = $scope.myForm.password.$viewValue;
		showLoading();
	   new App42User().authenticate(userName,password,{
	   success:function(object){
			 hideLoading();
			 $scope.$emit('loginComplete',"loginComplete");
			 
			},
			error:function(error){
			  hideLoading();
			 var errorObj = JSON.parse(error)
			 var message = errorObj.app42Fault.details;
			 alert(message);
			}
	   })
   };
   $scope.logout = function() {
   showLoading();
   new App42User().logout(localStorage._App42_SessionId,{
   success:function(object){
		  $scope.$emit('logoutComplete',"logoutComplete");
		  hideLoading();
		},
		error:function(error){
		 hideLoading();
		 var errorObj = JSON.parse(error)
		 var message = errorObj.app42Fault.details;
		 alert(message);
		}
   })
   };
 }
 

 function TodoCtrl($scope) {
  getTodoList($scope);
  $scope.todos = [];
 
  $scope.$on('getTodoComplete', function(val,todoObj) {
	for (var i=0; i < todoObj.length; i++){
		$scope.todos.push(todoObj[i]);
		$scope.$apply()
	}
  })
  $scope.addTodo = function() {
   var todotext = $scope.addNew.addTodo.$viewValue   
   $scope.todos.push({text:todotext, done:false});
	
    var json  = JSON.stringify({text:todotext, done:false});
	$scope.todoText = '';
	addTodoList(json);
	console.log("dd")
  };
 
 $scope.updateTodo = function(val,state) {
   var newJSON = JSON.stringify({text:val, done:state});
	updateTodoList(val,newJSON);
  };
  
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
}

function getTodoList($scope){
	showLoading();
	new App42Storage().findAllDocuments(dbName,colName,{
		success:function(object){
			var storageObj = JSON.parse(object)
			var toList = storageObj.app42.response.storage.jsonDoc
			$scope.$emit('getTodoComplete',toList);
			hideLoading();
		},
		error:function(error){
			hideLoading();
			alert("You have not created any todo yet.")
		}
	})
}

function addTodoList(json){
	showLoading();
	new App42Storage().insertJSONDocument(dbName,colName,json,{
			success:function(object){
			var storageObj = JSON.parse(object)
			var toList = storageObj.app42.response.storage.jsonDoc
			accessDenied(toList._id.$oid)
			hideLoading();
			},
			error:function(error){
				hideLoading();
				alert("Please check your internet connection.")
			}
		})
}

function updateTodoList(val, newJson){
	showLoading();
	new App42Storage().updateDocumentByKeyValue(dbName,colName,"text",val,newJson,{
			success:function(object){
			hideLoading();
			},
			error:function(error){
				hideLoading();
				alert("Please check your internet connection.")
			}
		})
}
function accessDenied(docId){
var aclList = new Array();
    var point={
        user:"PUBLIC",
        permission:Permission.READ
    };
    aclList.push(point)
    new App42Storage().revokeAccessOnDoc(dbName,colName,docId, aclList,{
        success: function(object) {
        },
        error: function(error) {
        }
    });
}
function showLoading(){
 document.getElementById("loading-indicator").style.display = "block"
}
function hideLoading(){
 document.getElementById("loading-indicator").style.display = "none"
}
