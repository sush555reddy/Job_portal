var app = angular.module("myApp", ["ngRoute"]);
app.factory('authservice', function ($location) {
    return {
        checkUserStatus: function () {
            console.log("inside function");
            if (sessionStorage.loggedin == "false") {
                $location.url("/login");
            }
        }
    }
});
app.directive("navbar", function () {
    return {
        template: `  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
      aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-item nav-link active" href="#/">Home
          <span class="sr-only">(current)</span>
        </a>
        <a class="nav-item nav-link" href="#/login" ng-if="login">Login</a>
        <a class="nav-item nav-link" href="#/register" ng-if="register">Register</a>
        <a class="nav-item nav-link" href="#/addjob" ng-if="addjob">Add Job</a>
        <a class="nav-item nav-link" href="#/search" ng-if="search">Search</a>
        <a class="nav-item nav-link" href="#/logout" ng-if="logout">Logout</a>
      </div>
    </div>
  </nav>`
    };
});

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/main.htm",
            controller: "mainController"
        })
        .when("/login", {
            templateUrl: "views/login.htm",
            controller: "loginController"
        })
        .when("/register", {
            templateUrl: "views/register.htm",
            controller: "registerController"
        })
        .when("/logout", {
            templateUrl: "views/main.htm",
            controller: "logoutController"
        })
        .when("/search", {
            templateUrl: "views/search.htm",
            controller: "searchController"
        })
        .when("/company", {
            templateUrl: "views/company.htm",
            controller: "companyController"
        })
        .when("/addjob", {
            templateUrl: "views/addjob.htm",
            controller: "addjobController"
        })
        .when("/jobseeker", {
            templateUrl: "views/jobseeker.htm",
            controller: "jobseekerController"
        })
        .otherwise({
            templateUrl: "views/error.htm"
        });
});

app.controller("indexController", function ($scope) {

    $scope.$on('main', (event, obj) => {
        $scope.login = true;
        $scope.register = true;
        $scope.addjob = false;
        $scope.search = false;
        $scope.logout = false;
    });

    $scope.$on('login', (event, obj) => {
        $scope.login = false;
        $scope.register = true;
        $scope.addjob = false;
        $scope.search = false;
        $scope.logout = false;
    });

    $scope.$on('register', (event, obj) => {
        $scope.login = true;
        $scope.register = false;
        $scope.addjob = false;
        $scope.search = false;
        $scope.logout = false;
    });

    $scope.$on('jobseeker', (event, obj) => {
        $scope.login = false;
        $scope.register = false;
        $scope.addjob = false;
        $scope.search = true;
        $scope.logout = true;
    });

    $scope.$on('company', (event, obj) => {
        $scope.login = false;
        $scope.register = false;
        $scope.addjob = true;
        $scope.search = false;
        $scope.logout = true;
    });

    $scope.$on('search', (event, obj) => {
        $scope.login = false;
        $scope.register = false;
        $scope.addjob = false;
        $scope.search = false;
        $scope.logout = true;
    });

    $scope.$on('addjob', (event, obj) => {
        $scope.login = false;
        $scope.register = false;
        $scope.addjob = false;
        $scope.search = false;
        $scope.logout = true;
    });

});

app.controller("mainController", function (authservice, $scope, $location) {
    authservice.checkUserStatus();

    if (sessionStorage.usertype == "company") {
        $location.url('/company');
    } else if (sessionStorage.usertype == "jobseeker") {
        $location.url('/jobseeker');
    } else {
        $scope.$emit('main', {});
    }

});

app.controller('loginController', function ($scope, $http, $location) {
    $scope.$emit('login', {});

    $scope.login = function () {
        $http
            .post("http://localhost:3000/login", {
                loginform: $scope.userLogin
            })
            .then(function (res) {
                sessionStorage.loggedin = true;
                sessionStorage.username = res.data.username;
                if (res.data.usertype == "Company") {
                    sessionStorage.usertype = "company";
                    $location.url("/company");
                }
                else if (res.data.usertype == "Job seeker") {
                    sessionStorage.usertype = "jobseeker";
                    $location.url("/jobseeker");
                }
            })
            .catch(() => {
                console.log("login request failed");
            });
    };
});

