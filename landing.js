// Landing page: fills "today's widget" from the same feed the app reads,
// and fades sections in. The page is complete without this script.
(function () {
  var root = document.documentElement;
  var es = root.lang === "es";
  root.classList.add("js");

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { seen.observe(el); });

  var section = document.getElementById("today");
  if (!section) return;

  // Names as in Shared/Feed.swift (seasonName) and Widget/GospelWidget.swift (heading).
  var seasons = {
    advent: ["Advent", "Adviento"],
    christmas: ["Christmas Time", "Tiempo de Navidad"],
    lent: ["Lent", "Cuaresma"],
    triduum: ["Paschal Triduum", "Triduo Pascual"],
    easter: ["Easter Time", "Tiempo Pascual"],
    ordinary: ["Ordinary Time", "Tiempo Ordinario"]
  };
  var colors = {
    green: ["green", "verde"], violet: ["violet", "morado"],
    white: ["white", "blanco"], red: ["red", "rojo"],
    rose: ["rose", "rosa"], black: ["black", "negro"]
  };
  function pick(pair) { return pair ? pair[es ? 1 : 0] : ""; }

  var now = new Date();
  var key = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  fetch("feed.json").then(function (r) { return r.json(); }).then(function (feed) {
    var day = (feed.days || []).find(function (d) { return d.date === key; });
    if (!day) return;
    var lang = es ? "es" : "en";
    var gospel = day.gospel || {};
    var verse = gospel.verse && gospel.verse[lang];
    var celebration = day.celebration && day.celebration[lang];
    var season = pick(seasons[day.season] || seasons.ordinary);
    var heading = verse
      ? (celebration || (es ? "Evangelio de hoy" : "Today's Gospel"))
      : (celebration ? season : (es ? "Hoy" : "Today"));
    var reference = gospel.reference && gospel.reference[lang];
    var color = colors[day.color] ? day.color : "green";

    section.querySelectorAll(".w").forEach(function (w) {
      w.classList.add(color);
      w.querySelector(".w-h").textContent = heading;
      w.querySelector(".w-t").textContent = verse || celebration || season;
      w.querySelector(".w-r").textContent = reference || "";
    });
    var date = new Intl.DateTimeFormat(lang, { weekday: "long", month: "long", day: "numeric" }).format(now);
    date = date.charAt(0).toUpperCase() + date.slice(1);
    section.querySelector(".today-date").textContent = date + " · " + season + " · " + pick(colors[color]);
    section.hidden = false;
    document.getElementById("today-rule").hidden = false;
  }).catch(function () { /* the section stays hidden */ });
})();
