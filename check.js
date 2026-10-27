// Checks the counts in data.js: prints each question's total next to its n and flags mismatches.
// Also checks that the CSV matches data.js.
//   node check.js              run the checks
//   node check.js --write-csv  rebuild cizi-survey-counts.csv from data.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const context = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "data.js"), "utf8"), context);
const survey = context.SURVEY;
const csvPath = path.join(__dirname, "cizi-survey-counts.csv");

const sum = (values) => values.reduce((a, b) => a + b, 0);
let problems = 0;

function report(label, total, n, ok, extra) {
  if (!ok) problems++;
  console.log(
    label.padEnd(48) +
    ("total " + total).padEnd(12) +
    ("n " + n).padEnd(8) +
    (extra ? extra.padEnd(22) : "".padEnd(22)) +
    (ok ? "ok" : "MISMATCH")
  );
}

// One answer each: the counts must add up to n.
// Several answers: at least one pick per person, and no more than the most picks allowed.
function checkCounts(label, counts, q, optionCount) {
  const total = sum(counts);
  if (q.pick === "one") {
    report(label, total, q.n, total === q.n);
  } else {
    const max = q.n * (q.maxPicks || optionCount);
    const ok = total >= q.n && total <= max && counts.every((c) => c <= q.n);
    report(label, total, q.n, ok, "allowed " + q.n + " to " + max);
  }
}

console.log("Respondents: " + survey.respondents + "\n");

survey.questions.forEach((q) => {
  if (q.n !== survey.respondents) {
    problems++;
    console.log(q.id + ": n is " + q.n + " but respondents is " + survey.respondents + "  MISMATCH");
  }
  if (q.options) {
    checkCounts(q.id, q.options.map((o) => o.count), q, q.options.length);
  } else if (q.rows) {
    q.rows.forEach((r) => checkCounts(q.id + " " + r.label, r.counts, q, q.columns.length));
  } else if (q.groups) {
    q.groups.forEach((g) => g.rows.forEach((r) => checkCounts(q.id + " " + r.label, r.counts, q, q.columns.length)));
  } else {
    console.log(q.id.padEnd(48) + "no counts yet, not shown on the page");
  }
});

// CSV: counts only, in the order asked.
function buildCsv() {
  const cell = (value) => {
    const text = String(value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  const lines = [["question", "question_text", "item", "answer", "count", "n"]];
  survey.questions.forEach((q) => {
    if (q.options) {
      q.options.forEach((o) => lines.push([q.id, q.text, "", o.label, o.count, q.n]));
    }
    const rows = q.rows || (q.groups ? q.groups.flatMap((g) => g.rows) : []);
    rows.forEach((r) => r.counts.forEach((c, i) => lines.push([q.id, q.text, r.label, q.columns[i], c, q.n])));
  });
  return "﻿" + lines.map((line) => line.map(cell).join(",")).join("\n") + "\n";
}

if (process.argv.includes("--write-csv")) {
  fs.writeFileSync(csvPath, buildCsv());
  console.log("\nWrote " + path.basename(csvPath));
} else {
  const current = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, "utf8").replace(/\r\n/g, "\n") : null;
  const csvOk = current === buildCsv();
  if (!csvOk) problems++;
  console.log("\nCSV matches data.js".padEnd(91) + (csvOk ? "ok" : "MISMATCH (run: node check.js --write-csv)"));
}

console.log(problems ? "\n" + problems + " problem(s) found" : "\nNo problems found");
process.exitCode = problems ? 1 : 0;
