/**
 * Meeting load — a GitHub-style contribution graph for your calendar.
 *
 * Counts only meetings you host or are invited to, merges overlapping
 * bookings so a double-booked hour counts once, and splits the year at
 * the school-year boundary.
 *
 * Every user picks their own calendars; nothing is hardcoded to one person.
 */

// ---------------------------------------------------------------------------
// The only value the installer sets. Everything else is per-user.
// ---------------------------------------------------------------------------

/** Paste your web app URL here after deploying. Shared by all users. */
var WEB_APP_URL = '';

/** Fallback school-year rollover, used until a user changes theirs. */
var DEFAULT_YEAR_START = '07-17';

// ---------------------------------------------------------------------------

var TZ = Session.getScriptTimeZone();
var CACHE_SECONDS = 3600;
var MAX_EVENT_HOURS = 14;
var PROP_CALENDARS = 'calendars';
var PROP_YEAR_START = 'yearStart';

// --- Per-user settings -----------------------------------------------------

function settings_() {
  var props = PropertiesService.getUserProperties();
  var raw = props.getProperty(PROP_CALENDARS);
  return {
    calendars: raw ? JSON.parse(raw) : [],
    yearStart: props.getProperty(PROP_YEAR_START) || DEFAULT_YEAR_START
  };
}

function myCalendars_() {
  var out = [];
  var pageToken = null;
  do {
    var res = Calendar.CalendarList.list({ maxResults: 250, pageToken: pageToken });
    (res.items || []).forEach(function (c) {
      if (c.id.indexOf('#holiday@') > -1) return;
      out.push({ id: c.id, name: c.summaryOverride || c.summary, primary: !!c.primary });
    });
    pageToken = res.nextPageToken;
  } while (pageToken);
  out.sort(function (a, b) { return (b.primary ? 1 : 0) - (a.primary ? 1 : 0); });
  return out;
}

// --- Cards -----------------------------------------------------------------

function onHomepage(e) {
  var cfg = settings_();
  if (!cfg.calendars.length) return onSettings(e);

  var years = schoolYears_(cfg.yearStart);
  var current = summarise_(years.current.start, years.current.end, cfg.calendars);
  var previous = summarise_(years.previous.start, years.previous.end, cfg.calendars);

  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Meeting load'));

  card.addSection(
    CardService.newCardSection()
      .setHeader(years.current.label)
      .addWidget(stat_('Hours booked', current.hours.toFixed(0) + ' h'))
      .addWidget(stat_('Days with meetings', String(current.days)))
      .addWidget(stat_('Median busy day', current.median.toFixed(1) + ' h'))
      .addWidget(stat_('Busiest day', current.max.toFixed(1) + ' h'))
  );

  card.addSection(
    CardService.newCardSection()
      .setHeader(years.previous.label + ' (for comparison)')
      .addWidget(stat_('Hours booked', previous.hours.toFixed(0) + ' h'))
      .addWidget(stat_('Median busy day', previous.median.toFixed(1) + ' h'))
  );

  var actions = CardService.newCardSection();
  if (WEB_APP_URL) {
    actions.addWidget(
      CardService.newTextButton()
        .setText('Open the graph')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOpenLink(
          CardService.newOpenLink()
            .setUrl(WEB_APP_URL)
            .setOpenAs(CardService.OpenAs.OVERLAY)
            .setOnClose(CardService.OnClose.NOTHING)
        )
    );
  }
  actions.addWidget(
    CardService.newTextButton()
      .setText('Refresh')
      .setOnClickAction(CardService.newAction().setFunctionName('onRefresh'))
  );
  actions.addWidget(
    CardService.newTextButton()
      .setText('Choose calendars')
      .setOnClickAction(CardService.newAction().setFunctionName('onSettings'))
  );
  card.addSection(actions);

  return card.build();
}

