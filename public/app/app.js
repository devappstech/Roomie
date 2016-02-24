var myApp = angular.module('roomie', ['roomie.auth', 'roomie.services', 'roomie.main', 'roomie.contact', 'roomie.angularfireChatController', 'roomie.angularfireProfileController', 'roomie.angularfireChatFactory', 'roomie.angularfireUsersFactory', 'roomie.angularfireChannelsController', 'angularfireChannelsFactory', 'ui.router', 'ngMaterial', 'ngAria', 'ngAnimate', 'ngMessages', 'angular-md5', 'firebase'])
  .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        templateUrl: 'app/auth/login.html',
        url: '/',
        controller: 'AuthController'
      })
      .state('signin', {
        templateUrl: 'app/auth/login.html',
        url: '/login',
        controller: 'AuthController'
      })
      .state('signup', {
        templateUrl: 'app/auth/signup.html',
        url: '/signup',
        controller: 'AuthController'
      })
      .state('contact', {
        templateUrl: 'app/contact/contact.html',
        url: '/contact',
        controller: 'ContactController',
        resolve: {
          profile: function($state, Auth, Users){
            return Auth.auth.$requireAuth().then(function(auth){
              console.log('attempting to resolve channels.profile promise...');

              return Users.getProfile(auth.uid).$loaded().then(function(profile){
                console.log('channels.profile promise was able to resolve the getProfile...');
                console.log('profile: ', profile);
                if (profile.displayName){
                  console.log('returning the profile!')
                  return profile;
                } else {
                  console.log('user has no displayName so heading to PROFILE');
                  $state.go('profilepage');
                }
              });
            }, function(error){
              //if one cannot is not authenticated... change state to 'home'
              console.log('User is not Authenticated so we cannot get her profile. Heading to HOME');
              $state.go('signin');

            });
          }
        },
        authenticate: true
      })
      .state('main', {
        templateUrl: 'app/main/main.html',
        url: '/main',
        controller: 'MainController',
        authenticate: true
      })
      .state('profilepage', {
        templateUrl: 'app/profile/profilepage.html',
        url: '/profilepage',
        controller: 'ProfileCtrl as profileCtrl',
        resolve: {
          auth: function($state, Users, Auth){
            console.log('PROFILE: checking if the user is authenticated...');
            return Auth.auth.$requireAuth().catch(function(){
              console.log('user is NOT authenticated so we are going HOME');
              $state.go('signin');
            });
          },
          profile: function (Users, Auth) {
            console.log('getting the users profile...');
            return Auth.auth.$requireAuth().then(function(auth){
              console.log('getting the users profile...', auth);
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('channels', {
        templateUrl: 'app/chat/channels/index.html',
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        resolve: {
          channels: function(Channels) {
            return Channels.$loaded();
          },
          profile: function($state, Auth, Users){
            return Auth.auth.$requireAuth().then(function(auth){
              console.log('attempting to resolve channels.profile promise...');

              return Users.getProfile(auth.uid).$loaded().then(function(profile){
                console.log('channels.profile promise was able to resolve the getProfile...');
                console.log('profile: ', profile);
                if (profile.displayName){
                  console.log('returning the profile!')
                  return profile;
                } else {
                  console.log('user has no displayName so heading to PROFILE');
                  $state.go('profilepage');
                }
              });
            }, function(error){
              //if one cannot is not authenticated... change state to 'home'
              console.log('User is not Authenticated so we cannot get her profile. Heading to HOME');
              $state.go('signin');

            });
          }
        },
        authenticate: true
      })
      .state('channels.create', {
        templateUrl: 'app/chat/channels/create.html',
        url: '/create',
        controller: 'ChannelsCtrl as channelsCtrl',
        authenticate: true
      })
      .state('channels.messages', {
        templateUrl: 'app/chat/channels/messages.html',
        url: '/{channelId}/messages',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function ($stateParams, Messages) {
            console.log('looking for the messages in channel! ', Messages);
            return Messages.forChannel($stateParams.channelId).$loaded();
          },
          channelName: function ($stateParams, channels) {
            console.log('looking for the channels! ', channels);
            return '#' + channels.$getRecord($stateParams.channelId).name;
          }
        },
        authenticate: true
      })
      .state('channels.direct', {
        templateUrl: 'app/chat/channels/messages.html',
        url: '/{uid}/messages/direct',
        controller: 'MessagesCtrl as messagesCtrl',
        resolve: {
          messages: function ($stateParams, Messages, profile) {
            console.log('looking for the messages in direct! ', Messages);
            return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
          },
          channelName: function($stateParams, Users) {
            return Users.all.$loaded().then(function() {
                return '@' + Users.getDisplayNames($stateParams.uid);
            });
          }
        },
        authenticate: true
      });

    $httpProvider.interceptors.push('AttachTokens');
  })
  .factory('AttachTokens', function($window) {

    var attach = {
      request: function(object) {
        var jwt = $window.localStorage.getItem('com.roomie');
        if (jwt) {
          object.headers['x-access-token'] = jwt;
        }
        object.headers['Allow-Control-Allow-Origin'] = '*';
        return object;
      }
    };
    return attach;
  })
  .run(function($rootScope, $state, Auth) {
    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams, error) {
      if (toState && toState.authenticate && !Auth.isAuth()) {
        evt.preventDefault();
        $state.go('signup');
      }
    });
  })
  .constant('FirebaseUrl', 'https://instaroomie.firebaseio.com/');
