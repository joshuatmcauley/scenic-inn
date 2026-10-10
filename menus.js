// Menu content for The Scenic Inn (Autumn 2025 menus).
// To update a menu, edit the data below. No other files need to change.

function item(name, desc, price) { return { name: name, desc: desc || '', price: price || '' }; }
function section(title, items, note) { return { title: title, items: items, note: note || '' }; }
function list(title, text, note) { return { title: title, text: text, note: note || '' }; }

var MENUS = {
  lunch: {
    label: 'Lunch',
    when: 'Monday to Saturday, 12pm to 4:45pm',
    note: 'Dishes marked * come complete. Everything else comes with a side of your choice.',
    sections: [
      section('Light bites', [
        item('Soup of the day', 'Wheaten bread', '£5.95'),
        item('Brunch', 'Two sausages, two bacon, beans, egg, chips', '£9.95'),
        item('Ham and cheese melt', 'Ham, cheese, sourdough, slaw. Add soup or fries for £3', '£7.95'),
        item('Chicken and bacon club', 'Lettuce, tomato, mayo, sourdough. Add soup or fries for £3', '£7.95')
      ]),
      section('Main meals', [
        item('Chicken goujons', 'Panko breadcrumbs, dip, side', '£13.95'),
        item('Chicken strippers', '', '£14.95'),
        item('House chicken curry *', 'Saffron rice, naan', '£14.95'),
        item('Chilli chicken penne *', 'Garlic bread, onion crumb', '£14.95'),
        item('Chicken Caesar salad *', 'Romaine, bacon, parmesan, soda bread croutons', '£13.95'),
        item('Honey chilli chicken pitta', 'Crispy chicken, onions, peppers, honey chilli sauce', '£14.95'),
        item('Steak sandwich', '8oz steak, onion marmalade, onion rings, pepper sauce', '£18.95'),
        item('Gammon and pineapple', 'Peas, garnish', '£14.95'),
        item('Seafood chowder *', 'Garlic ciabatta', '£15.95'),
        item('Battered cod', 'Peas, tartare, lemon', '£15.95')
      ]),
      section('Loaded fries', [
        item('Braised beef *', 'Braised beef, bourguignon sauce, fries, pickled red onion, cheese', '£14.95'),
        item('Salt and chilli chicken *', 'Crispy shredded chicken, fries, onions, peppers, curry mayo', '£14.95')
      ]),
      section('Burgers', [
        item('Scenic burger', '6oz beef burger, cheddar and smoked cheese, onion marmalade, onion ring, lettuce, tomato', '£12.95'),
        item('Chicken burger', 'Buttermilk chicken, lettuce, tomato, chipotle mayo', '£14.95')
      ]),
      list('Sides, all £3.95', 'Chips, garlic chips, chilli sour chips, fries, champ, sweet potato fries, salad')
    ]
  },

  tea: {
    label: 'Tea time',
    when: 'Monday to Thursday, 5pm to 8:30pm',
    note: 'Two courses £22, three courses £25. Dishes marked * come complete; everything else comes with a side.',
    sections: [
      section('Starters', [
        item('Soup of the day', 'Wheaten bread'),
        item('Cheesy bacon garlic bread', 'Salad garnish, garlic aioli'),
        item('Vegetable spring rolls', 'Salad garnish, chilli dip'),
        item('Cheese BBQ wedges', 'Wedges, BBQ sauce, cheese, bacon'),
        item('Frank’s hot chicken wings'),
        item('Salt n chilli chicken', 'Salad garnish, garlic aioli'),
        item('Potato bread fries', 'Ketchup dip'),
        item('Nachos', 'BBQ beef brisket, tortillas, guacamole, salsa, jalapeños')
      ]),
      section('Main course', [
        item('Chicken stack *', 'Chicken escalope, champ, pepper sauce, onion rings'),
        item('8oz sirloin steak', 'Half roast tomato, onion rings, pepper sauce', '£3 supplement'),
        item('Bang bang chicken *', 'Satay skewers, bang bang Asian veg noodles'),
        item('Sizzling pepper beef', 'Beef strips, peppers, mushrooms, onions, pepper sauce'),
        item('Chicken goujons', 'Salad garnish, choice of dip'),
        item('Taco trio', 'BBQ beef brisket, crispy shredded chicken, battered cod goujon, lettuce, pickled onion'),
        item('Cod goujons', 'Battered cod goujons, peas, tartare sauce'),
        item('Mighty meaty burger', 'Beef patty, BBQ beef brisket, chicken, onion ring'),
        item('Chicken and chorizo penne', 'Garlic bread'),
        item('Buffalo fries', 'Crispy shredded chicken, buffalo sauce, garlic mayo')
      ]),
      section('Dessert', [
        item('Sticky toffee pudding'), item('Chocolate fudge cake'), item('Apple crumble'),
        item('Cheesecake'), item('Roulade'), item('Brownie sundae')
      ], 'All served with your choice of ice cream, fresh cream or custard.'),
      list('Sides and dips', 'Sides: chips, fries, garlic chips, chilli and sour chips, mash, rice, salad. Dips: garlic, BBQ, BBQ mayo, chilli, mayo, curry, pepper, gravy.')
    ]
  },

  weekend: {
    label: 'Weekend evening',
    when: 'Friday to Sunday, 5pm to 9pm',
    note: 'Mains come with a side of your choice, except dishes marked *.',
    sections: [
      section('Starters', [
        item('Soup of the day', 'Wheaten bread', '£5.95'),
        item('Cheesy garlic bread', 'Salad garnish, garlic mayo', '£5.95'),
        item('Garlic mushrooms', 'Breaded mushrooms, salad garnish, garlic mayo', '£7.95'),
        item('Chinese chicken strippers', 'Battered chicken strips in a Chinese glaze, salad garnish, BBQ mayo', '£7.95'),
        item('Prawn tail pil pil', 'Chorizo, sun-dried tomato, toasted ciabatta', '£8.95'),
        item('Deep fried brie', 'Salad, cranberry sauce', '£8.95'),
        item('Salt and chilli chicken', 'Crispy chicken strips, wok fried veg, salt and chilli mix, garlic mayo', '£8.95'),
        item('Honey chilli chicken wings', 'Celery sticks, ranch dip', '£8.95')
      ]),
      section('From the grill', [
        item('8oz fillet steak', '', '£34.95'),
        item('10oz ribeye', '', '£29.95'),
        item('10oz sirloin', '', '£29.95')
      ], 'All served with portobello mushroom, half a roast tomato, a side, a sauce and onion rings.'),
      section('Main course', [
        item('6oz Scenic burger', 'Cheddar and smoked cheese, onion marmalade, onion ring, lettuce, tomato', '£18.95'),
        item('Gammon and egg *', 'Wholegrain mashed potatoes, charred leek and pea velouté, crispy leeks', '£20.95'),
        item('Crispy beef noodle stir fry *', 'Marinated beef strips, Asian-style stir fry veg, noodles, sesame, honey, chilli, soy', '£20.95'),
        item('Braised beef blade *', 'Bourguignon sauce, carrot, champ, onion crumb', '£24.95'),
        item('Sizzling pepper chicken', 'Chicken escalope, mushrooms, peas, pepper sauce, onion rings', '£21.95'),
        item('Chorizo chicken *', 'Garlic baby boiled potatoes, tenderstem broccoli, sun-dried tomato and chorizo cream', '£21.95'),
        item('Chicken stack *', 'Chicken escalope, champ, onion rings, pepper sauce', '£21.95'),
        item('Chicken and bacon melt', 'Bacon, BBQ sauce, cheddar, corn on the cob, purple slaw', '£21.95'),
        item('Salt and chilli chicken', 'Crispy chicken strips, wok fried veg, salt and chilli mix, garlic mayo', '£21.95'),
        item('Chinese chicken strippers', 'Battered chicken strips in a Chinese glaze, choice of dip', '£19.95'),
        item('Chilli chicken penne *', 'Peppers, chilli cream, onion crumb, garlic bread', '£18.95'),
        item('Chicken goujons', 'Panko breaded, with your choice of dip', '£17.95')
      ]),
      section('From the sea', [
        item('Scenic seafood chowder *', 'Salmon, smoked coley, cod, potatoes, corn, cream sauce, toasted garlic ciabatta', '£19.95'),
        item('Pan roasted salmon *', 'Tenderstem, chorizo and sun-dried tomato cream, garlic baby potatoes', '£19.95'),
        item('Battered cod *', 'Peas, tartare sauce, lemon, salad garnish, triple cooked chips', '£19.95'),
        item('Battered scampi', 'Peas, tartare sauce, lemon, salad garnish', '£19.95')
      ]),
      section('Plant based', [
        item('Vegan coconut curry', 'Stir fry veg, saffron rice, naan bread', '£18.95'),
        item('Chargrilled cauliflower steak', 'Romesco sauce, pickled red onion, toasted almonds', '£18.95')
      ]),
      section('Why not add', [
        item('Chicken escalope', '', '£4'),
        item('Garlic prawns', '', '£5'),
        item('Honey chilli chicken wings', '', '£5')
      ]),
      list('On the side, £4.75', 'Triple cooked chips, garlic chips, chilli and sour chips, truffle and parmesan chips, sweet potato fries, salt and chilli chips, mash, champ, seasonal veg, rocket and parmesan salad, onion rings'),
      section('Sauces and dips', [
        item('Gravy', '', '£3 / £1.50'),
        item('Pepper, Bushmills, bacon and leek, or chorizo', '', '£3.50 / £2'),
        item('Dips', 'Garlic, BBQ, BBQ mayo, chilli, mayo, curry, ranch', '£1.50 / £2')
      ], 'Sauces come large or small.')
    ]
  },

  sunday: {
    label: 'Sunday lunch',
    when: 'Sunday, 12pm to 5pm',
    note: '',
    sections: [] // [ADD THE SUNDAY LUNCH MENU HERE]
  }
};

