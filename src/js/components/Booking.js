import { classNames, select, settings, templates, } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.tableSelected = [];

  }
  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const enddateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        enddateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        enddateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        enddateParam,
      ],
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponse) {
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }

  }
  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;
    if (typeof thisBooking.booked[thisBooking.date] === 'undefined'
      || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==='undefined') {
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
      tables: thisBooking.element.querySelectorAll(select.booking.tables),
      tablesDIV: thisBooking.element.querySelector(select.booking.tablesDIV),

      form: thisBooking.element.querySelector(select.booking.form),
      phone: thisBooking.element.querySelector(select.booking.phone),
      address: thisBooking.element.querySelector(select.booking.address),
      peopleValue: thisBooking.element.querySelector(select.booking.peopleValue),
      hoursValue: thisBooking.element.querySelector(select.booking.hoursValue),
    };

    thisBooking.dom.wrapper.appendChild(thisBooking.element);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.amountWidgetPeople = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetHours = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesDIV.addEventListener('click', function (event) {
      event.preventDefault();
      const elements = document.querySelectorAll('.selected');
      elements.forEach((element) => {
        element.classList.remove('selected');
      });
      if (event.target.classList.contains('table') && !event.target.classList.contains('booked')) {
        event.target.classList.add('selected');
        const id = event.target.dataset.table;
        thisBooking.tableSelected.push(id);
      } else if (event.target.classList.contains('table') && event.target.classList.contains('booked')) {
        alert('This table is already booked, please choose another one');
      }
    });
    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  sendBooking() {
    const thisBooking = this;
    thisBooking.orders = [];
    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = {
      'date': thisBooking.date,
      'hour': thisBooking.hour,
      'table': Number(thisBooking.tableSelected[thisBooking.tableSelected.length - 1]),
      'duration': Number(thisBooking.dom.hoursValue.value),
      'ppl': Number(thisBooking.dom.peopleValue.value),
      'starters': [],
      'phone': thisBooking.dom.phone.value,
      'address': thisBooking.dom.address.value,
    };
    let startersName = thisBooking.element.querySelectorAll(select.booking.startersName);
    for (const starterName of startersName) {
      if (starterName.value === 'water' && starterName.checked) {
        payload.starters.push(starterName.value);
      } else if (starterName.value === 'bread' && starterName.checked) {
        payload.starters.push(starterName.value);
      }
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
    thisBooking.booked = payload;
  }
}
export default Booking;