function onSettings(e) {
  var cfg = settings_();
  var picker = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle('Calendars to include')
    .setFieldName('calendars');

  myCalendars_().forEach(function (c) {
    var label = c.name + (c.primary ? ' (yours)' : '');
    picker.addItem(label, c.id, cfg.calendars.indexOf(c.id) > -1);
  });

  var yearStart = CardService.newTextInput()
    .setFieldName('yearStart')
    .setTitle('Year starts on (MM-DD)')
    .setValue(cfg.yearStart)
    .setHint('Your school or fiscal year rollover, e.g. 07-17');

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Settings'))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            'Pick the calendars to read. Meetings you did not host and were ' +
            'not invited to are ignored, so extra calendars will not inflate ' +
            'your numbers.'
          )
        )
        .addWidget(picker)
        .addWidget(yearStart)
        .addWidget(
          CardService.newTextButton()
            .setText('Save')
            .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction().setFunctionName('onSaveSettings'))
        )
    )
    .build();
}

function onSaveSettings(e) {
  var input = (e && e.formInput) || {};
  var picked = input.calendars || [];
  if (typeof picked === 'string') picked = [picked];

  if (!picked.length) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Pick at least one calendar'))
      .build();
  }

  var yearStart = (input.yearStart || DEFAULT_YEAR_START).trim();
  if (!/^\d{2}-\d{2}$/.test(yearStart)) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('Use MM-DD, for example 07-17'))
      .build();
  }

  PropertiesService.getUserProperties()
    .setProperty(PROP_CALENDARS, JSON.stringify(picked))
    .setProperty(PROP_YEAR_START, yearStart);
  CacheService.getUserCache().removeAll(cacheKeys_());

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(onHomepage({})))
    .setNotification(CardService.newNotification().setText('Saved'))
    .build();
}

function stat_(label, value) {
  return CardService.newDecoratedText().setTopLabel(label).setText(value);
}

function onRefresh() {
  CacheService.getUserCache().removeAll(cacheKeys_());
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(onHomepage({})))
    .setNotification(CardService.newNotification().setText('Refreshed'))
    .build();
}

// --- Web app ---------------------------------------------------------------

function doGet() {
  var cfg = settings_();
  if (!cfg.calendars.length) {
    return HtmlService.createHtmlOutput(
      '<p style="font-family:Roboto,sans-serif;padding:24px">' +
      'Open the add-on in Google Calendar and choose your calendars first.</p>'
    );
  }
  var years = schoolYears_(cfg.yearStart);
  var t = HtmlService.createTemplateFromFile('Index');
  t.data = JSON.stringify({
    current: gridFor_(years.current, cfg.calendars),
    previous: gridFor_(years.previous, cfg.calendars)
  });
  return t.evaluate()
    .setTitle('Meeting load')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function gridFor_(year, calendars) {
  var daily = dailyHours_(year.start, year.end, calendars);
  var s = summarise_(year.start, year.end, calendars);

  var gridStart = new Date(year.start.getTime());
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));

  var cells = [];
  var cursor = new Date(gridStart.getTime());
  while (cursor <= year.end) {
    cells.push(cursor < year.start ? null : (daily[iso_(cursor)] || 0));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    label: year.label,
    range: pretty_(year.start) + ' – ' + pretty_(year.end),
    gridStart: iso_(gridStart),
    cells: cells,
    hours: Math.round(s.hours),
    days: s.days,
    median: Number(s.median.toFixed(1)),
    max: Number(s.max.toFixed(1))
  };
}

// --- Data ------------------------------------------------------------------

function summarise_(start, end, calendars) {
  var daily = dailyHours_(start, end, calendars);
  var busy = [];
  for (var k in daily) if (daily[k] > 0) busy.push(daily[k]);
  busy.sort(function (a, b) { return a - b; });
  if (!busy.length) return { hours: 0, days: 0, median: 0, max: 0 };
  var total = busy.reduce(function (a, b) { return a + b; }, 0);
  var mid = Math.floor(busy.length / 2);
  return {
    hours: total,
    days: busy.length,
    median: busy.length % 2 ? busy[mid] : (busy[mid - 1] + busy[mid]) / 2,
    max: busy[busy.length - 1]
  };
}

