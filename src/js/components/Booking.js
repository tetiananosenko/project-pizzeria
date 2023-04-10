import { select, classNames, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom = {
      wrapper: element,
      peopleAmount: thisBooking.element.querySelector(select.booking.peopleAmount),
      hoursAmount: thisBooking.element.querySelector(select.booking.hoursAmount),
    }
    thisBooking.dom.wrapper.appendChild(thisBooking.element);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}
export default Booking;