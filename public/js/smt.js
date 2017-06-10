/**
 * Created by bjwsl-001 on 2017/5/22.
 */
var app = angular.module('smtApp', ['ionic']);

//配置状态
app.config(function ($stateProvider, $urlRouterProvider,
                     $ionicConfigProvider) {
    //将选项卡固定在页面底部（Android默认在上边）
    $ionicConfigProvider.tabs.position('bottom');
    $stateProvider
        .state('start', {
            templateUrl: 'tpl/start.html',
            url: '/smtStart'
        })
        .state('main', {
            templateUrl: 'tpl/main.html',
            url: '/smtMain',
            controller: 'mainCtrl'
        })
        .state('detail', {
            templateUrl: 'tpl/detail.html',
            url: '/smtDetail/:id',
            controller: 'detailCtrl'
        })
        .state('order', {
            templateUrl: 'tpl/order.html',
            url: '/smtOrder/:detail',
            controller: 'orderCtrl'
        })
        .state('myOrder', {
            templateUrl: 'tpl/myOrder.html',
            url: '/smtMyOrder',
            controller: 'myOrderCtrl'
        })
        .state('settings', {
            templateUrl: 'tpl/settings.html',
            url: '/smtSettings',
            controller: 'settingsCtrl'
        })
        .state('cart', {
            templateUrl: 'tpl/cart.html',
            url: '/smtCart',
            controller: 'cartCtrl'
        })
    $urlRouterProvider.otherwise('/smtStart');
})

//创建父控制器
app.controller('parentCtrl', ['$scope', '$state',
    function ($scope, $state) {
        $scope.jump = function (desState, params) {
            console.log(' jump func is called ');
            $state.go(desState, params);
        }
    }
]);


