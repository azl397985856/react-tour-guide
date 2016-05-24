
==========================================================================================================================

A ReactJS mixin to give new users a popup-based tour of your application. An example can be seen [here](http://jakemmarsh.com/react-tour-guide/).

---

### Getting Started

1. `npm install --save react-guest-tutorial`
2. `var TourGuideMixin = require('react-guest-tutorial').Mixin`

```javascript
var TourGuideMixin = require('react-guest-tutorial').Mixin;
var tour = {
  startIndex: 0,
  scrollToSteps: true,
  steps: [
    {
      text: 'This is the first step in the tour.',
      element: 'header',
      position: 'bottom',
      closeButtonText: 'Next'
    },
    {
      text: 'This is the second step in the tour.',
      element: '.navigation',
      position: 'right'
    }
  ]
};
var cb = function() {
  console.log('User has completed tour!');
};

var App = React.createClass({

  mixins: [TourGuideMixin(tour, cb)],

  ...

});
```

If you're going to initialize the mixin without steps and add them later asynchronously, set your `startIndex` to a negative value
```javascript
...
startIndex: -1,
steps: []
...

```

---

### Options

A Javascript object is passed to the `TourGuideMixin` to specify options, as well as the steps of your tour as an array (there is also a method to define these asynchronously, discussed below). The options are:

- `startIndex` (int): the index from which to begin the steps of the tour. This can be retrieved and saved via `getUserTourProgress` (discussed below), in order to be specified when a user returns. Defaults to `0`.
- `scrollToSteps` (bool): if true, the page will be automatically scrolled to the next indicator (if one exists) after a tooltip is dismissed. Defaults to `true`.
- `steps` (array): the array of steps to be included in your tour. Defaults to an empty array.


Each "step" in the array represents one indicator and tooltip that a user must click through in the guided tour. A step has the following structure:

```json
{
  "text": "The helpful tip or information the user should read at this step.",
  "element": "A jQuery selector for the element which the step relates to.",
  "position": "Where to position the indicator in relation to the element.",
  "closeButtonText": "An optional string to be used as the text for the tooltip close button."
}
```

Positions can be chosen from: `top-left`, `top-right`, `right`, `bottom-right`, `bottom`, `bottom-left`, `left`, and `center`. This defaults to `center`.

---

### Completion Callback

An optional callback may be passed as the second parameter to `TourGuideMixin`, which will be called once the current user has completed all the steps of your tour.

---

### Methods

##### `setTourSteps(steps, cb)`

This function is intended to provide you with a method to asynchronously define your steps (if they need to be fetched from a database, etc.) It takes a list of steps (of the form discussed earlier), along with an optional callback function as parameters. **This will completely overwrite any existing steps or progress**. Once the state is updated, the callback function will be invoked.

##### `getUserTourProgress()`

Upon including the mixin, this will be available to your component. At any point, this method can be called to retrieve information about the current user's progress through the guided tour. The object returned looks like this:

```json
{
  "index": 2,
  "percentageComplete": 50,
  "step": {
    "text": "...",
    "element": "...",
    "position": "..."
  }
}
```
This information can be used to save a user's progress upon navigation from the page or application, allowing you to return them back to their correct spot when they visit next using the `startIndex` option (discussed above).

---

### Styling

Some basic styling is provided in `/dist/css/tour-guide.css`. This can either be included directly in your project, or used as a base for your own custom styles. Below, the HTML structure of the tour is also outlined for custom styling.

The guided tour consists of two main elements for each step: an `indicator` and a `tooltip`. An indicator is a flashing element positioned on a specific element on the page, cueing the user to click. Upon click, the associated tooltip is triggered which the user must then read and dismiss.

**Note:** Elements are dynamically positioned by initially setting their `top` and `left` CSS properties to `-1000px`. Once they have been initially rendered and measured, they are then positioned correctly. Animations on these CSS properties should be avoided.

##### Indicator

```html
<div class="tour-indicator"></div>
```

##### Tooltip

```html
<div>
  <div class="tour-backdrop"></div>
  <div class="tour-tooltip">
    <p>{The step's text goes here.}</p>
    <div class="tour-btn close">Close</div>
  </div>
</div>
```
