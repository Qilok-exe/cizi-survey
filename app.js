(function () {
  "use strict";

  const survey = window.SURVEY;
  const results = document.getElementById("results");
  const featuredResults = document.getElementById("featured-results");
  const SVG = "http://www.w3.org/2000/svg";
  const root = document.documentElement;

  // Charts grow and numbers count up the first time they scroll into view, unless the reader asked for less motion.
  const motion = "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (motion) root.classList.add("motion");

  const percent = (count, n) => Math.round((count / n) * 100);
  const number = (value) => value.toLocaleString("en-US");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgEl(tag, attrs) {
    const node = document.createElementNS(SVG, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  // Sort by size with catch-alls at the end; ordered scales keep the order they were asked in.
  function ordered(q) {
    if (q.order !== "size") return q.options.slice();
    const bySize = (a, b) => b.count - a.count;
    const main = q.options.filter((o) => !o.last).sort(bySize);
    const tail = q.options.filter((o) => o.last).sort(bySize);
    return main.concat(tail);
  }

  // A number that counts up from zero when its chart comes into view.
  const format = (node, value) => number(value) + node.dataset.unit;

  function counter(className, value, unit) {
    const node = el("span", className);
    node.dataset.to = value;
    node.dataset.unit = unit || "";
    node.textContent = format(node, value);
    return node;
  }

  // Rows start one after another; a bar and its number share the delay.
  const stagger = (node, i) => node.style.setProperty("--delay", Math.min(i * 50, 400) + "ms");

  function valueLabel(className, count, n) {
    const value = el("span", className);
    value.append(counter("value-pct", percent(count, n), "%"), counter("value-count", count));
    return value;
  }

  function figure(q) {
    const fig = el("figure", "chart chart-" + q.chart);
    fig.id = q.id.toLowerCase();
    const caption = el("figcaption");
    const title = el(q.featured ? "h3" : "h2", "chart-title");
    title.id = q.id.toLowerCase() + "-title";
    title.append(el("span", "chart-num", q.id + "."), " " + q.text);
    caption.append(title);
    fig.append(caption);
    return fig;
  }

  function footnote(q) {
    const foot = el("p", "chart-foot");
    (q.notes || []).forEach((note) => foot.append(el("span", null, note), " "));
    foot.append(el("span", null, "n = " + number(q.n)));
    return foot;
  }

  // The same numbers as the chart, for screen readers. The drawn chart is aria-hidden.
  // The table sits in a hidden wrapper because a table will not shrink to the 1px box itself.
  function hiddenTable(headers, groups) {
    const wrap = el("div", "sr-only");
    const table = el("table");
    const headRow = el("tr");
    headers.forEach((h) => {
      const th = el("th", null, h);
      th.scope = "col";
      headRow.append(th);
    });
    table.append(el("thead"));
    table.tHead.append(headRow);
    groups.forEach((group) => {
      const body = el("tbody");
      if (group.label) {
        const tr = el("tr");
        const th = el("th", null, group.label);
        th.scope = "rowgroup";
        th.colSpan = headers.length;
        tr.append(th);
        body.append(tr);
      }
      group.rows.forEach((cells) => {
        const tr = el("tr");
        const th = el("th", null, cells[0]);
        th.scope = "row";
        tr.append(th);
        cells.slice(1).forEach((c) => tr.append(el("td", null, c)));
        body.append(tr);
      });
      table.append(body);
    });
    wrap.append(table);
    return wrap;
  }

  const withCount = (count, n) => percent(count, n) + "% (" + number(count) + ")";

  function answerTable(q, options) {
    return hiddenTable(["Answer", "Percent (people)"], [
      { rows: options.map((o) => [o.label, withCount(o.count, q.n)]) }
    ]);
  }

  // Colors. The heatmap runs light to dark; ordered scales use shades of the accent.
  const LOW = [0xe6, 0xf3, 0xee];
  const HIGH = [0x00, 0x35, 0x22];
  const ACCENT = [0x00, 0x64, 0x50];
  const SHADE_LIGHT = [0xbc, 0xda, 0xcd];
  const DARK_TEXT = [0x23, 0x1f, 0x20];
  const WHITE = [0xff, 0xff, 0xff];
  const BLACK = [0x00, 0x00, 0x00];

  const mix = (a, b, t) => a.map((c, i) => Math.round(c + (b[i] - c) * t));
  const rgb = (c) => "rgb(" + c.join(", ") + ")";

  // n shades from light to dark: tints of the accent, then the darkest green.
  function shades(n) {
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 1 : i / (n - 1);
      return t < 0.75 ? mix(SHADE_LIGHT, ACCENT, t / 0.75) : mix(ACCENT, HIGH, (t - 0.75) / 0.25);
    });
  }

  function shadesFor(q) {
    const list = shades(q.options.length);
    return q.shading === "first-darkest" ? list.reverse() : list;
  }

  function luminance(c) {
    const [r, g, b] = c.map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  // Mid-ramp cells can fall short of 4.5:1 with both white and the page's dark text; black clears it there.
  function textOn(fill) {
    const best = contrast(fill, WHITE) > contrast(fill, DARK_TEXT) ? WHITE : DARK_TEXT;
    return contrast(fill, best) >= 4.5 ? best : BLACK;
  }

  // Horizontal bars, or a lighter dot on a line for "lollipop".
  function bars(q) {
    const fig = figure(q);
    const options = ordered(q);
    const list = el("div", q.chart === "lollipop" ? "bars bars-lollipop" : "bars");
    list.setAttribute("aria-hidden", "true");
    options.forEach((o, i) => {
      const row = el("div", "bar-row");
      stagger(row, i);
      const track = el("div", "bar-track");
      const bar = el("span", "bar");
      bar.style.setProperty("--f", o.count / q.n);
      track.append(bar, valueLabel("value", o.count, q.n));
      row.append(el("span", "bar-label", o.label), track);
      list.append(row);
    });
    fig.append(list, footnote(q), answerTable(q, options));
    return fig;
  }

  // One whole split into parts, in scale order, clockwise from the top.
  function donut(q) {
    const fig = figure(q);
    const colors = shadesFor(q);
    const wrap = el("div", "donut-wrap");
    wrap.setAttribute("aria-hidden", "true");

    const r = 76;
    const around = 2 * Math.PI * r;
    const total = q.options.reduce((sum, o) => sum + o.count, 0);
    const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "donut" });

    // A ring mask that draws clockwise from the top uncovers the slices.
    const maskId = "sweep-" + q.id.toLowerCase();
    const mask = svgEl("mask", { id: maskId, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 200, height: 200 });
    const sweep = svgEl("circle", {
      class: "donut-sweep", cx: 100, cy: 100, r, fill: "none", stroke: "#fff", "stroke-width": 44,
      "stroke-dasharray": around + " " + around,
      transform: "rotate(-90 100 100)"
    });
    sweep.style.setProperty("--around", around + "px");
    mask.append(sweep);
    const slices = svgEl("g", { mask: "url(#" + maskId + ")" });
    svg.append(mask, slices);

    let start = 0;
    q.options.forEach((o, i) => {
      const length = (o.count / total) * around;
      slices.append(svgEl("circle", {
        cx: 100, cy: 100, r, fill: "none", stroke: rgb(colors[i]), "stroke-width": 40,
        "stroke-dasharray": Math.max(length - 2, 0) + " " + around,
        "stroke-dashoffset": -start,
        transform: "rotate(-90 100 100)"
      }));
      start += length;
    });

    const key = el("div", "key-list");
    q.options.forEach((o, i) => {
      const row = el("div", "key-row");
      const swatch = el("span", "swatch");
      swatch.style.background = rgb(colors[i]);
      row.append(swatch, el("span", "key-label", o.label), valueLabel("value", o.count, q.n));
      key.append(row);
    });

    wrap.append(svg, key);
    fig.append(wrap, footnote(q), answerTable(q, q.options));
    return fig;
  }

  // A ranked list led by large percentages, with a thin bar for scale.
  function ranked(q) {
    const fig = figure(q);
    const options = ordered(q);
    const list = el("div", "ranked");
    list.setAttribute("aria-hidden", "true");
    options.forEach((o, i) => {
      const row = el("div", "ranked-row");
      stagger(row, i);
      const body = el("div", "ranked-body");
      const meter = el("div", "ranked-meter");
      const bar = el("span", "ranked-bar");
      bar.style.setProperty("--f", o.count / q.n);
      meter.append(bar, counter("value-count", o.count));
      body.append(el("span", "ranked-label", o.label), meter);
      row.append(counter("ranked-pct", percent(o.count, q.n), "%"), body);
      list.append(row);
    });
    fig.append(list, footnote(q), answerTable(q, options));
    return fig;
  }

  // Circles sized by area. A catch-all like "Nothing" is gray.
  function circles(q) {
    const fig = figure(q);
    const options = ordered(q);
    const largest = Math.max(...options.map((o) => o.count));
    const grid = el("div", "circles");
    grid.setAttribute("aria-hidden", "true");
    options.forEach((o, i) => {
      const cell = el("div", "circle-cell");
      stagger(cell, i);
      const box = el("span", "circle-box");
      const dot = el("span", o.last ? "circle circle-muted" : "circle");
      dot.style.setProperty("--s", largest ? Math.sqrt(o.count / largest) : 0);
      box.append(dot);
      cell.append(box, valueLabel("value circle-value", o.count, q.n), el("span", "circle-label", o.label));
      grid.append(cell);
    });
    fig.append(grid, footnote(q), answerTable(q, options));
    return fig;
  }

  function heatmap(q) {
    const fig = figure(q);
    const max = Math.max(...q.rows.flatMap((r) => r.counts));
    const scroll = el("div", "heatmap-scroll");
    scroll.setAttribute("role", "region");
    scroll.setAttribute("aria-labelledby", q.id.toLowerCase() + "-title");

    const table = el("table", "heatmap");
    const headRow = el("tr");
    headRow.append(el("td", "heatmap-corner"));
    q.columns.forEach((c) => {
      const th = el("th", null, c);
      th.scope = "col";
      headRow.append(th);
    });
    table.append(el("thead"));
    table.tHead.append(headRow);

    const body = el("tbody");
    q.rows.forEach((r, i) => {
      const tr = el("tr");
      stagger(tr, i);
      const th = el("th", null, r.label);
      th.scope = "row";
      tr.append(th);
      r.counts.forEach((count) => {
        const fill = mix(LOW, HIGH, max ? count / max : 0);
        const td = el("td");
        td.style.setProperty("--fill", rgb(fill));
        td.style.setProperty("--ink", rgb(textOn(fill)));
        // Screen readers skip the counting number and get the final one.
        const shown = counter(null, percent(count, q.n), "%");
        shown.setAttribute("aria-hidden", "true");
        td.append(shown, el("span", "sr-only", withCount(count, q.n)));
        tr.append(td);
      });
      body.append(tr);
    });
    table.append(body);
    scroll.append(table);
    fig.append(scroll, footnote(q));
    return fig;
  }

  function stacked(q) {
    const fig = figure(q);
    const chart = el("div", "stacked");
    chart.setAttribute("aria-hidden", "true");

    const legend = el("div", "legend");
    q.columns.forEach((c, i) => {
      const item = el("span", "legend-item");
      item.append(el("span", "swatch seg-" + i), c);
      legend.append(item);
    });
    chart.append(legend);

    let index = 0;
    const tableGroups = q.groups.map((g) => {
      const rows = g.rows.slice().sort((a, b) => b.counts[0] - a.counts[0]);
      const group = el("div", "stack-group");
      group.append(el("p", "group-title", g.label));
      rows.forEach((r) => {
        const row = el("div", "bar-row");
        stagger(row, index++);
        const stack = el("div", "stack");
        r.counts.forEach((count, i) => {
          if (!count) return;
          const seg = el("span", "seg seg-" + i);
          seg.style.flexGrow = count;
          seg.append(counter("seg-pct", percent(count, q.n), "%"));
          stack.append(seg);
        });
        row.append(el("span", "bar-label", r.label), stack);
        group.append(row);
      });
      chart.append(group);
      return { label: g.label, rows: rows.map((r) => [r.label, ...r.counts.map((c) => withCount(c, q.n))]) };
    });

    fig.append(chart, footnote(q), hiddenTable(["Feature", ...q.columns], tableGroups));
    return fig;
  }

  function columns(q) {
    const fig = figure(q);
    const colors = q.shading ? shadesFor(q) : null;

    // e.g. "64% picked 4 or 5", added up from the counts
    if (q.headline) {
      const picked = q.options.filter((o) => q.headline.includes(o.label));
      const count = picked.reduce((sum, o) => sum + o.count, 0);
      const headline = el("p", "headline");
      const num = el("span", "headline-num");
      num.append(counter(null, percent(count, q.n), "%"), " picked " + picked.map((o) => o.label).join(" or "));
      const sub = el("span", "headline-sub");
      sub.append(counter(null, count), " of " + number(q.n) + " people");
      headline.append(num, " ", sub);
      fig.append(headline);
    }

    const chart = el("div", "columns");
    chart.setAttribute("aria-hidden", "true");
    const plot = el("div", "col-plot");
    q.options.forEach((o, i) => {
      const col = el("div", "col");
      stagger(col, i);
      const bar = el("span", "col-bar");
      bar.style.setProperty("--f", o.count / q.n);
      if (colors) bar.style.background = rgb(colors[i]);
      col.append(valueLabel("col-value", o.count, q.n), bar, el("span", "col-label", o.label));
      plot.append(col);
    });
    const ends = el("div", "col-ends");
    ends.append(el("span", null, q.ends[0]), el("span", null, q.ends[1]));
    chart.append(plot, ends);

    const last = q.options.length - 1;
    fig.append(chart, footnote(q), hiddenTable(["Answer", "Percent (people)"], [{
      rows: q.options.map((o, i) => {
        const label = i === 0 ? o.label + " (" + q.ends[0] + ")" : i === last ? o.label + " (" + q.ends[1] + ")" : o.label;
        return [label, withCount(o.count, q.n)];
      })
    }]));
    return fig;
  }

  const draw = { bars, lollipop: bars, donut, ranked, circles, heatmap, stacked, columns };
  survey.questions.forEach((q) => {
    if (!q.options && !q.rows && !q.groups) return; // no counts yet
    (q.featured ? featuredResults : results).append(draw[q.chart](q));
  });

  const q1 = survey.questions.find((q) => q.id === "Q1");
  const firstYears = q1.options.find((o) => o.label === "First-year");
  const fills = {
    respondents: number(survey.respondents),
    "first-year-share": percent(firstYears.count, q1.n) + "%"
  };
  document.querySelectorAll("[data-fill]").forEach((node) => {
    node.textContent = fills[node.dataset.fill];
  });

  // The headline count climbs too; screen readers get the final number.
  const countNum = document.querySelector(".count-num");
  const shownCount = counter(null, survey.respondents);
  shownCount.setAttribute("aria-hidden", "true");
  countNum.append(shownCount, el("span", "sr-only", number(survey.respondents)));

  // A percent goes inside a segment only when it fits with room to spare.
  // It is measured at its final value, since it may still be counting up.
  function fitSegmentLabels() {
    document.querySelectorAll(".seg").forEach((seg) => {
      const label = seg.firstChild;
      const shown = label.textContent;
      label.textContent = format(label, Number(label.dataset.to));
      label.hidden = false;
      label.hidden = label.getBoundingClientRect().width + 16 > seg.getBoundingClientRect().width;
      label.textContent = shown;
    });
  }

  // The heatmap box takes keyboard focus only when it actually scrolls sideways.
  function updateScrollFocus() {
    document.querySelectorAll(".heatmap-scroll").forEach((box) => {
      if (box.scrollWidth > box.clientWidth) box.tabIndex = 0;
      else box.removeAttribute("tabindex");
    });
  }

  function layout() {
    fitSegmentLabels();
    updateScrollFocus();
  }

  layout();
  if (document.fonts) document.fonts.ready.then(layout);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(document.body);

  // Fast at first, then slowing into the final value. Matches --ease in style.css.
  const ease = (t) => 1 - Math.pow(1 - t, 4);

  function countUp(node) {
    const style = getComputedStyle(node);
    const wait = parseFloat(style.getPropertyValue("--delay")) || 0;
    const length = parseFloat(style.getPropertyValue("--grow"));
    const to = Number(node.dataset.to);
    let start;
    function frame(now) {
      if (start === undefined) start = now + wait;
      // Once motion is switched off (for printing), jump to the end.
      const t = root.classList.contains("motion") ? Math.min(Math.max((now - start) / length, 0), 1) : 1;
      node.textContent = format(node, Math.round(to * ease(t)));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (motion) {
    const counters = document.querySelectorAll("[data-to]");
    counters.forEach((node) => {
      node.textContent = format(node, 0);
    });

    const watcher = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        watcher.unobserve(entry.target);
        entry.target.classList.add("is-in");
        entry.target.querySelectorAll("[data-to]").forEach(countUp);
      });
    }, { rootMargin: "0px 0px -15% 0px" });
    document.querySelectorAll(".count, .chart").forEach((node) => watcher.observe(node));

    // A printed page shows every chart finished, including ones never scrolled to.
    window.addEventListener("beforeprint", () => {
      watcher.disconnect();
      root.classList.remove("motion");
      counters.forEach((node) => {
        node.textContent = format(node, Number(node.dataset.to));
      });
    });
  }
})();