app.controller("logoutController", function ($location) {
    sessionStorage.loggedin = false;
    sessionStorage.username = undefined;
    sessionStorage.usertype = undefined;
    $location.url('/');
});

app.controller('registerController', function ($scope, $http, $location) {

    $scope.$emit('register', {});

    $scope.loggedin = false;

    $scope.register = function () {
        $http
            .post("http://localhost:3000/register", {
                registerform: $scope.userReg
            })
            .then(function (res) {
                if (res.data == true) {
                    $location.url("/login");
                } else {
                    alert("registration failed");
                }
            })
            .catch(() => {
                console.log("reg request failed");
            });
    };




});

app.controller('addjobController', function (authservice, $scope, $http, $location) {
    authservice.checkUserStatus();
    $scope.$emit('addjob', {});

    $scope.addJob = function () {
        $http
            .post("http://localhost:3000/addjob", {
                postjob: $scope.jobform
            })
            .then(function (res) {
                if (res) {
                    $location.url("/company");
                } else {
                    alert("post failed");
                }
            })
            .catch(() => {
                console.log("post failed");
            });
    };
});

app.controller('companyController', function (authservice, $scope, $http) {
    authservice.checkUserStatus();
    $scope.$emit('company', {});

    $http
        .get("http://localhost:3000/jobs")
        .then(function (res) {
            $scope.jobs = res.data;
        });

});

app.controller('jobseekerController', function ($scope, $http, authservice) {
    authservice.checkUserStatus();
    $scope.$emit('jobseeker', {});
    $scope.username = sessionStorage.username;

    $http
        .get(`http://localhost:3000/users/${$scope.username}`)
        .then(function (res) {
            $scope.user = res.data;
        });

    $http
        .get("http://localhost:3000/jobs")
        .then(function (res) {
            $scope.jobs = res.data;
        });

    $scope.save = function (event) {
        var id = event.target.id;
        $http.get(`http://localhost:3000/save/${id}/${$scope.username}`).then(function (res) {
            if (res.data) {
                $scope.user = res.data;
            }
        }).catch((err) => {
            console.log(err);
        })

    }

    $scope.apply = function (event) {
        var id = event.target.id;
        $scope.username = sessionStorage.username;
        $http.get(`http://localhost:3000/apply/${id}/${$scope.username}`).then(function (res) {
            $scope.user = res.data;
        }).catch((err) => {
            console.log(err);
        })

    }

});

app.controller('searchController', function ($scope, $http, authservice) {
    authservice.checkUserStatus();
    $scope.$emit('search', {});
    $scope.username = sessionStorage.username;
    $scope.reset = function () {
        $http
            .get("http://localhost:3000/jobs")
            .then(function (res) {
                if (res.data) {
                    $scope.jobs = res.data;
                }
            });
    }
    $scope.reset();

    $scope.getSavedJobs = function (event) {
        $http.get(`http://localhost:3000/savedjobs/${$scope.username}`).then(function (res) {
            if (res.data) {
                $scope.jobs = res.data;
                // $scope.applied = false;
                // $scope.saved = true;
            }
        }).catch((err) => {
            console.log(err);
        })

    }

    $scope.getAppliedJobs = function (event) {
        $http.get(`http://localhost:3000/appliedjobs/${$scope.username}`).then(function (res) {
            if (res.data) {
                $scope.jobs = res.data;
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    
    

    $scope.search = function () {
        $scope.search.title==""?$scope.search.title=undefined:$scope.search.title=$scope.search.title;
        $scope.search.keyword==""?$scope.search.keyword=undefined:$scope.search.keyword=$scope.search.keyword;
        $scope.search.location==""?$scope.search.location=undefined:$scope.search.location=$scope.search.location;
        
        $http.get(`http://localhost:3000/search/${$scope.search.title}/${$scope.search.keyword}/${$scope.search.location}`).then(function(res){
            $scope.jobs = res.data;
        }).catch(err=>console.log(err))
    }

});