'use strict';

angular.module('esn.avatar', ['mgcrea.ngStrap', 'ngAnimate'])

  .controller('avatarEdit', function($rootScope, $scope, selectionService, avatarAPI, $alert) {

    $scope.initUploadContext = function() {
      $scope.uploadError = false;
      $scope.progress = 0;
      $scope.status = 'Upload';
      $scope.uploading = false;
    };

    $scope.preview = false;

    $scope.send = function(blob, mime) {
      $scope.uploading = true;
      avatarAPI.uploadAvatar(blob, mime).then(function() {
        $scope.progress = 100;
        $scope.uploading = false;
        $scope.status = 'Upload';
      }, function() {
        $scope.uploadError = true;
        $scope.uploading = false;
        $scope.status = 'Upload';
      });
    };

    $scope.upload = function() {

      $scope.uploading = true;
      $scope.status = 'Uploading';
      $scope.progress = 1;

      var image = selectionService.getImage();
      var ratio = selectionService.selection.ratio || 1;
      var selection = selectionService.selection.cords;
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      if (selection.w === 0 || selection.h === 0) {
        canvas.width = 128;
        canvas.height = 128;
        context.drawImage(image, 0, 0, 128, 128);
      } else {
        canvas.width = selection.w * ratio;
        canvas.height = selection.h * ratio;
        context.drawImage(image, selection.x * ratio, selection.y * ratio, selection.w * ratio, selection.h * ratio, 0, 0, canvas.width, canvas.height);
      }

      var mime = 'image/png';
      canvas.toBlob(function(blob) {
        $scope.send(blob, mime);
      }, mime);
    };

    $rootScope.$on('crop:loaded', $scope.initUploadContext);

    $rootScope.$on('crop:error', function(context, error) {
      if (error) {
        $alert({
          title: 'Error',
          content: error,
          type: 'danger',
          show: true,
          position: 'bottom',
          container: '#error',
          duration: '3',
          animation: 'am-fade'
        });
      }
    });

    $rootScope.$on('crop:loaded', function() {
      $scope.preview = true;
      $scope.$apply();
    });

    $scope.initUploadContext();

  }).factory('avatarAPI', function($http) {

    function uploadAvatar(blob, mime) {
      return $http({
        method: 'POST',
        url: '/api/user/profile/avatar',
        headers: {'Content-Type': mime},
        data: blob,
        params: {mimetype: mime, size: blob.size},
        withCredentials: true
      });
    }

    return {
      uploadAvatar: uploadAvatar
    };

  }).factory('selectionService', function($rootScope) {

  var sharedService = {};
  sharedService.image = null;
  sharedService.selection = {};
  sharedService.error = null;

  sharedService.setImage = function(image) {
    this.image = image;
    $rootScope.$broadcast('crop:loaded');
  };

  sharedService.getImage = function() {
    return this.image;
  };

  sharedService.getError = function() {
    return this.error;
  };

  sharedService.setError = function(error) {
    this.error = error;
    $rootScope.$broadcast('crop:error', error);
  };

  sharedService.broadcastSelection = function(x) {
    this.selection = x;
    $rootScope.$broadcast('crop:selected', x);
  };

  return sharedService;

}).directive('imgPreview', function(selectionService) {

  return {
    restrict: 'A',
    replace: true,
    link: function($scope, element) {
      $scope.$on('crop:selected', function(context, data) {

        var selection = data.cords;
        var ratio = data.ratio || 1;

        var img = selectionService.getImage();
        var canvas = element[0];
        canvas.width = canvas.height = 128;

        var ctx = canvas.getContext('2d');
        if (Math.round(selection.w * ratio) < 128 || Math.round(selection.h * ratio) < 128) {
          ctx.drawImage(img, 0, 0, 128, 128);
        } else {
          ctx.drawImage(img, selection.x * ratio, selection.y * ratio, selection.w * ratio, selection.h * ratio, 0, 0, canvas.width, canvas.height);
        }
      });
    }
  };
}).directive('imgLoaded', function(selectionService) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      width: '='
    },
    link: function(scope, element, attr) {
      var myImg;
      var clear = function() {
        if (myImg) {
          myImg.next().remove();
          myImg.remove();
          myImg = undefined;
        }
      };

      scope.$on('crop:loaded', function() {
        clear();
        var image = selectionService.getImage();
        var canvas = document.createElement('canvas');

        var width = scope.width || 512;
        var height = image.height * (width / image.width);
        var ratio = image.width / width;
        var minsize = 128 / ratio;

        /*si image.w == 1024 -> ratio = 2. minsize = 256
        si image.w == 2048 -> ratio = 4. minsize = 512
*/

        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        element.after('<img />');
        myImg = element.next();
        myImg.attr('src', canvas.toDataURL());
        myImg.attr('width', width);
        myImg.attr('height', height);

        $(myImg).Jcrop({
          bgColor: 'black',
          bgOpacity: 0.6,
          setSelect: [0, 0, minsize, minsize],
          minSize: [minsize, minsize],
          aspectRatio: 1,
          onSelect: function(x) {
            selectionService.broadcastSelection({cords: x, ratio: ratio});
          },
          onChange: function(x) {
            selectionService.broadcastSelection({cords: x, ratio: ratio});
          }
        });

      });
      scope.$on('$destroy', clear);
    }
  };
}).directive('loadButton', function(selectionService) {

    return {
      restrict: 'A',
      replace: true,
      scope: {
        maxSize: '='
      },
      link: function(scope, element, attrs) {
        element.bind('change', function(evt) {
          evt.stopPropagation();
          evt.preventDefault();

          var file = evt.dataTransfer !== undefined ? evt.dataTransfer.files[0] : evt.target.files[0];
          if (!file || !file.type.match(/^image\//)) {
            selectionService.setError('Wrong file type, please select a valid image');
          } else {
            var maxSize = scope.maxSize || 10;
            if (file.size > maxSize * 1048576) {
              selectionService.setError('File is too large (maximum size is ' + scope.maxSize + ' Mb)');
            } else {
              var reader = new FileReader();
              reader.onload = (function(theFile) {
                return function(e) {
                  var image = new Image();
                  image.src = e.target.result;
                  image.onload = function() {
                    selectionService.setError();
                    selectionService.setImage(image);
                  };
                };
              })(file);
              reader.readAsDataURL(file);
            }
          }
        });
      }
    };
  });
