// Survey counts. Every percent on the page is computed from these.
// pick: "one" = single answer, "many" = more than one answer allowed.
// last: true keeps a catch-all at the end when a chart is sorted by size.
// shading: which end of an ordered scale gets the darkest green.
// featured: shown in the band for the questions we wrote for this survey.
var SURVEY = {
  respondents: 285,
  questions: [
    {
      id: "Q1",
      text: "Year in school",
      chart: "bars",
      order: "asked",
      pick: "one",
      n: 285,
      options: [
        { label: "First-year", count: 177 },
        { label: "Sophomore", count: 68 },
        { label: "Junior", count: 27 },
        { label: "Senior", count: 6 },
        { label: "Grad", count: 2 },
        { label: "Not a student (recent grad)", count: 5 }
      ]
    },
    {
      // Waiting for the corrected counts (with Citizens). Left off the page until then.
      id: "Q2",
      text: "What’s your main bank?",
      chart: "bars",
      order: "size",
      pick: "one",
      n: 285,
      options: null
    },
    {
      id: "Q3",
      text: "Who picked it?",
      chart: "bars",
      order: "size",
      pick: "one",
      n: 285,
      options: [
        { label: "A parent or family member", count: 129 },
        { label: "It came with a job or school", count: 48 },
        { label: "Me", count: 68 },
        { label: "Other", count: 40, last: true }
      ]
    },
    {
      id: "Q4",
      text: "What do you use for each of these?",
      chart: "heatmap",
      pick: "many",
      n: 285,
      notes: ["People could pick more than one option per row"],
      columns: ["Main bank app", "Venmo", "Zelle", "Cash App", "Apple Pay/Cash", "Other app", "Nothing"],
      rows: [
        { label: "Getting paid", counts: [222, 23, 46, 11, 9, 14, 0] },
        { label: "Paying friends", counts: [63, 117, 68, 43, 57, 23, 6] },
        { label: "Everyday spending", counts: [128, 17, 11, 26, 97, 20, 3] },
        { label: "Saving", counts: [148, 14, 9, 31, 23, 46, 29] },
        { label: "Investing", counts: [83, 17, 3, 40, 9, 108, 43] },
        { label: "Tracking spending", counts: [68, 6, 6, 17, 3, 137, 60] }
      ]
    },
    {
      id: "Q5",
      text: "How often do you open your bank’s app?",
      chart: "donut",
      order: "asked",
      shading: "first-darkest",
      pick: "one",
      n: 285,
      options: [
        { label: "Daily", count: 51 },
        { label: "Weekly", count: 108 },
        { label: "Monthly", count: 77 },
        { label: "Rarely", count: 49 }
      ]
    },
    {
      id: "Q6",
      text: "Can your bank’s app do these?",
      chart: "stacked",
      pick: "one",
      n: 285,
      columns: ["Yes", "No", "Not sure"],
      groups: [
        {
          label: "Common features",
          rows: [
            { label: "Freeze your card", counts: [254, 11, 20] },
            { label: "Low-balance alerts", counts: [222, 46, 17] },
            { label: "Show your credit score", counts: [141, 57, 87] },
            { label: "Round up purchases into savings", counts: [154, 103, 28] },
            { label: "Switch your paycheck to it in the app", counts: [134, 117, 34] },
            { label: "Make a virtual card number", counts: [24, 201, 60] },
            { label: "Show all your subscriptions", counts: [63, 154, 68] },
            { label: "Dispute a charge", counts: [17, 74, 194] }
          ]
        },
        {
          label: "New ideas",
          rows: [
            { label: "Set up an eSIM to use abroad", counts: [3, 248, 34] },
            { label: "Track paycheck switch until it lands", counts: [43, 197, 45] },
            { label: "Find subscriptions I forgot", counts: [9, 205, 71] },
            { label: "Tell me what’s safe to spend until payday", counts: [22, 234, 29] },
            { label: "Send money when I type a name and amount", counts: [60, 188, 37] },
            { label: "Let me practice a feature first", counts: [14, 251, 20] }
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
      n: 285,
      options: [
        { label: "No idea what I can spend until payday", count: 83 },
        { label: "Scams / fees / “gotcha” charges", count: 74 },
        { label: "Subscriptions I forgot or don’t know how to cancel", count: 57 },
        { label: "App is confusing / too many steps for basic stuff", count: 40 },
        { label: "Switching paycheck is a scary, multi-step ordeal", count: 26 },
        { label: "Other (paper statements, customer service, foreign fees)", count: 5, last: true }
      ]
    },
    {
      id: "Q8",
      text: "Has anything made you question your setup?",
      chart: "circles",
      order: "size",
      pick: "many",
      n: 285,
      notes: ["More than one answer allowed"],
      options: [
        { label: "Moving off campus", count: 97 },
        { label: "A friend’s recommendation", count: 71 },
        { label: "First paycheck", count: 68 },
        { label: "Fees", count: 54 },
        { label: "Fraud or scam scare", count: 49 },
        { label: "Bad customer service", count: 31 },
        { label: "Studying abroad", count: 14 },
        { label: "Nothing", count: 37, last: true }
      ]
    },
    {
      id: "Q9",
      text: "What would make you move your paycheck to a new bank?",
      chart: "lollipop",
      order: "size",
      pick: "many",
      maxPicks: 3,
      n: 285,
      notes: ["Up to three answers"],
      options: [
        { label: "Strong scam protection", count: 134 },
        { label: "No fees", count: 114 },
        { label: "Help managing money", count: 103 },
        { label: "Better app", count: 80 },
        { label: "Rewards", count: 71 },
        { label: "A real person to talk to", count: 48 },
        { label: "Free use abroad", count: 34 },
        { label: "Paid project or job opportunities", count: 17 }
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
      n: 285,
      ends: ["Least often", "Most often"],
      options: [
        { label: "1", count: 5 },
        { label: "2", count: 21 },
        { label: "3", count: 78 },
        { label: "4", count: 114 },
        { label: "5", count: 67 }
      ]
    },
    {
      id: "Q11",
      text: "What would you let it do?",
      chart: "bars",
      order: "asked",
      featured: true,
      pick: "many",
      n: 285,
      notes: ["Ordered from least to most control", "More than one answer allowed"],
      options: [
        { label: "Answer questions", count: 217 },
        { label: "Suggest things", count: 185 },
        { label: "Do things for you, only after you allow it", count: 165 },
        { label: "Run rules I set (like “move $20 to savings every Friday”)", count: 123 }
      ]
    }
  ]
};
