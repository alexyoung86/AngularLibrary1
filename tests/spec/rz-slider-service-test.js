'use strict';

describe('rzslider - ', function() {
  var RzSlider,
    RzSliderOptions,
    $rootScope,
    scope,
    $compile,
    $timeout,
    $window,
    element,
    slider;
  beforeEach(module('rzModule'));
  beforeEach(module('appTemplates'));

  beforeEach(inject(function(_RzSlider_, _RzSliderOptions_, _$rootScope_, _$compile_, _$timeout_, _$window_) {
    RzSlider = _RzSlider_;
    RzSliderOptions = _RzSliderOptions_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $timeout = _$timeout_;
    $window = _$window_;
  }));

  /*
  ******************************************************************************
    SINGLE SLIDER INIT
  ******************************************************************************
  */
  describe('single slider initialisation', function() {
    beforeEach(function() {
      var sliderConf = {
        value: 10,
        options: {
          floor: 0,
          ceil: 100,
          step: 10
        }
      };
      createSlider(sliderConf);
    });

    it('should exist compiled', function() {
      expect(element.find('span')).to.have.length(11);
    });

    it('should round the model value to the step', function() {
      scope.slider.value = 54;
      scope.$digest();
      expect(scope.slider.value).to.equal(50);

      scope.slider.value = 55;
      scope.$digest();
      $timeout.flush(); //to flush the throttle function
      expect(scope.slider.value).to.equal(60);
    });

    it('should call calcViewDimensions() on reCalcViewDimensions', function() {
      sinon.spy(slider, 'calcViewDimensions');
      scope.$broadcast('reCalcViewDimensions');
      slider.calcViewDimensions.called.should.be.true;
    });

    it('should reset everything on rzSliderForceRender', function() {
      sinon.spy(slider, 'resetLabelsValue');
      sinon.spy(slider, 'resetSlider');
      sinon.spy(slider, 'onLowHandleChange');

      scope.$broadcast('rzSliderForceRender');

      slider.resetLabelsValue.called.should.be.true;
      slider.resetSlider.called.should.be.true;
      slider.onLowHandleChange.called.should.be.true;
    });

    it('should call calcViewDimensions() on window resize event', function() {
      sinon.spy(slider, 'calcViewDimensions');
      angular.element($window).triggerHandler('resize');
      slider.calcViewDimensions.called.should.be.true;
    });

    it('should unregister all dom events on $destroy', function() {
      sinon.spy(slider, 'calcViewDimensions');
      sinon.spy(slider, 'unbindEvents');

      scope.$broadcast('$destroy');
      angular.element($window).triggerHandler('resize');

      slider.calcViewDimensions.called.should.be.false;
      slider.unbindEvents.called.should.be.true;
    });
  });

  /*
  ******************************************************************************
    RANGE SLIDER INIT
  ******************************************************************************
  */
  describe('range slider initialisation', function() {
    beforeEach(function() {
      var sliderConf = {
        min: 10,
        max: 90,
        options: {
          floor: 0,
          ceil: 100,
          step: 10
        }
      };
      createRangeSlider(sliderConf);
    });

    it('should exist compiled', function() {
      expect(element.find('span')).to.have.length(11);
    });

    it('should round the model value to the step', function() {
      scope.slider.min = 13;
      scope.slider.max = 94;
      scope.$digest();
      expect(scope.slider.min).to.equal(10);
      expect(scope.slider.max).to.equal(90);

      scope.slider.min = 15;
      scope.slider.max = 95;
      scope.$digest();
      $timeout.flush(); //to flush the throttle function
      expect(scope.slider.min).to.equal(20);
      expect(scope.slider.max).to.equal(100);
    });

    it('should reset everything on rzSliderForceRender', function() {
      sinon.spy(slider, 'resetLabelsValue');
      sinon.spy(slider, 'resetSlider');
      sinon.spy(slider, 'onLowHandleChange');
      sinon.spy(slider, 'onHighHandleChange');

      scope.$broadcast('rzSliderForceRender');

      slider.resetLabelsValue.called.should.be.true;
      slider.resetSlider.called.should.be.true;
      slider.onLowHandleChange.called.should.be.true;
      slider.onHighHandleChange.called.should.be.true;
    });
  });

  /*
  ******************************************************************************
    RzSliderOptions
  ******************************************************************************
  */
  describe('RzSliderOptions', function() {

    it('should have a correct getOptions method that apply custom options', function() {
      var defaultOpts = RzSliderOptions.getOptions();
      var customOpts = {
        showTicks: true
      };

      var expectedOpts = angular.extend({}, defaultOpts, customOpts);
      var options = RzSliderOptions.getOptions(customOpts);
      expect(options).to.deep.equal(expectedOpts);
    });

    it('should have a correct options method to update the global options', function() {
      var defaultOpts = RzSliderOptions.getOptions();
      var globalOpts = {
        showTicks: true
      };
      RzSliderOptions.options(globalOpts);

      var expectedOpts = angular.extend({}, defaultOpts, globalOpts);
      var options = RzSliderOptions.getOptions();
      expect(options).to.deep.equal(expectedOpts);
    });
  });

  /*
  ******************************************************************************
    Slider with ticks
  ******************************************************************************
  */
  describe('slider with ticks', function() {
    beforeEach(function() {
      var sliderConf = {
        value: 50,
        options: {
          floor: 0,
          ceil: 100,
          step: 10,
          showTicks: true
        }
      };
      createSlider(sliderConf);
    });

    it('should create the correct number of ticks', function() {
      expect(element[0].querySelectorAll('.tick')).to.have.length(11);
    });
  });

  /*
  ******************************************************************************
    KEYBOARD CONTROLS
  ******************************************************************************
  */
  describe('keyboard controls', function() {

    describe('simple cases for single slider - ', function() {
      beforeEach(function() {
        var sliderConf = {
          value: 100,
          options: {
            floor: 0,
            ceil: 200
          }
        };
        createSlider(sliderConf);
      });

      it('should toggle active style when handle focused/blured', function() {
        slider.minH.triggerHandler('focus');
        expect(slider.minH.hasClass('rz-active')).to.be.true;
        slider.minH.triggerHandler('blur');
        expect(slider.minH.hasClass('rz-active')).to.be.false;
      });

      it('should increment by 1 when RIGHT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.value).to.equal(101);
      });

      it('should decrement by 1 when LEFT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'LEFT');
        expect(scope.slider.value).to.equal(99);
      });

      it('should increment by 1 when UP is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'UP');
        expect(scope.slider.value).to.equal(101);
      });

      it('should decrement by 1 when DOWN is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'DOWN');
        expect(scope.slider.value).to.equal(99);
      });

      it('should increment by 10% when PAGEUP is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEUP');
        expect(scope.slider.value).to.equal(120);
      });

      it('should decrement by 10% when PAGEDOWN is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEDOWN');
        expect(scope.slider.value).to.equal(80);
      });

      it('should set value to min when HOME is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'HOME');
        expect(scope.slider.value).to.equal(0);
      });

      it('should  set value to max when END is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'END');
        expect(scope.slider.value).to.equal(200);
      });

      it('should do nothing when SPACE is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'SPACE');
        expect(scope.slider.value).to.equal(100);
      });

      it('should not modify when keypress but not focused', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.value).to.equal(101);
        slider.minH.triggerHandler('blur');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.value).to.equal(101);
      });
    });

    describe('simple cases for range slider - ', function() {
      beforeEach(function() {
        var sliderConf = {
          min: 50,
          max: 100,
          options: {
            floor: 0,
            ceil: 200
          }
        };
        createRangeSlider(sliderConf);
      });

      it('should toggle active style when handle focused/blured', function() {
        slider.minH.triggerHandler('focus');
        expect(slider.minH.hasClass('rz-active')).to.be.true;
        expect(slider.maxH.hasClass('rz-active')).to.be.false;
        slider.minH.triggerHandler('blur');
        slider.maxH.triggerHandler('focus');
        expect(slider.minH.hasClass('rz-active')).to.be.false;
        expect(slider.maxH.hasClass('rz-active')).to.be.true;
        slider.maxH.triggerHandler('blur');
        expect(slider.minH.hasClass('rz-active')).to.be.false;
        expect(slider.maxH.hasClass('rz-active')).to.be.false;
      });

      it('should increment minH by 1 when RIGHT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.min).to.equal(51);
      });

      it('should increment maxH by 1 when RIGHT is pressed', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'RIGHT');
        expect(scope.slider.max).to.equal(101);
      });

      it('should decrement minH by 1 when LEFT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'LEFT');
        expect(scope.slider.min).to.equal(49);
      });

      it('should decrement maxH by 1 when LEFT is pressed', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'LEFT');
        expect(scope.slider.max).to.equal(99);
      });

      it('should increment minH by 10% when PAGEUP is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEUP');
        expect(scope.slider.min).to.equal(70);
      });

      it('should increment maxH by 10% when PAGEUP is pressed', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'PAGEUP');
        expect(scope.slider.max).to.equal(120);
      });

      it('should decrement minH by 10% when PAGEDOWN is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEDOWN');
        expect(scope.slider.min).to.equal(30);
      });

      it('should decrement maxH by 10% when PAGEDOWN is pressed', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'PAGEDOWN');
        expect(scope.slider.max).to.equal(80);
      });

      it('should set minH to min when HOME is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'HOME');
        expect(scope.slider.min).to.equal(0);
      });

      it('should set minH value to previous min and switch min/max when HOME is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'HOME');
        expect(scope.slider.min).to.equal(0);
        expect(scope.slider.max).to.equal(50);
      });

      it('should set minH value to previous max and switch min/max when END is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'END');
        expect(scope.slider.min).to.equal(100);
        expect(scope.slider.max).to.equal(200);
      });

      it('should set maxH value to max when END is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'END');
        expect(scope.slider.max).to.equal(200);
      });

      it('should do nothing when SPACE is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'SPACE');
        expect(scope.slider.min).to.equal(50);
      });

      it('should do nothing when SPACE is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'SPACE');
        expect(scope.slider.max).to.equal(100);
      });

      it('should not modify minH when keypress but not focused', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.min).to.equal(51);
        slider.minH.triggerHandler('blur');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.min).to.equal(51);
      });

      it('should not modify maxH when keypress but not focused', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'RIGHT');
        expect(scope.slider.max).to.equal(101);
        slider.maxH.triggerHandler('blur');
        pressKeydown(slider.maxH, 'RIGHT');
        expect(scope.slider.max).to.equal(101);
      });
    });

    describe('range slider with draggableRangeOnly=true - ', function() {
      beforeEach(function() {
        var sliderConf = {
          min: 90,
          max: 110,
          options: {
            floor: 0,
            ceil: 200,
            draggableRangeOnly: true
          }
        };
        createRangeSlider(sliderConf);
      });

      it('should increment minH/maxH by 1 when RIGHT is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.min).to.equal(91);
        expect(scope.slider.max).to.equal(111);
      });

      it('should increment minH/maxH by 1 when RIGHT is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'RIGHT');
        expect(scope.slider.min).to.equal(91);
        expect(scope.slider.max).to.equal(111);
      });

      it('should increment minH/maxH by 1 when LEFT is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'LEFT');
        expect(scope.slider.min).to.equal(89);
        expect(scope.slider.max).to.equal(109);
      });

      it('should increment minH/maxH by 1 when LEFT is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'LEFT');
        expect(scope.slider.min).to.equal(89);
        expect(scope.slider.max).to.equal(109);
      });

      it('should increment minH/maxH by 10% when PAGEUP is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEUP');
        expect(scope.slider.min).to.equal(110);
        expect(scope.slider.max).to.equal(130);
      });

      it('should increment minH/maxH by 10% when PAGEUP is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'PAGEUP');
        expect(scope.slider.min).to.equal(110);
        expect(scope.slider.max).to.equal(130);
      });

      it('should decrement minH/maxH by 10% when PAGEDOWN is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'PAGEDOWN');
        expect(scope.slider.min).to.equal(70);
        expect(scope.slider.max).to.equal(90);
      });

      it('should decrement minH/maxH by 10% when PAGEDOWN is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'PAGEDOWN');
        expect(scope.slider.min).to.equal(70);
        expect(scope.slider.max).to.equal(90);
      });

      it('should set minH to min when HOME is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'HOME');
        expect(scope.slider.min).to.equal(0);
        expect(scope.slider.max).to.equal(20);
      });

      it('should set minH to min when HOME is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'HOME');
        expect(scope.slider.min).to.equal(0);
        expect(scope.slider.max).to.equal(20);
      });

      it('should set minH to min when END is pressed on minH', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'END');
        expect(scope.slider.min).to.equal(180);
        expect(scope.slider.max).to.equal(200);
      });

      it('should set minH to min when END is pressed on maxH', function() {
        slider.maxH.triggerHandler('focus');
        pressKeydown(slider.maxH, 'END');
        expect(scope.slider.min).to.equal(180);
        expect(scope.slider.max).to.equal(200);
      });
    });

    describe('simple cases for vertical slider - ', function() {
      beforeEach(function() {
        var sliderConf = {
          value: 100,
          options: {
            floor: 0,
            ceil: 200,
            vertical: true
          }
        };
        createSlider(sliderConf);
      });

      it('should increment by 1 when RIGHT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'RIGHT');
        expect(scope.slider.value).to.equal(101);
      });

      it('should increment by 1 when UP is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'UP');
        expect(scope.slider.value).to.equal(101);
      });

      it('should decrement by 1 when DOWN is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'DOWN');
        expect(scope.slider.value).to.equal(99);
      });

      it('should decrement by 1 when LEFT is pressed', function() {
        slider.minH.triggerHandler('focus');
        pressKeydown(slider.minH, 'LEFT');
        expect(scope.slider.value).to.equal(99);
      });
    });

    it('should not go below floor', function() {
      var sliderConf = {
        value: 10,
        options: {
          floor: 0,
          ceil: 1000,
          step: 10
        }
      };
      createSlider(sliderConf);
      slider.minH.triggerHandler('focus');
      pressKeydown(slider.minH, 'PAGEDOWN');
      expect(scope.slider.value).to.equal(0);
    });

    it('should not go above ceil', function() {
      var sliderConf = {
        value: 990,
        options: {
          floor: 0,
          ceil: 1000,
          step: 10
        }
      };
      createSlider(sliderConf);
      slider.minH.triggerHandler('focus');
      pressKeydown(slider.minH, 'PAGEUP');
      expect(scope.slider.value).to.equal(1000);
    });

    it('should not be modified by keyboard if disabled=true', function() {
      var sliderConf = {
        value: 10,
        options: {
          floor: 0,
          ceil: 100,
          disabled: true
        }
      };
      createSlider(sliderConf);
      slider.minH.triggerHandler('focus');
      pressKeydown(slider.minH, 'LEFT');
      expect(scope.slider.value).to.equal(10);
    });

    it('should not be modified by keyboard if readOnly=true', function() {
      var sliderConf = {
        value: 10,
        options: {
          floor: 0,
          ceil: 100,
          readOnly: true
        }
      };
      createSlider(sliderConf);
      slider.minH.triggerHandler('focus');
      pressKeydown(slider.minH, 'LEFT');
      expect(scope.slider.value).to.equal(10);
    });

    it('should not be modified by keyboard if keyboardSupport=false', function() {
      var sliderConf = {
        value: 10,
        options: {
          floor: 0,
          ceil: 100,
          keyboardSupport: false
        }
      };
      createSlider(sliderConf);
      slider.minH.triggerHandler('focus');
      pressKeydown(slider.minH, 'LEFT');
      expect(scope.slider.value).to.equal(10);
    });

    function pressKeydown(element, key, oldAPI) {
      key = key.toUpperCase();
      var event = {
        type: 'keydown'
      };
      var keys = {
        'UP': 38,
        'DOWN': 40,
        'LEFT': 37,
        'RIGHT': 39,
        'PAGEUP': 33,
        'PAGEDOWN': 34,
        'HOME': 36,
        'END': 35,
        'SPACE': 32
      };
      var keyCode = keys[key];
      if (oldAPI)
        eent.which = keyCode;
      else event.keyCode = keyCode;
      element.triggerHandler(event);
    }
  });

  function createSlider(sliderObj) {
    var template = '';
    if (sliderObj.options)
      template = '<rzslider rz-slider-model="slider.value" rz-slider-options="slider.options"></rzslider>';
    else
      template = '<rzslider rz-slider-model="slider.value"></rzslider>';
    initSlider(sliderObj, template);
  }

  function createRangeSlider(sliderObj) {
    var template = '';
    if (sliderObj.options)
      template = '<rzslider rz-slider-model="slider.min" rz-slider-high="slider.max"' +
      'rz-slider-options="slider.options"></rzslider>';
    else
      template = '<rzslider rz-slider-model="slider.value" rz-slider-high="slider.max"></rzslider>';
    initSlider(sliderObj, template);
  }

  function initSlider(sliderObj, template) {
    scope = $rootScope.$new();
    scope.slider = sliderObj;
    var parent = angular.element('<div style="width: 1000px"></div>');
    element = $compile(template)(scope);
    parent.append(element);
    angular.element(document).find('body').append(parent);
    scope.$apply();
    slider = element.isolateScope().slider;
    $timeout.flush();
  }
});
