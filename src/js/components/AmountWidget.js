import { select, settings } from '../settings.js';
import BaseWidget from './baseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }
  getElements() {
    const thisWidget = this;
    // thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  // setValue(value) {
  //   const thisWidget = this;
  //   const newValue = thisWidget.parseValue(value);
  //   if (thisWidget.value !== newValue && thisWidget.isValid(newValue)) {
  //     thisWidget.value = newValue;
  //     thisWidget.announce();
  //   }
  //   thisWidget.renderValue();
  // }
  isValid(value) {
    return !isNaN(value)
      && settings.amountWidget.defaultMin <= value
      && settings.amountWidget.defaultMax >= value;
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function () {
      // thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  // announce() {
  //   const thisWidget = this;

  //   const event = new CustomEvent('updated', {
  //     bubbles: true
  //   });
  //   thisWidget.dom.wrapper.dispatchEvent(event);
  // }
}

export default AmountWidget;