//创建mainCtrl控制器
app.controller('mainCtrl', ['$scope', '$http', '$ionicScrollDelegate',
    function ($scope, $http,$ionicScrollDelegate) {
        //是否有更多数据可以加载
        $scope.hasMore = true;
        $scope.dishList = [];
        //发起网络请求，初始化一些数据
        $http
            .get('/smtMain')
            .success(function (data) {
                console.log(data);
                $scope.dishList = data;
            });
        //加载更多的方法
        $scope.loadMore = function () {
            $http.get('/smtMain/' + $scope.dishList.length)
                .success(function (data) {
                    if (data.length < 5) {
                        $scope.hasMore = false;
                    }
                    $scope.dishList = $scope.dishList.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
        }
        //返回顶部的方法
        $scope.toTop=function(){
            $ionicScrollDelegate.scrollTop(true);
        }
        //监听用户的输入 搜索 将结果显示出来
        $scope.inputTxt = {kw: ''};
        $scope.$watch('inputTxt.kw', function () {
            if ($scope.inputTxt.kw.length > 0) {
                $http.get('/Search?kw=' + $scope.inputTxt.kw)
                    .success(function (data) {
                        if (data.length > 0) {
                            $scope.dishList = data;
                        }
                    })
            }
        })
    }
])

app.controller('detailCtrl',
    ['$scope', '$stateParams', '$http', '$ionicPopup',
        function ($scope, $stateParams, $http, $ionicPopup) {
            console.log($stateParams);
            var did = $stateParams.id;
            $http.get('/myDetail/' + did)
                .success(function (data) {
                    console.log(data);
                    $scope.dish = data[0];
                })
            //添加到购物车
            $scope.addToCart = function () {
                $http
                    .get('/addCart?uid=1&did=' + did)
                    .success(function (data) {
                        console.log(data);
                        if (data.msg == 'succ') {
                            $ionicPopup.alert({
                                template: '添加成功'
                            });
                        }
                        else {
                            $ionicPopup.alert({
                                template: '添加失败'
                            });
                        }
                    })
            }
        }
    ])

app.controller('orderCtrl', ['$scope', '$http', '$stateParams', '$httpParamSerializerJQLike',
    function ($scope, $http, $stateParams, $httpParamSerializerJQLike) {

        //反序列化：json格式的字符串 对象或者数组
        var cartList = angular.fromJson($stateParams.detail);
        console.log(cartList);
        console.log($stateParams.id)
        var totalPrice = 0;
        angular.forEach(cartList, function (value,key) {
            console.log(value);
            totalPrice+=(value.dishCount*value.price);
        })
        console.log(totalPrice);
        $scope.orderInfo = {
            totalprice:totalPrice,
            cartDetail:$stateParams.detail,
            userid:1,
            //did: $stateParams.id,
            user_name: '',
            sex: 1,
            addr: '',
            phone: ''
        };
        $scope.submitOrder = function () {
            var str = $httpParamSerializerJQLike($scope.orderInfo);
            console.log(str);
            $http.post('/addOrder',str)
                .success(function (data) {
                    //  根据服务器返回的结果对表单处理
                    console.log(data)
                    if (data.msg == 'succ') {
                            $scope.result = "下单成功，订单编号为" + data.oid;
                            //将手机号存在本地，作为识别当前用户的标识
                            sessionStorage.setItem('phone', $scope.orderInfo.phone);
                        }
                        else {
                            $scope.result = "下单失败";
                        }


                })

        }

    }
])


app.controller('myOrderCtrl', ['$scope', '$http',
    function ($scope, $http) {
        var phone = sessionStorage.getItem('phone');
        console.log(phone);
        $http
            .get('data/order_getbyphone.php?phone=' + phone)
            .success(function (data) {
                console.log(data);
                $scope.orderList = data;
            })
    }
]);

app.controller('settingsCtrl', ['$scope', '$ionicModal',
    function ($scope, $ionicModal) {

        //得到模态框对应的实例
        $ionicModal
            .fromTemplateUrl('tpl/about.html', {
                scope: $scope
            })
            .then(function (data) {
                $scope.modal = data;
            })

        //通过$ionicModal显示一个自定义模态窗
        $scope.show = function () {
            $scope.modal.show();
        }
        //关闭模态窗
        $scope.hide = function () {
            console.log('hide func is called');
            $scope.modal.hide();
        }
    }
]);

app.controller('cartCtrl', ['$scope', '$http','$httpParamSerializerJQLike',
    function ($scope, $http,$httpParamSerializerJQLike) {
        $scope.flagEdit = false;
        $scope.cart = [];
        $scope.showMsg = '编辑';
        $http
            .get('/getCart?uid=1')
            .success(function (result) {
                $scope.cart = result;
            })

        $scope.sumAll = function () {
            var totalPrice = 0;
            for (var i = 0; i < $scope.cart.length; i++) {
                var obj = $scope.cart[i];
                totalPrice += (obj.price * obj.dishCount);
            }
            console.log(totalPrice);
            return totalPrice;
        }

        $scope.funcEdit = function () {
            $scope.flagEdit = !$scope.flagEdit;
            if ($scope.flagEdit) {
                $scope.showMsg = '完成';
            }
            else {
                $scope.showMsg = '编辑';
            }
        }

        //封装一个方法：更新服务器购物车中产品的数量
        var updateCart = function (did, count) {
            var str={uid:1,did1:did,count1:count}
           var reuslt= $httpParamSerializerJQLike(str)
            //console.log(reuslt)
                //.get('data/cart_update.php?uid=1&did=' + did + "&count=" + count)
           $http.post('/updateCart',reuslt)
                .success(function (result) {
                    console.log(result);
                })
        }

        //点击了购物车减少按钮
        $scope.minus = function (index) {
            if ($scope.cart[index].dishCount == 1) {
                return
            }
            $scope.cart[index].dishCount--;
            updateCart($scope.cart[index].did,
                $scope.cart[index].dishCount);
        }
        //点击了购物车的增加按钮
        $scope.add = function (index) {
            $scope.cart[index].dishCount++;
            updateCart($scope.cart[index].did,
                $scope.cart[index].dishCount);
        }

        //json的序列化以及传参
        $scope.send = function () {
            //序列化
            var result = angular.toJson($scope.cart);
            console.log(result);
            //跳转到表单提交页
            $scope.jump('order',{detail:result});
        }
    }
]);


