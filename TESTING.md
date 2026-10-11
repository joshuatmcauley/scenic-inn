# Testing The Scenic Inn website

Test on the live GitHub Pages link, on a laptop **and** a phone. Tick each box as you go.
Use your own email address for anything that gets sent, so you can see what the restaurant receives.

---

## 1. Loading screen
- [ ] Open the site in a **new private/incognito window**. You see the photo collage at half brightness with the logo, and it fades away within about 1–4 seconds.
- [ ] Click to another page. The loading screen does **not** show again.
- [ ] Close the window, open a new private window. It shows once again.

## 2. Home page
- [ ] The "What's cooking, and when" table highlights **today** with a "Today" tag.
- [ ] Nav links work: Menus, Large party, Events, Find us, the phone number (should offer to call on a phone) and Book a table.
- [ ] Christmas 2026 band: "Preorder for your party" opens Large party with the Christmas menu ready; "See the full menu" opens the Christmas tab.
- [ ] "Get directions" opens Google Maps at the pub.

## 3. Menus page
- [ ] Every tab shows a menu: Lunch, Tea time, Evening, Sunday lunch, Christmas 2026.
- [ ] The page opens on the menu being served right now (e.g. Tea time on a Monday evening).
- [ ] Evening dishes show "Contains: …" allergen lines, and the allergen key appears at the bottom.
- [ ] "Book a large party" box appears under each preorderable menu.
- [ ] Spot-check 5 prices against the printed menus.

## 4. Book a table (small group)
- [ ] Book 2 adults for tomorrow at a lunch time. Time slots are grouped by menu.
- [ ] Try to continue without a time: you see "Pick a time to continue."
- [ ] Try to confirm with an empty email: you see the error message.
- [ ] Complete it. You see "Booking confirmed" **and the restaurant email arrives** (check RESTAURANT_EMAIL inbox).

## 5. Book a table → large party hand-off
- [ ] On Book a table, set 11+ guests. The "Booking for 11 or more" notice appears.
- [ ] The last button says **"Continue to food choices"**. Click it.
- [ ] You land on Large party with the date, time, guest count, name, email and phone already filled in.

## 6. Large party: everyone chooses a meal
Run this once with **Christmas** (a Saturday in December, 7pm) and once with **Evening** (any Friday, 7pm).
- [ ] The calendar shows the current month. Past days can't be clicked. Use › to go forward.
- [ ] Pick a date and time. **Only menus served then appear** under "Which menu?" (see the table in section 9).
- [ ] Enter 12 guests, choose "Everyone chooses a meal", pick a menu, fill organiser details, Continue.
- [ ] Guest 1: type a name, pick a starter, main and dessert. The price at the top updates. The guest list on the left shows a ✓.
- [ ] Pick a dish that needs a side (e.g. 10oz sirloin). A side dropdown appears and the guest isn't ✓ until a side is chosen.
- [ ] Guest 2: click **"Same as previous guest"**. Their choices copy over.
- [ ] Evening menu only: tick "Gluten" under "Avoiding anything?". Dishes containing gluten get a dashed red border and "Contains gluten".
- [ ] Click **"Send the menu around"**. On a phone the share sheet opens; on a laptop you see "Link copied". Paste it somewhere and check it opens the right menu tab.
- [ ] **Close the tab, reopen Large party.** Everything you entered is still there.
- [ ] Click "Check the order". Guests without a main are listed with "Choose now" links that jump to that guest.
- [ ] The kitchen summary shows counts (e.g. "2× Hot beef salad").
- [ ] "Print or save as PDF" shows a clean printable page (no header/buttons).
- [ ] "Download spreadsheet" downloads a CSV that opens in Excel.
- [ ] **Send.** You see "Preorder sent" and **the restaurant receives the preorder PDF** with every guest's choices.

## 7. Large party: buffet and deposit
- [ ] Choose Buffet with **15 guests**. No deposit message appears.
- [ ] Change to **21 guests**. The "Buffets for more than 20 people need a £50 deposit" message appears.
- [ ] Continue. The buffet menu isn't added yet, so you see the "we'll call you to choose the food" message.
- [ ] Check the order: the deposit message shows again. Send it.
- [ ] The confirmation shows **"Secure your date with a £50 deposit"** and a PayPal button.
- [ ] Click the PayPal button. You see "Online payments aren't switched on yet…" (it's a placeholder).
- [ ] The restaurant email's notes say "Deposit of £50 required, not yet paid".

## 8. Events
- [ ] Nav → Events. The page title says "Events" and there's no buffet/meals choice (events are buffet).
- [ ] "Type of event" dropdown is there. Pick "Christening", fill everything in, send.
- [ ] The restaurant email notes include "Event booking. Buffet. Event: Christening".
- [ ] Large party and Events keep **separate** saved progress (start one, switch to the other, switch back).

## 9. Which menus should appear (date + time rules)

| Date and time | Menus that should appear |
|---|---|
| Monday, 6pm (not Nov/Dec) | Tea time |
| Tuesday, 1pm (not Nov/Dec) | Lunch |
| Friday, 7pm (not Nov/Dec) | Evening |
| Sunday, 1pm (not Nov/Dec) | Sunday lunch |
| Sunday, 7pm (not Nov/Dec) | Evening |
| Monday, 8:30pm (not Nov/Dec) | None, with a "try an earlier time" message |
| Any day in Nov or Dec | Christmas 2026 as well as the usual menu |

## 10. When things go wrong
- [ ] Turn on airplane mode at the "Check and send" step and press Send. You see "That didn't go through" with an **email it to us instead** link, and nothing is lost.
- [ ] Turn the internet back on and press "Try sending again". It works.
- [ ] Visit a page that doesn't exist (e.g. add `/nothing` to the address). You see the "Wrong turn" page with working buttons.

## 11. Phone checks
- [ ] No page scrolls sideways.
- [ ] The calendar days are easy to tap.
- [ ] On Large party, the guest list sits above the food choices and scrolling to the next guest is smooth.
- [ ] Phone numbers are tappable.

---

## Known gaps (not bugs)
- Buffet menu, kids menu and the deposit amount still need adding (`menu-data.js`, `config.js`).
- The PayPal button is a placeholder until PayPal is connected.
- Sunday lunch prices came from the old system; check them.
