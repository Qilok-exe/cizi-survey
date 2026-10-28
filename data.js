// Survey counts. Every percent on the page is computed from these.
// pick: "one" = single answer, "many" = more than one answer allowed.
// last: true keeps a catch-all at the end when a chart is sorted by size.
// shading: which end of an ordered scale gets the darkest green.
// featured: shown in the band for the questions we wrote for this survey.
var SURVEY = {
  respondents: 143,
  questions: [
    {
      id: "Q1",
      text: "Year in school",
      chart: "bars",
      order: "asked",
      pick: "one",
      n: 143,
      options: [
        { label: "First-year", count: 89 },
        { label: "Sophomore", count: 34 },
        { label: "Junior", count: 14 },
        { label: "Senior", count: 3 },
        { label: "Grad", count: 1 },
        { label: "Not a student (recent grad)", count: 2 }
      ]
    },
    {
      // Waiting for the corrected counts (with Citizens). Left off the page until then.
      id: "Q2",
      text: "What’s your main bank?",
      chart: "bars",
      order: "size",
      pick: "one",
      n: 143,
      options: null
    },
    {
      id: "Q3",
      text: "Who picked it?",
      chart: "bars",
      order: "size",
      pick: "one",
      n: 143,
      options: [
        { label: "A parent or family member", count: 65 },
        { label: "It came with a job or school", count: 24 },
        { label: "Me", count: 34 },
        { label: "Other", count: 20, last: true }
      ]
    },
    {
      id: "Q4",
      text: "What do you use for each of these?",
      chart: "heatmap",
      pick: "many",
      n: 143,
      notes: ["People could pick more than one option per row"],
      columns: ["Main bank app", "Venmo", "Zelle", "Cash App", "Apple Pay/Cash", "Other app", "Nothing"],
      rows: [
        { label: "Getting paid", counts: [111, 12, 23, 6, 5, 7, 0] },
        { label: "Paying friends", counts: [32, 59, 34, 22, 29, 12, 3] },
        { label: "Everyday spending", counts: [64, 9, 6, 13, 49, 10, 2] },
        { label: "Saving", counts: [74, 7, 5, 16, 12, 23, 15] },
        { label: "Investing", counts: [42, 9, 2, 20, 5, 54, 22] },
        { label: "Tracking spending", counts: [34, 3, 3, 9, 2, 69, 30] }
      ]
    },
    {
      id: "Q5",
      text: "How often do you open your bank’s app?",
      chart: "donut",
      order: "asked",
      shading: "first-darkest",
      pick: "one",
      n: 143,
      options: [
        { label: "Daily", count: 26 },
        { label: "Weekly", count: 54 },
        { label: "Monthly", count: 39 },
        { label: "Rarely", count: 24 }
      ]
    },
    {
      id: "Q6",
      text: "Can your bank’s app do these?",
      chart: "stacked",
      pick: "one",
      n: 143,
      columns: ["Yes", "No", "Not sure"],
      groups: [
        {
          label: "Common features",
          rows: [
            { label: "Freeze your card", counts: [127, 6, 10] },
            { label: "Low-balance alerts", counts: [111, 23, 9] },
            { label: "Show your credit score", counts: [71, 28, 44] },
            { label: "Round up purchases into savings", counts: [77, 52, 14] },
            { label: "Switch your paycheck to it in the app", counts: [67, 59, 17] },
            { label: "Make a virtual card number", counts: [12, 101, 30] },
            { label: "Show all your subscriptions", counts: [32, 77, 34] },
            { label: "Dispute a charge", counts: [9, 37, 97] }
          ]
        },
        {
          label: "New ideas",
          rows: [
            { label: "Set up an eSIM to use abroad", counts: [2, 124, 17] },
            { label: "Track paycheck switch until it lands", counts: [21, 99, 23] },
            { label: "Find subscriptions I forgot", counts: [4, 103, 36] },
            { label: "Tell me what’s safe to spend until payday", counts: [11, 117, 15] },
            { label: "Send money when I type a name and amount", counts: [30, 94, 19] },
            { label: "Let me practice a feature first", counts: [7, 126, 10] }
          ]
        }
      ]
    },
    {
      id: "Q7",
      text: "Most annoying or missing in your money setup?",
      chart: "ranked",
      order: "size",
      pick: "one",
      n: 143,
      options: [
        { label: "No idea what I can spend until payday", count: 42 },
        { label: "Scams / fees / “gotcha” charges", count: 37 },
        { label: "Subscriptions I forgot or don’t know how to cancel", count: 29 },
        { label: "App is confusing / too many steps for basic stuff", count: 20 },
        { label: "Switching paycheck is a scary, multi-step ordeal", count: 13 },
        { label: "Other (paper statements, customer service, foreign fees)", count: 2, last: true }
      ]
    },
    {
      id: "Q8",
      text: "Has anything made you question your setup?",
      chart: "circles",
      order: "size",
      pick: "many",
      n: 143,
      notes: ["More than one answer allowed"],
      options: [
        { label: "Moving off campus", count: 49 },
        { label: "A friend’s recommendation", count: 36 },
        { label: "First paycheck", count: 34 },
        { label: "Fees", count: 27 },
        { label: "Fraud or scam scare", count: 25 },
        { label: "Bad customer service", count: 16 },
        { label: "Studying abroad", count: 7 },
        { label: "Nothing", count: 19, last: true }
      ]
    },
    {
      id: "Q9",
      text: "What would make you move your paycheck to a new bank?",
      chart: "lollipop",
      order: "size",
      pick: "many",
      maxPicks: 3,
      n: 143,
      notes: ["Up to three answers"],
      options: [
        { label: "Strong scam protection", count: 67 },
        { label: "No fees", count: 57 },
        { label: "Help managing money", count: 52 },
        { label: "Better app", count: 40 },
        { label: "Rewards", count: 36 },
        { label: "A real person to talk to", count: 24 },
        { label: "Free use abroad", count: 17 },
        { label: "Paid project or job opportunities", count: 9 }
      ]
    },
    {
      id: "Q10",
      text: "How often would you use a small in-app helper that explains features and answers money questions?",
      chart: "columns",
      order: "asked",
      shading: "last-darkest",
      featured: true,
      headline: ["4", "5"],
      pick: "one",
      n: 143,
      ends: ["Least often", "Most often"],
      options: [
        { label: "1", count: 2 },
        { label: "2", count: 11 },
        { label: "3", count: 39 },
        { label: "4", count: 57 },
        { label: "5", count: 34 }
      ]
    },
    {
      id: "Q11",
      text: "What would you let it do?",
      chart: "bars",
      order: "asked",
      featured: true,
      pick: "many",
      n: 143,
      notes: ["Ordered from least to most control", "More than one answer allowed"],
      options: [
        { label: "Answer questions", count: 109 },
        { label: "Suggest things", count: 93 },
        { label: "Do things for you, only after you allow it", count: 83 },
        { label: "Run rules I set (like “move $20 to savings every Friday”)", count: 62 }
      ]
    }
  ]
};
