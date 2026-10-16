// =====================================================================
// THE SCENIC INN – MENU DATA
// Every menu on the website (and in the group preorder) comes from here.
// To change a dish, price or allergen, edit it below. Nothing else needs to change.
//
// item(name, description, price, allergens, options)
//   price      number in pounds, or null for set-price menus
//   allergens  string of codes separated by spaces, e.g. 'G D S'
//   options    { complete: true }  -> comes complete, no side (shown with *)
//              { side: true }      -> guest chooses a side
//              { supplement: 4 }   -> extra charge on a set-price menu
//              { extra: 'Add grilled chicken £2' }
// =====================================================================

var ALLERGENS = {
  C: 'Crustaceans', D: 'Dairy', E: 'Egg', F: 'Fish', G: 'Gluten',
  M: 'Mustard', N: 'Nuts', S: 'Sulphites', SY: 'Soya', SES: 'Sesame'
};

// Dates the Christmas menu can be booked for (YYYY-MM-DD)
var CHRISTMAS_DATES = { from: '2026-11-01', to: '2026-12-31' };

function item(name, desc, price, allergens, opts) {
  opts = opts || {};
  return {
    name: name, desc: desc || '', price: (price === undefined ? null : price),
    allergens: allergens ? allergens.split(' ') : [],
    complete: !!opts.complete, side: !!opts.side,
    supplement: opts.supplement || 0, extra: opts.extra || ''
  };
}
function section(title, course, items, note) { return { title: title, course: course, items: items, note: note || '' }; }
function textSection(title, text, note) { return { title: title, course: null, text: text, items: [], note: note || '' }; }

var SIDES_EVENING = ['Triple cooked chips', 'Skinny fries', 'Chilli and sour cream fries', 'Garlic fries', 'Salt n chilli fries',
  'Champ', 'Mash', 'Lemon rice', 'Seasonal veg', 'Onion rings', 'Crispy onions', 'House salad', 'Rocket and balsamic salad'];

