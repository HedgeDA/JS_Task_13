'use strict'

const formData = {
  'planeData': {},
  'select': document.getElementById('acSelect'),
  'buttons': {
    'seatMap': document.getElementById('btnSeatMap'),
    'setFull': document.getElementById('btnSetFull'),
    'setEmpty': document.getElementById('btnSetEmpty')
  },
  'seatMapTitle': document.getElementById('seatMapTitle'),
  'totals':{
    'pax': document.getElementById('totalPax'),
    'adult': document.getElementById('totalAdult'),
    'half': document.getElementById('totalHalf')
  },
  'seatMapDiv': document.getElementById('seatMapDiv')
};
let altPressed = false;

function updateTotals() {
  formData.totals.pax.textContent = formData.planeData.totals.adult + formData.planeData.totals.half;
  formData.totals.adult.textContent = formData.planeData.totals.adult;
  formData.totals.half.textContent = formData.planeData.totals.half;
}

function getSeatsByCount(count) {
  switch (count) {
    case 6:
      return [{'state': 'empty', 'letter': formData.planeData.letters6[0]},
        {'state': 'empty', 'letter': formData.planeData.letters6[1]},
        {'state': 'empty', 'letter': formData.planeData.letters6[2]},
        {'state': 'empty', 'letter': formData.planeData.letters6[3]},
        {'state': 'empty', 'letter': formData.planeData.letters6[4]},
        {'state': 'empty', 'letter': formData.planeData.letters6[5]}];
    case 4:
      return [{'state': 'null', 'letter': ''},
        {'state': 'empty', 'letter': formData.planeData.letters6[0]},
        {'state': 'empty', 'letter': formData.planeData.letters6[1]},
        {'state': 'empty', 'letter': formData.planeData.letters6[2]},
        {'state': 'empty', 'letter': formData.planeData.letters6[3]},
        {'state': 'null', 'letter': ''}]
    default:
      return [{'state': 'null', 'letter': ''},
        {'state': 'null', 'letter': ''},
        {'state': 'null', 'letter': ''},
        {'state': 'null', 'letter': ''},
        {'state': 'null', 'letter': ''},
        {'state': 'null', 'letter': ''}]
  }
}

function getPlaneData(id) {
  fetch(`https://neto-api.herokuapp.com/plane/${id}`, {
    method: 'GET'
  })
    .then((response) => {
      if (200 <= response.status && response.status < 300) {
        return response;
      }

      throw new Error(response.statusText);
    })
    .then((response) => response.json())
    .then((response) => {
      formData.planeData = response;

      formData.planeData.totals = {
        'empty': formData.planeData.passengers,
        'adult': 0,
        'half': 0
      }

      formData.planeData.scheme = formData.planeData.scheme.map((seatCount, index) => {
          return {
            'number': (index + 1),
            'count': seatCount,
            'seats': getSeatsByCount(seatCount)
          };
        });

      formData.seatMapTitle.textContent = `${formData.planeData.title} (${formData.planeData.passengers} пассажиров)`;

      updateTotals();
    })
    .catch((error) => console.log(`Ошибка выполнения запроса: ${error}`));
}

function node(tagName, attributes = {}, textContent = '') {
  const newNode = document.createElement(tagName);

  for (let attribute in attributes) {
    newNode[attribute] = attributes[attribute];
  }

  if (typeof textContent === 'string') {
    newNode.textContent = textContent;
  } else if (textContent instanceof Array) {
    textContent.forEach(childNode =>
      newNode.appendChild(childNode)
    );
  }

  return newNode;
}

function createSeat(seat) {
  if (seat.state === 'null') {
     return node('div', {'className': 'col-xs-4 no-seat'}, '')
  }

  let seatNode = node('div', {'className': 'col-xs-4 seat'}, [
      node('span', {'className': 'seat-label'}, seat.letter)
    ]);

  seatNode.addEventListener('click', (event) => {
    let element = event.target;
    if (event.target.tagName === 'SPAN') {
      element = element.parentElement;
    }

    if (seat.state === 'empty') {
      formData.planeData.totals.pax++;

      if (altPressed) {
        formData.planeData.totals.half++;
        seat.state = 'half';
      } else {
        formData.planeData.totals.adult++;
        seat.state = 'adult';
      }

      element.classList.add(seat.state);
    } else {
      formData.planeData.totals.pax--;
      if (seat.state === 'adult') {
        formData.planeData.totals.adult--;
      } else {
        formData.planeData.totals.half--;
      }
      seat.state = 'empty';

      element.classList.remove('adult');
      element.classList.remove('half');
    }

    updateTotals();
  });

  return seatNode;
}

function createRow(row) {
  return node('div', {'className': 'row seating-row text-center'}, [
    node('div', {'className': 'col-xs-1 row-number'}, [
      node('h2', {}, row.number.toString())
    ]),
    node('div', {'className': 'col-xs-5'}, [
      createSeat(row.seats[0]),
      createSeat(row.seats[1]),
      createSeat(row.seats[2])
    ]),
    node('div', {'className': 'col-xs-5'}, [
      createSeat(row.seats[3]),
      createSeat(row.seats[4]),
      createSeat(row.seats[5])
    ])
  ]);
}

function showMap() {
  const rows = formData.planeData.scheme.map(createRow);
  const fragment = rows
    .reduce((fragment, currentValue) => {
      fragment.appendChild(currentValue);
      return fragment;
    }, document.createDocumentFragment());

  formData.seatMapDiv.appendChild(fragment);
}

function onSeatMap(event) {
  event.preventDefault();

  formData.buttons.setFull.disabled = false;
  formData.buttons.setEmpty.disabled = false;

  showMap();
}

function onSetFull(event) {
  event.preventDefault();
}

function onSetEmpty(event) {
  event.preventDefault();
}

function onKeyDown(event) {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }

  if (event.key === 'Alt') {
    altPressed = true;
  }
}

function onKeyUp(event) {
  if (!(event instanceof KeyboardEvent)) {
    return;
  }

  if (event.key === 'Alt') {
    altPressed = false;
  }
}

function onChangeAC(event) {
  while (formData.seatMapDiv.firstChild) {
    formData.seatMapDiv.removeChild(formData.seatMapDiv.firstChild);
  }

  formData.seatMapDiv.appendChild(node('h3', {'className': 'text-center'}, 'Самолёт не выбран'));

  formData.buttons.setFull.disabled = true;
  formData.buttons.setEmpty.disabled = true;

  getPlaneData(event.target.value);
}

function init() {
  formData.select.addEventListener('change', onChangeAC);

  formData.buttons.seatMap.addEventListener('click', onSeatMap);
  formData.buttons.setFull.addEventListener('click', onSetFull);
  formData.buttons.setEmpty.addEventListener('click', onSetEmpty);

  getPlaneData(acSelect.value);

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

document.addEventListener('DOMContentLoaded', init);