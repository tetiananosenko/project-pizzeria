import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
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
      datePicker: thisBooking.element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: thisBooking.element.querySelector(select.widgets.hourPicker.wrapper),
    };
    thisBooking.dom.wrapper.appendChild(thisBooking.element);
    console.log(thisBooking.dom.hourPicker);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.bookingDatePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.bookingHourPicker = new HourPicker(thisBooking.dom.hourPicker);

  }
}
export default Booking;