var MENUS = {

  // ------------------------------------------------------------------
  lunch: {
    label: 'Lunch',
    when: 'Monday to Saturday, 12pm to 4:45pm',
    days: [1, 2, 3, 4, 5, 6], times: ['12:00', '16:30'],
    note: 'Dishes marked * do not include a side. Other mains come with a side of your choice, except the lasagne. Sides are £3.95. Any food allergies, please alert your server.',
    showAllergens: true,
    sides: ['Chips', 'Garlic chips', 'Chilli and sour cream chips', 'Skinny fries', 'Salt n chilli chips', 'Mash', 'Champ', 'House salad', 'Rocket and balsamic salad', 'Lemon rice'],
    photos: [
      { src: 'steak.jpg', alt: 'Steak with chips, a roast tomato, crispy onions and pepper sauce' },
      { src: 'prawns-tempura.jpg', alt: 'Crispy battered prawns with lemon and two dips' }
    ],
    sections: [
      section('Sandwiches, wraps and toasties', 'main', [
        item('Roast beef', 'Rocket, sunblush tomato, scallion, mustard mayo', 7.95),
        item('Turkey, ham and stuffing', 'Cranberry, rocket', 7.95),
        item('Prawn', 'Guacamole, chives, rocket', 7.95),
        item('Sunblush tomato', 'Pesto, parmesan, rocket', 7.95)
      ], 'Served with side salad, coleslaw or tortilla chips. Add soup or fries for £3.'),
      section('Main meals', 'main', [
        item('Chicken wings', '12 wings, hot sauce, rocket, blue cheese mayo, scallion, pickled shallot', 8.95, 'E D M S', { complete: true }),
        item('Soup of the day', 'Guinness wheaten, salted butter', 5.95, '', { complete: true }),
        item('Caesar salad', 'Bacon, parmesan, garlic croutons, baby gem, dressing', 7.95, 'E G SY D', { complete: true, extra: 'Add grilled chicken £2' }),
        item('Scenic Inn nachos', 'Tortilla chips, mozzarella, cheddar, salsa, guacamole, sour cream, jalapeños, scallions', 7.95, 'D', { complete: true, extra: 'Add chilli mince £2' }),
        item('Seafood chowder', 'Prawns, salmon, haddock, coley, peas, scallion, carrot, white wine cream, Guinness wheaten, dulce butter', 14.95, 'D F C G', { complete: true }),
        item('Chicken stack', 'Pan roasted chicken, champ, crispy onions, pepper sauce', 15.95, 'D G', { complete: true }),
        item('Beer battered Atlantic haddock', 'Haddock, pea purée, tartare, curry sauce, lemon, triple cooked chips', 16.95, 'G F E M', { complete: true }),
        item('Scenic fry', 'Bacon, black pudding, pork sausage, fried egg, potato bread, soda bread, beans, grilled mushroom, grilled tomato', 9.95, 'G E', { complete: true }),
        item('Seafood linguine', 'Prawns, salmon, haddock, coley, peas, scallion, carrot, white wine cream, garlic ciabatta', 15.95, 'G F M S', { complete: true }),
        item('Chilli chicken, beef or veg pasta', 'Onions, peppers, penne, chilli, white wine cream, crispy onions, garlic croutons', 14.95, '', { complete: true, extra: 'Chicken or veg £14.95, beef £15.95' }),
        item('Chicken goujons', 'Panko breaded chicken, rocket, pickled shallot, dip, side', 14.95, 'G E D SY', { side: true }),
        item('Chicken strippers', 'Chinese glaze chicken goujons, dip, side', 15.95, 'G E D SY', { side: true }),
        item('SmokeHouse hunters chicken', 'Chicken, bacon, BBQ sauce, smoked applewood cheese, charred corn, Cajun slaw', 15.95, 'SY D E M', { side: true }),
        item('Brolly’s beef burger', '2 x 4oz Brolly’s beef burgers, smoked applewood cheddar, bacon, salsa, onion ring, rocket, slaw', 15.95, 'E D G M', { side: true }),
        item('Vegan beetroot burger', 'Beetroot burger, vegan cheese, vegan sriracha mayo, rocket, salsa', 15.95, 'G', { side: true }),
        item('Scenic steak ciabatta', 'Steak strips, mushroom, onions, rocket, crispy onions, pepper sauce', 18.95, 'G D', { side: true }),
        item('Maple glazed gammon', 'Gammon, rocket, pickled shallot, side', 17.95, '', { side: true }),
        item('Brolly’s beef lasagne', 'Salad, coleslaw, garlic ciabatta', 16.95, 'G D E M'),
        item('8oz Brolly’s sirloin steak', 'Roast ½ tomato, field mushroom, crispy onions, pepper sauce', 20.95, 'G D', { side: true })
      ]),
      textSection('Sides, all £3.95', 'Chips, garlic chips, chilli and sour cream chips, skinny fries, salt n chilli chips, mash, champ, house salad, rocket and balsamic salad, lemon rice')
    ]
  },

  // ------------------------------------------------------------------
  tea: {
    label: 'Tea time',
    when: 'Monday to Thursday, from 5pm',
    note: 'Two courses £22, three courses £26.',
    setPrice: { 2: 22, 3: 26 },
    minCourses: 2,
    days: [1, 2, 3, 4], times: ['17:00', '20:00'],
    photos: [
      { src: 'salmon-peas.jpg', alt: 'Seared salmon with crispy potatoes, broccoli, sugar snap peas and a chive cream' },
      { src: 'pork-belly-bites.jpg', alt: 'Korean BBQ pork belly bites with sesame and pickled veg' }
    ],
    sides: ['Triple cooked chips', 'Skinny fries', 'Chilli and sour cream fries', 'Salt and chilli fries', 'Garlic fries',
      'Mash', 'Champ', 'Seasonal veg', 'Lemon rice', 'House salad', 'Rocket and balsamic salad'],
    sections: [
      section('Starters', 'starter', [
        item('Soup of the day', 'Guinness wheaten, salted butter'),
        item('Bacon and cheddar garlic bread', 'Salad, garlic aioli'),
        item('Vegetable spring rolls', 'Rocket, pickled veg, chilli dip'),
        item('Buffalo chicken wings', '6 chicken wings, hot sauce, rocket, blue cheese mayo, scallion, pickled shallot'),
        item('Korean BBQ pork bites', 'Panko crumbed pork belly, Korean BBQ sauce, pickled veg, kewpie mayo, chives, sesame seeds'),
        item('Salt and chilli chicken strips', 'Peppers, onions, rocket, garlic aioli'),
        item('Scenic Inn nachos', 'Tortilla chips, mozzarella, cheddar, salsa, guacamole, sour cream, jalapeños, scallions', null, '', { extra: 'Add chilli mince £2' })
      ]),
      section('Main course', 'main', [
        item('Chicken stack', 'Champ, crispy onions, pepper sauce', null, '', { complete: true }),
        item('8oz Brolly’s sirloin steak', 'Grilled tomato, field mushroom, crispy onions, sea salt and black pepper butter, choice of side', null, '', { side: true, supplement: 4 }),
        item('6oz Brolly’s burger', 'Smoked applewood cheddar, bacon, salsa, battered onion ring, rocket, coleslaw, choice of side', null, '', { side: true, extra: 'Add an extra burger £3' }),
        item('Fish finger sandwich', 'Beer battered haddock fingers, ciabatta, rocket, tartare, sun blush tomatoes, capers, coleslaw, choice of side', null, '', { side: true }),
        item('Chilli chicken pasta', 'Onions, peppers, penne, chilli, white wine cream, crispy onions, garlic croutes', null, '', { complete: true }),
        item('Vegetable pasta', 'Onions, peppers, penne, chilli, white wine cream, crispy onions, garlic croutes', null, '', { complete: true }),
        item('Sizzling pepper beef', 'Beef strips, onions, mushrooms, pepper sauce, onion rings', null, '', { complete: true }),
        item('Chinese glazed chicken goujons', 'Rocket, pickled shallot, BBQ sauce, choice of side', null, '', { side: true }),
        item('Panko crumbed chicken goujons', 'Rocket, pickled shallot, BBQ sauce, choice of side', null, '', { side: true }),
        item('Chicken tikka masala', 'Peppers, onion, peas, lemon rice, naan bread', null, '', { complete: true }),
        item('Beef tikka masala', 'Peppers, onion, peas, lemon rice, naan bread', null, '', { complete: true }),
        item('Vegetable tikka masala', 'Peppers, onion, peas, lemon rice, naan bread', null, '', { complete: true }),
        item('Maple glazed gammon', 'Rocket, pickled shallot, choice of side', null, '', { side: true })
      ]),
      section('Dessert', 'dessert', [
        item('Dessert from tonight’s board', 'Your server will run through the desserts on the night')
      ]),
      textSection('Sides', 'Triple cooked chips, skinny fries, chilli and sour cream fries, salt and chilli fries, garlic fries, mash, champ, seasonal veg, lemon rice, house salad, rocket and balsamic salad'),
      textSection('Sauces', 'Pepper, mushroom, Bushmills, white wine cream, jus, gravy')
    ]
  },

  // ------------------------------------------------------------------
  evening: {
    label: 'Evening',
    when: 'Friday to Sunday, 5pm to 9pm',
    note: 'Mains come with a side of your choice, except dishes marked *. Some dishes can be adapted to suit allergen needs, so please ask your server.',
    showAllergens: true,
    days: [5, 6, 0], times: ['17:00', '20:30'],
    photos: [
      { src: 'steak.jpg', alt: 'Steak with chips, a roast tomato, crispy onions and pepper sauce' },
      { src: 'pork-belly-plate.jpg', alt: 'Crispy pork belly with mashed potato, roast cabbage, broccoli and gravy' },
      { src: 'pork-belly-bites.jpg', alt: 'Korean BBQ pork belly bites with sesame and pickled veg' }
    ],
    sides: SIDES_EVENING,
    sections: [
      section('Starters', 'starter', [
        item('Soup of the day', 'Guinness wheaten, salted butter', 5.95, 'G D S'),
        item('Buffalo chicken wings', '6 wings, hot sauce, rocket, blue cheese mayo, scallion, pickled shallot', 7.95, 'E D M S'),
        item('Korean BBQ pork belly bites', 'Panko crumb pork belly, Korean BBQ sauce, pickled veg, kewpie mayo, chives, sesame seeds', 8.95, 'G SY E M SES'),
        item('Chinese chicken strippers', 'Chicken strips in a battered Chinese glaze, salad garnish, BBQ mayo', 8.95, 'D G'),
        item('Whipped goats cheese', 'Goats cheese, granola, trio of beetroot, rocket, olive crumb, chive oil', 8.95, 'D N'),
        item('Caesar salad', 'Bacon, parmesan, garlic croutes, baby gem, Caesar dressing', 6.95, 'G SY D', { extra: 'Add grilled chicken £2' }),
        item('Piri piri prawns', 'King prawns, garlic, chilli, chorizo, sun blush tomato, cream, scallion, toasted ciabatta, pickled shallot', 8.95, 'C D G'),
        item('Scenic Inn nachos', 'Tortilla chips, mozzarella, cheddar, salsa, guacamole, sour cream, jalapeños, scallions', 7.95, 'D', { extra: 'Add chilli mince £2' }),
        item('Seafood chowder', 'Prawns, salmon, haddock, coley, peas, scallions, carrot, Guinness wheaten, dulse butter', 8.95, 'D F C G'),
        item('Lasagne bites', 'Panko crumbed lasagne, tomato, basil and red pepper sauce, parmesan, pesto, rocket', 8.95, 'G D N'),
        item('Crispy duck pancakes', 'Spiced duck, cucumber, scallion, hoisin plum sauce, rocket, pickled shallot, chilli dip', 8.95, 'G SY'),
        item('Salt and chilli chicken', 'Crispy coated chicken, peppers, onions, garlic aioli', 8.95, 'G E M')
      ]),
      section('Main course', 'main', [
        item('Guinness braised daube of beef', 'Slow braised daube of beef, vegetable casserole, chive mash, sautéed cabbage', 24.95, 'D', { complete: true }),
        item('Slow cooked Irish belly of pork', 'Braised pork belly, hispi cabbage, sweet potato mash, tenderstem, black pudding, cider jus', 23.95, 'D G', { complete: true }),
        item('Lime and hot honey roasted duck', 'Roast duck, lime and hot honey glaze, steamed greens, spiced baby carrots, sweet potato mash', 24.95, 'D', { complete: true }),
        item('Beef masala', 'Peppers, onions, peas, lemon rice, naan bread', 20.95, 'M D G', { complete: true }),
        item('Chilli beef pasta', 'Onions, peppers, penne, chilli, white wine cream, crispy onions, garlic croutes', 20.95, 'D G S', { complete: true }),
        item('Maple glazed gammon', 'Maple glazed gammon, pineapple, rocket, pickled shallot', 20.95, '', { side: true }),
        item('Scenic burger', 'Two 4oz Brolly’s beef burgers, smoked applewood cheese, bacon, salsa, onion ring, rocket, coleslaw', 18.95, 'E D G M', { side: true })
      ]),
      section('From the grill', 'main', [
        item('10oz Brolly’s sirloin', 'Grilled tomato, field mushroom, crispy onions, sea salt and black pepper butter, choice of sauce', 29.95, 'D', { side: true, extra: 'Add chicken escalope or prawns £3' }),
        item('10oz Brolly’s ribeye', 'Grilled tomato, field mushroom, crispy onions, sea salt and black pepper butter, choice of sauce', 29.95, 'D', { side: true, extra: 'Add chicken escalope or prawns £3' })
      ]),
      section('Chicken', 'main', [
        item('Chicken goujons', 'Panko crumb fillet, rocket, pickled shallot, side, dip', 17.95, 'G E D SY', { side: true }),
        item('Chilli chicken penne', 'Onions, peppers, penne, chilli, white wine cream, crispy onions, garlic croutes', 18.95, 'D G S', { complete: true }),
        item('Chinese chicken strippers', 'Chinese coated battered chicken goujons, rocket, pickled shallot, dip, side', 19.95, 'D G S', { side: true }),
        item('Smoke house hunters chicken', 'Chicken, bacon, BBQ sauce, smoked applewood cheddar, charred corn, Cajun slaw, side', 21.95, 'SY D E M', { side: true }),
        item('Chicken supreme stack', 'Pan roasted chicken supreme, champ, pepper sauce', 21.95, 'D G', { complete: true }),
        item('Chicken masala', 'Peppers, onions, peas, lemon rice, naan bread', 21.95, 'M D G', { complete: true }),
        item('Sizzling pepper chicken', 'Chicken escalope, mushrooms, peas, pepper sauce, onion rings', 21.95, 'M D G', { side: true }),
        item('Chicken Maryland', 'Panko crumbed fillet, bacon, sausage, banana fritter, grilled pineapple, charred corn, white wine cream', 22.95, 'E G S D', { side: true })
      ]),
      section('Fish', 'main', [
        item('Herb crusted seared salmon', 'Salmon, crushed garlic potato, steamed greens, lemon and chive cream', 20.95, 'F D S', { complete: true }),
        item('Beer battered haddock', 'Haddock, pea purée, tartare, curry sauce, lemon', 19.95, '', { complete: true }),
        item('Seafood linguine', 'Prawns, salmon, haddock, coley, peas, scallion, carrot, white wine cream, garlic ciabatta', 19.95, 'G D F C M S', { complete: true })
      ]),
      section('Vegetarian and vegan', 'main', [
        item('Veg pasta', 'Veg, penne, chilli, white wine cream, crispy onions, garlic croutes', 18.95, 'D G S', { complete: true }),
        item('Veg masala', 'Veg, lemon rice, naan bread', 17.95, '', { complete: true }),
        item('Vegan beetroot burger', 'Beetroot burger, vegan cheese, vegan sriracha mayo, salsa, rocket', 17.95, '', { side: true })
      ]),
      textSection('On the side, £4.75', 'Triple cooked chips, skinny fries, chilli and sour cream fries (D), champ (D), lemon rice, onion rings (E), rocket and balsamic salad, garlic fries (D), salt n chilli fries, mash, seasonal veg, crispy onions, house salad'),
      section('Sauces', null, [
        item('Gravy', 'Large £3, small £1.50', null, 'G'),
        item('Pepper', 'Large £3.50, small £2', null, 'G D'),
        item('Bushmills', 'Large £3.50, small £2', null, 'D'),
        item('White wine', 'Large £3.50, small £2', null, 'D S'),
        item('Mushroom', 'Large £3.50, small £2', null, 'D')
      ]),
      textSection('Dips, £1.50 or £2', 'Garlic, BBQ, BBQ mayo, chilli, mayo, curry')
    ]
  },

  // ------------------------------------------------------------------
  sunday: {
    label: 'Sunday lunch',
    when: 'Sunday, 12pm to 5pm',
    note: 'One course £18.95, two courses £22.95, three courses £26.95. Some dishes can be adapted to suit allergen needs, so please ask your server.',
    showAllergens: true,
    setPrice: { 1: 18.95, 2: 22.95, 3: 26.95 },
    minCourses: 1,
    days: [0], times: ['12:00', '16:30'],
    photos: [
      { src: 'braised-beef.jpg', alt: 'Braised beef with chive mash, savoy cabbage and a rich gravy' },
      { src: 'salmon-lemon.jpg', alt: 'Pan-fried salmon with crispy potatoes, broccoli, sugar snap peas and a chive cream' }
    ],
    sections: [
      section('Starters', 'starter', [
        item('Vegetable broth', 'With Guinness wheaten and salted butter', null, 'G D S'),
        item('Prawn, mango and red pepper salad', '', null, 'C'),
        item('Deviled eggs', 'Filled with Dijon, chive and paprika, on rocket and pickled shallot', null, 'E M D'),
        item('Salt and chilli chicken strips', 'With peppers and onions, on rocket with garlic aioli', null, 'G E M')
      ]),
      section('Main course', 'main', [
        item('Daube of beef', 'Served with Yorkshire pudding and red wine gravy', null, 'G D'),
        item('Turkey and ham', 'Served with sage and onion stuffing and red wine gravy', null, 'G'),
        item('Chicken supreme', 'Served with crispy onions and red wine gravy', null, 'G'),
        item('Fillet of salmon', 'Served with fried capers and lemon and chive cream', null, 'F D S')
      ]),
      section('Dessert', 'dessert', [
        item('Dessert', 'Please see your server for our delicious dessert options')
      ])
    ]
  },

  // ------------------------------------------------------------------
  christmas: {
    label: 'Christmas 2026',
    when: 'Bookings now open',
    note: 'One course £19.95, two courses £24.95, three courses £28.95.',
    setPrice: { 1: 19.95, 2: 24.95, 3: 28.95 },
    minCourses: 1,
    christmas: true, times: ['12:00', '20:30'],
    photos: [
      { src: 'christmas-room.jpg', alt: 'The dining room decorated for Christmas' },
      { src: 'cheesecake.jpg', alt: 'Cheesecake with chocolate, cream and vanilla ice cream' }
    ],
    sides: ['Triple cooked chips', 'Skinny fries', 'Mash', 'Champ', 'Seasonal veg', 'House salad'],
    sections: [
      section('Starters', 'starter', [
        item('Vegetable broth', 'Guinness wheaten and salted butter'),
        item('Pan seared king prawns', 'With pancetta in a garlic cream, parsnips, golden raisins and samphire'),
        item('Shredded duck rillette', 'Port reduction and herb croutes'),
        item('Orange and beetroot salad', 'Cranberries, rocket and a honey mustard dressing'),
        item('Hot beef salad', 'Encrusted in peppercorns, on rocket with a balsamic glaze and parmesan'),
        item('Egg mayonnaise', 'Topped with a whipped Dijon and paprika aioli, on rocket')
      ]),
      section('Main courses', 'main', [
        item('Turkey and ham', 'Sage and cranberry stuffing'),
        item('Daube of beef', 'Served with Yorkshire pudding'),
        item('Chicken supreme', 'With crispy bacon'),
        item('Maple glazed gammon and pineapple', 'With a choice of side', null, '', { side: true }),
        item('Vegan mushroom and leek pithivier', 'Thyme potatoes, roasted root vegetables and vegan gravy'),
        item('Darne of salmon', 'On a bed of sweet potato with steamed greens, grated chestnut and a red pepper and tomato sauce'),
        item('10oz sirloin steak', 'Roasted shallots, grilled mushroom, peppercorn sauce and a choice of side', null, '', { side: true, supplement: 5 })
      ], 'Turkey and ham, daube of beef and chicken supreme are all served with creamed potato, rosemary roast potatoes, roasted root vegetables, bacon and parmesan sprouts, chipolatas and gravy.'),
      section('Desserts', 'dessert', [
        item('Christmas pudding', 'Brandy crème anglaise'),
        item('Winter berry pavlova', ''),
        item('Baileys cheesecake', 'Chantilly cream'),
        item('Chocolate and orange ice cream sundae', ''),
        item('White chocolate and raspberry roulade', ''),
        item('Vegan raspberry frangipane', 'With berries'),
        item('Sticky toffee pudding', '')
      ])
    ]
  }
};