function dailyHours_(start, end, calendars) {
  var key = 'load:' + iso_(start) + ':' + iso_(end);
  var cache = CacheService.getUserCache();
  var hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  var me = (Session.getActiveUser().getEmail() || '').toLowerCase();
  var byDay = {};
  var seen = {};

  calendars.forEach(function (calId) {
    var pageToken = null;
    do {
      var res;
      try {
        res = Calendar.Events.list(calId, {
          timeMin: start.toISOString(),
          timeMax: endOfDay_(end).toISOString(),
          singleEvents: true,
          maxResults: 2500,
          pageToken: pageToken
        });
      } catch (err) {
        console.warn('Skipping ' + calId + ': ' + err);
        return;
      }
      (res.items || []).forEach(function (ev) {
        var uid = ev.iCalUID || ev.id;
        if (seen[uid] || !keep_(ev, me)) return;
        seen[uid] = true;

        var s = new Date(ev.start.dateTime);
        var e = new Date(ev.end.dateTime);
        var hours = (e - s) / 3600000;
        if (hours <= 0 || hours > MAX_EVENT_HOURS) return;

        var day = Utilities.formatDate(s, TZ, 'yyyy-MM-dd');
        (byDay[day] = byDay[day] || []).push([s.getTime(), e.getTime()]);
      });
      pageToken = res.nextPageToken;
    } while (pageToken);
  });

  var out = {};
  for (var day in byDay) out[day] = Math.round(mergedHours_(byDay[day]) * 100) / 100;
  cache.put(key, JSON.stringify(out), CACHE_SECONDS);
  return out;
}

/**
 * Keeps an event only if you host it, or are on the guest list and did not
 * decline. Drops out-of-office, working-location, birthdays and all-day items.
 */
function keep_(ev, me) {
  if (ev.status === 'cancelled') return false;
  if (['outOfOffice', 'workingLocation', 'birthday'].indexOf(ev.eventType) > -1) return false;
  if (!ev.start || !ev.start.dateTime) return false;

  var mine = null;
  (ev.attendees || []).forEach(function (a) {
    if (!mine && (a.self || (a.email || '').toLowerCase() === me)) mine = a;
  });
  if (mine) return mine.responseStatus !== 'declined';

  var organizer = ((ev.organizer || {}).email || '').toLowerCase();
  var creator = ((ev.creator || {}).email || '').toLowerCase();
  return organizer === me || creator === me;
}

function mergedHours_(intervals) {
  intervals.sort(function (a, b) { return a[0] - b[0]; });
  var merged = [];
  intervals.forEach(function (iv) {
    var last = merged[merged.length - 1];
    if (last && iv[0] <= last[1]) last[1] = Math.max(last[1], iv[1]);
    else merged.push([iv[0], iv[1]]);
  });
  return merged.reduce(function (sum, iv) { return sum + (iv[1] - iv[0]); }, 0) / 3600000;
}

// --- Dates -----------------------------------------------------------------

function schoolYears_(yearStart) {
  var parts = yearStart.split('-');
  var month = Number(parts[0]);
  var day = Number(parts[1]);
  var today = new Date();
  var boundary = new Date(today.getFullYear(), month - 1, day);
  var startYear = today >= boundary ? today.getFullYear() : today.getFullYear() - 1;

  function yearFrom(y) {
    var start = new Date(y, month - 1, day);
    var end = new Date(new Date(y + 1, month - 1, day).getTime() - 86400000);
    if (end > today) end = today;
    return { start: start, end: end, label: y + '–' + ('0' + ((y + 1) % 100)).slice(-2) };
  }
  return { current: yearFrom(startYear), previous: yearFrom(startYear - 1) };
}

function cacheKeys_() {
  var y = schoolYears_(settings_().yearStart);
  return [
    'load:' + iso_(y.current.start) + ':' + iso_(y.current.end),
    'load:' + iso_(y.previous.start) + ':' + iso_(y.previous.end)
  ];
}

function iso_(d) { return Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); }
function pretty_(d) { return Utilities.formatDate(d, TZ, 'd MMM yyyy'); }
function endOfDay_(d) {
  var x = new Date(d.getTime());
  x.setHours(23, 59, 59, 999);
  return x;
}