var ORDER = ['lunch', 'tea', 'weekend', 'sunday'];

function el(tag, className, text) {
  var e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

// Open on whichever menu is being served right now
function currentMenu() {
  var now = new Date(), d = now.getDay(), h = now.getHours();
  if (h < 17) return d === 0 ? 'sunday' : 'lunch';
  return (d >= 1 && d <= 4) ? 'tea' : 'weekend';
}

function render(id) {
  var m = MENUS[id];

  document.querySelectorAll('#tabs .pill').forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false');
  });
  document.getElementById('menu-title').textContent = m.label;
  document.getElementById('menu-when').textContent = m.when;
  var note = document.getElementById('menu-note');
  note.textContent = m.note;
  note.hidden = !m.note;
  document.getElementById('sunday-callout').hidden = m.sections.length > 0;

  var grid = document.getElementById('menu-grid');
  grid.innerHTML = '';
  m.sections.forEach(function (s) {
    var sec = el('section');
    sec.appendChild(el('h3', '', s.title));
    if (s.note) sec.appendChild(el('p', 'sec-note', s.note));
    if (s.text) {
      sec.appendChild(el('p', 'list-text', s.text));
    } else {
      var ul = el('ul');
      s.items.forEach(function (i) {
        var li = el('li');
        var row = el('div', 'row');
        row.appendChild(el('span', 'name', i.name));
        row.appendChild(el('span', 'price', i.price));
        li.appendChild(row);
        if (i.desc) li.appendChild(el('p', 'desc', i.desc));
        ul.appendChild(li);
      });
      sec.appendChild(ul);
    }
    grid.appendChild(sec);
  });

  if (history.replaceState) history.replaceState(null, '', '#' + id);
}

var tabs = document.getElementById('tabs');
ORDER.forEach(function (id) {
  var b = el('button', 'pill', MENUS[id].label);
  b.type = 'button';
  b.dataset.id = id;
  b.addEventListener('click', function () { render(id); });
  tabs.appendChild(b);
});

var fromHash = location.hash.replace('#', '');
render(MENUS[fromHash] ? fromHash : currentMenu());