var MENU_ORDER = ['lunch', 'tea', 'evening', 'sunday', 'christmas'];

// Menus that can be preordered for a group
var PREORDER_MENUS = ['christmas', 'evening', 'tea', 'sunday', 'lunch'];

// ---------------------------------------------------------------------
// BUFFET (for events and large parties)
// maxChoices: how many dishes a group can pick from the buffet (null = no limit).
// pricePerHead: number in pounds, or null to leave the price off.
// Each dish needs a different name, because the name is what the kitchen sees.
// Vegan and vegetarian options to be added later.
// ---------------------------------------------------------------------
var BUFFET = {
  label: 'Buffet',
  note: '',
  maxChoices: 4,
  pricePerHead: null,
  // Made separately for anyone with an allergy, as their own plate.
  // These don't count towards the buffet choices.
  allergyItems: [
    item('Gluten free goujons'),
    item('Gluten free chicken wings', 'No sauce'),
    item('Gluten free chicken bites')
  ],
  sections: [
    section('Buffet menu', null, [
      item('Chicken wings'),
      item('Vegetable spring rolls'),
      item('Chips'),
      item('Skinny fries'),
      item('Cocktail sausages'),
      item('Chicken goujons'),
      item('Salad'),
      item('Salt and chilli chicken'),
      item('Chicken bites')
    ]),
    section('Sandwiches', null, [
      item('Cheese and tomato sandwiches'),
      item('Sweet chilli chicken sandwiches'),
      item('Tuna and mayo sandwiches'),
      item('Egg and onion sandwiches'),
      item('Ham and cheese sandwiches'),
      item('Salad sandwiches')
    ])
  ]
};

var EVENT_TYPES = ['Birthday', 'Christening', 'Communion or confirmation', 'Engagement', 'Anniversary', 'Funeral or wake', 'Work night out', 'Christmas party', 'Other'];

function formatPrice(n) {
  if (n === null || n === undefined || n === '') return '';
  return '£' + (Number.isInteger(n) ? n : n.toFixed(2));
}
