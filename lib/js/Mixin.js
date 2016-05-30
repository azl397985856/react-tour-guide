'use strict';

var React     = require('react/addons');
var $         = require('jquery');

var Indicator = require('./Indicator');
var Tooltip   = require('./Tooltip');

module.exports = function(settings, done) {

  var mixin = {

    settings: $.extend({
      startIndex: 0,
      scrollToSteps: true,
      steps: []
    }, settings),

    completionCallback: done || function() {},

    getInitialState: function() {
      return {
        currentIndex: this.settings.startIndex,
        showTooltip:  false,
        xPos: -1000,
        yPos: -1000
      };
    },

    _renderLayer: function() {
      // By calling this method in componentDidMount() and componentDidUpdate(), you're effectively
      // creating a "wormhole" that funnels React's hierarchical updates through to a DOM node on an
      // entirely different part of the page.
      this.setState({ xPos: -1000, yPos: -1000 });
      React.render(this.renderCurrentStep(), this._target);
      this.calculatePlacement();
    },

    _unrenderLayer: function() {
      React.unmountComponentAtNode(this._target);
    },

    componentDidUpdate: function(prevProps, prevState) {
      var hasNewIndex = this.state.currentIndex !== prevState.currentIndex;
      var hasNewStep = !!this.settings.steps[this.state.currentIndex];
      var hasSteps =  this.settings.steps.length > 0;
      var hasNewX = this.state.xPos !== prevState.xPos;
      var hasNewY = this.state.yPos !== prevState.yPos;

      var didToggleTooltip = this.state.showTooltip && this.state.showTooltip !== prevState.showTooltip;

      if ( (hasNewIndex && hasNewStep) || didToggleTooltip || hasNewX || hasNewY ) {
        this._renderLayer();
      } else if ( hasSteps && hasNewIndex && !hasNewStep ) {
        this.completionCallback();
        this._unrenderLayer();
      }
    },

    componentDidMount: function() {
      // Appending to the body is easier than managing the z-index of everything on the page.
      // It's also better for accessibility and makes stacking a snap (since components will stack
      // in mount order).
      this._target = document.createElement('div');
      document.body.appendChild(this._target);

      if ( this.settings.steps[this.state.currentIndex] ) {
        this._renderLayer();
      }
      $(window).on('resize', this.calculatePlacement);
    },

    componentWillUnmount: function() {
      this._unrenderLayer();
      document.body.removeChild(this._target);
      $(window).off('resize', this.calculatePlacement);
    },

    setTourSteps: function(steps, cb) {
      if (!(steps instanceof Array)) {
        return false;
      }
      cb = cb || function() {};
      this.settings.steps = steps;

      this.setState({
        currentIndex: this.state.currentIndex < 0 ? 0 : this.state.currentIndex,
        setTourSteps: steps.length
      }, cb);
    },

    getUserTourProgress: function() {
      return {
        index: this.state.currentIndex,
        percentageComplete: (this.state.currentIndex/this.settings.steps.length)*100,
        step: this.settings.steps[this.state.currentIndex]
      };
    },

    preventWindowOverflow: function(value, axis, elWidth, elHeight) {
      var winWidth = parseInt($(window).width());
      var docHeight = parseInt($(document).height());

      if ( axis.toLowerCase() === 'x' ) {
        if ( value + elWidth > winWidth ) {
          void 0;
          value = winWidth - elWidth;
        } else if ( value < 0 ) {
          void 0;
          value = 0;
        }
      } else if ( axis.toLowerCase() === 'y' ) {
        if ( value + elHeight > docHeight ) {
          void 0;
          value = docHeight - elHeight;
        } else if ( value < 0 ) {
          void 0;
          value = 0;
        }
      }

      return value;
    },

    calculatePlacement: function() {
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);
      var offset = $target.offset();
      var targetWidth = $target.outerWidth();
      var targetHeight = $target.outerHeight();
      var position = step.position.toLowerCase();
      var topRegex = new RegExp('top', 'gi');
      var bottomRegex = new RegExp('bottom', 'gi');
      var leftRegex = new RegExp('left', 'gi');
      var rightRegex = new RegExp('right', 'gi');
      var $element = this.state.showTooltip ? $('.tour-tooltip') : $('.tour-indicator');
      if (!this.settings.config.showIndicator) {
          this.handleIndicatorClick();  // added
          this.scroll();
      }
      var elWidth = $element.outerWidth();
      var elHeight = $element.outerHeight();
      var placement = {
        x: -1000,
        y: -1000
      };
      // we should placed at (offset.left + targetWidth, offset.top + targetHeight)
      // Calculate x position
      if ( leftRegex.test(position) ) {
        placement.x = offset.left - elWidth/2;
      } else if ( rightRegex.test(position) ) {
        placement.x = offset.left + targetWidth - elWidth/2;
      } else {
        placement.x = offset.left + targetWidth/2 - elWidth/2;
      }
      // Calculate y position
      if ( topRegex.test(position) ) {
        placement.y = offset.top - elHeight/2;
      } else if ( bottomRegex.test(position) ) {
        placement.y = offset.top + targetHeight - elHeight/2;
      } else {
        placement.y = offset.top + targetHeight/2 - elHeight/2;
      }
      this.setState({
        xPos: this.preventWindowOverflow(placement.x, 'x', elWidth, elHeight),
        yPos: this.preventWindowOverflow(placement.y, 'y', elWidth, elHeight)
      });
    },

    handleIndicatorClick: function(evt) {
      evt && evt.preventDefault();
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);
      $target.addClass('hightlight'); // added
      this.setState({ showTooltip: true });
    },

    preStep: function(evt) {
      evt.preventDefault();
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);
      $target.removeClass('hightlight'); // added
      this.setState({
        showTooltip: false,
        currentIndex: this.state.currentIndex - 1
      }, this.scroll);
    },

    nextStep: function(evt) {
      evt.preventDefault();
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);
      $target.removeClass('hightlight'); // added
      this.setState({
        showTooltip: false,
        currentIndex: this.state.currentIndex + 1
      }, this.scroll);
    },

    closeTooltip: function() {
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);
      $target.removeClass('hightlight'); // added
      this.setState({
        currentIndex: -1
      });
    },

    scroll: function() {
      var step = this.settings.steps[this.state.currentIndex];
      var $target = $(step.element);

      if ( $target && $target.length && this.settings.scrollToSteps ) {
        $('html, body').animate({
          'scrollTop': $target.offset().top - $(window).height()/2 + (step.offsetY || 0)
        }, 200);
      }
    },

    renderCurrentStep: function() {
      var element = null;
      var currentStep = this.settings.steps[this.state.currentIndex];
      var $target = currentStep && currentStep.element ? $(currentStep.element) : null;
      var cssPosition = $target ? $target.css('position') : null;
      if ( $target && $target.length ) {
        if ( this.state.showTooltip ) {
          element = (
            React.createElement(Tooltip, {cssPosition: cssPosition, 
                     xPos: this.state.xPos + (currentStep.offsetX || 0), 
                     yPos: this.state.yPos + (currentStep.offsetY || 0), 
                     text: currentStep.text,
                     disabledMaskCancel: this.settings.config.disabledMaskCancel,
                     closeTooltip: this.closeTooltip,
                     nextStep: this.nextStep,
                     preStep: this.preStep, 
                     preButtonText: currentStep.preButtonText,
                     closeButtonText: currentStep.closeButtonText})
          );
        } else {
          element = (
            React.createElement(Indicator, {cssPosition: cssPosition, 
                       xPos: this.state.xPos + (currentStep.offsetX || 0), 
                       yPos: this.state.yPos + (currentStep.offsetY || 0), 
                       background: currentStep.background, 
                       handleIndicatorClick: this.handleIndicatorClick})
          );
        }
      }

      return element;
    }

  };

  return mixin;

};
