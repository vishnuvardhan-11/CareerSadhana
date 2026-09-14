// ================================================================
// CareerSadhana – questions.js
// 100 Questions per Part (A–F) = 600 total
// ================================================================

const QUESTION_BANK = {

  // ── PART A: REPEAT (100 sentences) ──────────────────────────
  A: [
    { text: "Leave town on the next train." },
    { text: "The meeting has been rescheduled to Friday." },
    { text: "Please submit your report by end of day." },
    { text: "She finished her assignment before the deadline." },
    { text: "The new policy takes effect from next month." },
    { text: "All employees must attend the safety briefing." },
    { text: "Can you forward the updated file to the team?" },
    { text: "He was promoted to senior manager last year." },
    { text: "The quarterly figures exceeded our projections." },
    { text: "The client needs a proposal by Thursday morning." },
    { text: "Please return the signed contract by tomorrow." },
    { text: "Our office will be closed on the public holiday." },
    { text: "The project deadline has been moved to next week." },
    { text: "She called to confirm her appointment for Monday." },
    { text: "The new software update will be installed tonight." },
    { text: "We need to review the budget before the meeting." },
    { text: "The shipment arrived two days ahead of schedule." },
    { text: "Please bring your ID card to the interview." },
    { text: "The training session starts at nine in the morning." },
    { text: "He apologized for missing the important meeting." },
    { text: "Turn left at the traffic lights and go straight." },
    { text: "The library closes at eight o'clock on weekdays." },
    { text: "She sent the invoice to the accounting department." },
    { text: "We will conduct the annual review next quarter." },
    { text: "The manager approved the leave request yesterday." },
    { text: "Please confirm your attendance by Friday noon." },
    { text: "The conference room is booked until three o'clock." },
    { text: "He took the bus because his car was being repaired." },
    { text: "The presentation went well despite the technical issues." },
    { text: "Please keep this information strictly confidential." },
    { text: "She graduated with honors from the university." },
    { text: "The new branch will open its doors next spring." },
    { text: "We have decided to extend the application deadline." },
    { text: "The team completed the task two hours early." },
    { text: "Please update your contact details in the system." },
    { text: "The workshop will be held in conference room B." },
    { text: "He signed the agreement without reading it carefully." },
    { text: "The flight has been delayed by thirty minutes." },
    { text: "She recommended a very good restaurant downtown." },
    { text: "The staff meeting is every Tuesday at ten o'clock." },
    { text: "Please ensure all lights are off before leaving." },
    { text: "The doctor advised him to rest for a few days." },
    { text: "We are looking for an experienced project manager." },
    { text: "The parking area is located behind the building." },
    { text: "She took detailed notes during the entire lecture." },
    { text: "The annual sales conference is held in December." },
    { text: "He asked for an extension on the assignment." },
    { text: "The food at the event was absolutely delicious." },
    { text: "Please complete the online form before the interview." },
    { text: "The new employee starts work on the first of March." },
    { text: "She received a scholarship to study abroad." },
    { text: "The maintenance team fixed the elevator by noon." },
    { text: "We expect the results to be ready by next Friday." },
    { text: "Please wear the company badge at all times." },
    { text: "He transferred to the head office last September." },
    { text: "The supplier confirmed the delivery for Wednesday." },
    { text: "She drafted the proposal in less than two hours." },
    { text: "The CEO will address the staff at the annual dinner." },
    { text: "Please review the attached document and reply." },
    { text: "The bonus will be paid at the end of this month." },
    { text: "He did not receive the invitation to the event." },
    { text: "She takes the early morning train to work every day." },
    { text: "The seminar registration closes this Friday evening." },
    { text: "We are pleased to announce a new partnership." },
    { text: "The office renovation will be complete by April." },
    { text: "Please bring three copies of your resume tomorrow." },
    { text: "The fire drill is scheduled for Thursday at noon." },
    { text: "She handled the complaint with great professionalism." },
    { text: "He submitted his resignation effective from Friday." },
    { text: "The IT department will upgrade all computers this week." },
    { text: "Please save the document before closing the program." },
    { text: "The client was satisfied with our service delivery." },
    { text: "We moved the launch date to the fifteenth of May." },
    { text: "She is responsible for managing five team members." },
    { text: "The electricity will be off for two hours tomorrow." },
    { text: "He passed all three rounds of the interview process." },
    { text: "Please send the final report to all department heads." },
    { text: "The cafeteria is open from seven in the morning." },
    { text: "She completed the certification program last month." },
    { text: "The customer support team is available around the clock." },
    { text: "He will give a keynote address at the conference." },
    { text: "The sales target for this quarter has been raised." },
    { text: "Please use the stairs during a fire emergency." },
    { text: "She arranged the team building event for Saturday." },
    { text: "The contract was signed after lengthy negotiations." },
    { text: "He worked overtime to meet the important deadline." },
    { text: "Please return the borrowed equipment by tomorrow." },
    { text: "The new recruit will shadow the senior team member." },
    { text: "She mentioned the issue during the weekly briefing." },
    { text: "The budget approval is pending from the finance team." },
    { text: "He organized all the files in alphabetical order." },
    { text: "Please do not disturb during the client call." },
    { text: "The water dispenser on the second floor is repaired." },
    { text: "She asked the intern to prepare the weekly summary." },
    { text: "The board meeting has been postponed until next week." },
    { text: "He received a commendation for his outstanding work." },
    { text: "Please log out of the system before you leave today." },
    { text: "The team will celebrate their project success Friday." },
    { text: "She volunteered to lead the community outreach program." },
    { text: "The new regulations come into force from next year." },
  ],

  // ── PART B: SENTENCE BUILDS (100 items) ─────────────────────
  B: [
    { parts: ["was reading", "my mother", "her favorite magazine"], answer: "My mother was reading her favorite magazine." },
    { parts: ["goes to school", "every morning", "my younger brother"], answer: "My younger brother goes to school every morning." },
    { parts: ["the documents", "before the meeting", "please review"], answer: "Please review the documents before the meeting." },
    { parts: ["arrived late", "because of traffic", "she"], answer: "She arrived late because of traffic." },
    { parts: ["will be held", "the conference", "in the main hall"], answer: "The conference will be held in the main hall." },
    { parts: ["called the office", "to reschedule", "he"], answer: "He called the office to reschedule." },
    { parts: ["submitted her report", "on time", "the manager"], answer: "The manager submitted her report on time." },
    { parts: ["was promoted", "after five years", "he"], answer: "He was promoted after five years." },
    { parts: ["opens at nine", "the bank", "every weekday"], answer: "The bank opens at nine every weekday." },
    { parts: ["is available", "until Thursday", "the discount"], answer: "The discount is available until Thursday." },
    { parts: ["completed the task", "in two hours", "the team"], answer: "The team completed the task in two hours." },
    { parts: ["was cancelled", "due to rain", "the outdoor event"], answer: "The outdoor event was cancelled due to rain." },
    { parts: ["signed the contract", "without hesitation", "she"], answer: "She signed the contract without hesitation." },
    { parts: ["must be submitted", "the application", "by Friday"], answer: "The application must be submitted by Friday." },
    { parts: ["will be repaired", "the elevator", "by tomorrow"], answer: "The elevator will be repaired by tomorrow." },
    { parts: ["arrived early", "to prepare", "the presenter"], answer: "The presenter arrived early to prepare." },
    { parts: ["were updated", "the records", "by the clerk"], answer: "The records were updated by the clerk." },
    { parts: ["is closed", "on public holidays", "the office"], answer: "The office is closed on public holidays." },
    { parts: ["passed the exam", "with high marks", "she"], answer: "She passed the exam with high marks." },
    { parts: ["organized a meeting", "with the clients", "he"], answer: "He organized a meeting with the clients." },
    { parts: ["was impressed", "with the presentation", "the CEO"], answer: "The CEO was impressed with the presentation." },
    { parts: ["has been delayed", "the shipment", "by two days"], answer: "The shipment has been delayed by two days." },
    { parts: ["left a message", "on the answering machine", "she"], answer: "She left a message on the answering machine." },
    { parts: ["will attend", "the annual conference", "all managers"], answer: "All managers will attend the annual conference." },
    { parts: ["needs to be fixed", "the printer", "immediately"], answer: "The printer needs to be fixed immediately." },
    { parts: ["greeted the guests", "at the entrance", "the receptionist"], answer: "The receptionist greeted the guests at the entrance." },
    { parts: ["is expected", "the new policy", "next month"], answer: "The new policy is expected next month." },
    { parts: ["reviewed the budget", "carefully", "the finance team"], answer: "The finance team reviewed the budget carefully." },
    { parts: ["was selected", "for the role", "she"], answer: "She was selected for the role." },
    { parts: ["will start", "on Monday", "the new project"], answer: "The new project will start on Monday." },
    { parts: ["sent a reminder", "to all staff", "the supervisor"], answer: "The supervisor sent a reminder to all staff." },
    { parts: ["must wear", "the uniform", "all employees"], answer: "All employees must wear the uniform." },
    { parts: ["has been rescheduled", "the meeting", "to next week"], answer: "The meeting has been rescheduled to next week." },
    { parts: ["is required", "a valid ID", "for entry"], answer: "A valid ID is required for entry." },
    { parts: ["collected the feedback", "from the participants", "she"], answer: "She collected the feedback from the participants." },
    { parts: ["will be issued", "the new badges", "this week"], answer: "The new badges will be issued this week." },
    { parts: ["apologized", "for the inconvenience", "the manager"], answer: "The manager apologized for the inconvenience." },
    { parts: ["was praised", "by the director", "the team"], answer: "The team was praised by the director." },
    { parts: ["completed the training", "successfully", "all recruits"], answer: "All recruits completed the training successfully." },
    { parts: ["is available", "in the library", "the report"], answer: "The report is available in the library." },
    { parts: ["handed in", "his resignation", "he"], answer: "He handed in his resignation." },
    { parts: ["prepared the agenda", "for the board meeting", "she"], answer: "She prepared the agenda for the board meeting." },
    { parts: ["has been approved", "the budget", "by the board"], answer: "The budget has been approved by the board." },
    { parts: ["will represent", "the company", "she"], answer: "She will represent the company." },
    { parts: ["checked all the documents", "before submission", "he"], answer: "He checked all the documents before submission." },
    { parts: ["was presented", "the award", "to the best employee"], answer: "The award was presented to the best employee." },
    { parts: ["starts at eight", "the morning shift", "every day"], answer: "The morning shift starts at eight every day." },
    { parts: ["must be completed", "the form", "online"], answer: "The form must be completed online." },
    { parts: ["extended the deadline", "by one week", "the professor"], answer: "The professor extended the deadline by one week." },
    { parts: ["answered all questions", "confidently", "he"], answer: "He answered all questions confidently." },
    { parts: ["was opened", "the new branch", "last month"], answer: "The new branch was opened last month." },
    { parts: ["offered her", "a promotion", "the company"], answer: "The company offered her a promotion." },
    { parts: ["will be conducted", "the interview", "online"], answer: "The interview will be conducted online." },
    { parts: ["gave a speech", "at the graduation ceremony", "she"], answer: "She gave a speech at the graduation ceremony." },
    { parts: ["will be announced", "the results", "on Friday"], answer: "The results will be announced on Friday." },
    { parts: ["joined the company", "two years ago", "he"], answer: "He joined the company two years ago." },
    { parts: ["submitted the invoice", "to accounts", "she"], answer: "She submitted the invoice to accounts." },
    { parts: ["will be upgraded", "the software", "tonight"], answer: "The software will be upgraded tonight." },
    { parts: ["was satisfied", "the customer", "with the service"], answer: "The customer was satisfied with the service." },
    { parts: ["finished the project", "ahead of schedule", "the team"], answer: "The team finished the project ahead of schedule." },
    { parts: ["must be worn", "safety helmets", "at all times"], answer: "Safety helmets must be worn at all times." },
    { parts: ["is free", "the seminar", "for all registered users"], answer: "The seminar is free for all registered users." },
    { parts: ["mentioned the issue", "during the briefing", "she"], answer: "She mentioned the issue during the briefing." },
    { parts: ["will arrive", "the new equipment", "by Wednesday"], answer: "The new equipment will arrive by Wednesday." },
    { parts: ["collected all forms", "from the applicants", "he"], answer: "He collected all forms from the applicants." },
    { parts: ["was held", "the award ceremony", "last evening"], answer: "The award ceremony was held last evening." },
    { parts: ["is closed", "the application portal", "after midnight"], answer: "The application portal is closed after midnight." },
    { parts: ["prepared a detailed report", "for the client", "she"], answer: "She prepared a detailed report for the client." },
    { parts: ["will be notified", "all applicants", "by email"], answer: "All applicants will be notified by email." },
    { parts: ["was the top performer", "last quarter", "he"], answer: "He was the top performer last quarter." },
    { parts: ["is required", "prior approval", "for overtime"], answer: "Prior approval is required for overtime." },
    { parts: ["arrived on time", "for the interview", "she"], answer: "She arrived on time for the interview." },
    { parts: ["must be returned", "borrowed equipment", "by Monday"], answer: "Borrowed equipment must be returned by Monday." },
    { parts: ["organized the files", "in alphabetical order", "he"], answer: "He organized the files in alphabetical order." },
    { parts: ["was recognized", "for her contribution", "she"], answer: "She was recognized for her contribution." },
    { parts: ["increased significantly", "the company's revenue", "last year"], answer: "The company's revenue increased significantly last year." },
    { parts: ["will address", "the concerns", "the director"], answer: "The director will address the concerns." },
    { parts: ["asked for feedback", "after the presentation", "she"], answer: "She asked for feedback after the presentation." },
    { parts: ["has been confirmed", "the booking", "by email"], answer: "The booking has been confirmed by email." },
    { parts: ["will lead", "the new department", "he"], answer: "He will lead the new department." },
    { parts: ["was updated", "the company policy", "this year"], answer: "The company policy was updated this year." },
    { parts: ["took the morning flight", "to the capital", "she"], answer: "She took the morning flight to the capital." },
    { parts: ["must log out", "before leaving", "all staff"], answer: "All staff must log out before leaving." },
    { parts: ["coordinated the event", "from start to finish", "he"], answer: "He coordinated the event from start to finish." },
    { parts: ["was assigned", "to the new team", "she"], answer: "She was assigned to the new team." },
    { parts: ["will be relocated", "the head office", "next year"], answer: "The head office will be relocated next year." },
    { parts: ["completed the survey", "on time", "most employees"], answer: "Most employees completed the survey on time." },
    { parts: ["was promoted", "to branch manager", "he"], answer: "He was promoted to branch manager." },
    { parts: ["accepted the offer", "without hesitation", "she"], answer: "She accepted the offer without hesitation." },
    { parts: ["is available", "the parking space", "from eight"], answer: "The parking space is available from eight." },
    { parts: ["reminded the team", "about the deadline", "she"], answer: "She reminded the team about the deadline." },
    { parts: ["will take place", "the training", "next Monday"], answer: "The training will take place next Monday." },
    { parts: ["drafted the proposal", "overnight", "he"], answer: "He drafted the proposal overnight." },
    { parts: ["were replaced", "the old computers", "last week"], answer: "The old computers were replaced last week." },
    { parts: ["gave her full support", "to the project", "she"], answer: "She gave her full support to the project." },
    { parts: ["received the package", "this morning", "the office"], answer: "The office received the package this morning." },
    { parts: ["must be followed", "safety procedures", "by everyone"], answer: "Safety procedures must be followed by everyone." },
    { parts: ["graduated at the top", "of her class", "she"], answer: "She graduated at the top of her class." },
  ],

  // ── PART C: CONVERSATIONS (100 items) ───────────────────────
  C: [
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Lucy, can you come to the office early tomorrow?" },
        { speaker: "Speaker 2", line: "Sure, what time?" },
        { speaker: "Speaker 1", line: "7:30 would be great." }
      ],
      question: "What will Lucy have to do tomorrow morning?",
      answer: "Go to the office early / She will go to the office at 7:30."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you finished the monthly report?" },
        { speaker: "Speaker 2", line: "Almost. I just need to add the final figures." },
        { speaker: "Speaker 1", line: "Please send it to me before five o'clock." }
      ],
      question: "When does Speaker 1 need the report?",
      answer: "Before five o'clock."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The conference has been moved to Wednesday." },
        { speaker: "Speaker 2", line: "Oh really? I thought it was on Thursday." },
        { speaker: "Speaker 1", line: "Yes, the venue changed and so did the date." }
      ],
      question: "When is the conference now?",
      answer: "On Wednesday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you apply for the manager position?" },
        { speaker: "Speaker 2", line: "Yes, I submitted my application yesterday." },
        { speaker: "Speaker 1", line: "Great. The interview is next week." }
      ],
      question: "When is the interview?",
      answer: "Next week."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Are you taking the bus or driving today?" },
        { speaker: "Speaker 2", line: "My car is at the mechanic, so I'll take the bus." },
        { speaker: "Speaker 1", line: "I can give you a lift if you want." }
      ],
      question: "Why is Speaker 2 taking the bus?",
      answer: "Because her car is at the mechanic."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you book a table for the team lunch?" },
        { speaker: "Speaker 2", line: "How many people will be coming?" },
        { speaker: "Speaker 1", line: "About twelve, including the director." }
      ],
      question: "How many people will attend the lunch?",
      answer: "About twelve people."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you receive the email I sent this morning?" },
        { speaker: "Speaker 2", line: "No, I haven't checked my inbox yet." },
        { speaker: "Speaker 1", line: "It contains the updated project schedule." }
      ],
      question: "What does the email contain?",
      answer: "The updated project schedule."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The seminar starts at nine sharp tomorrow." },
        { speaker: "Speaker 2", line: "Should I bring anything?" },
        { speaker: "Speaker 1", line: "Just your notepad and a pen will be fine." }
      ],
      question: "What should Speaker 2 bring to the seminar?",
      answer: "A notepad and a pen."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is the photocopier working today?" },
        { speaker: "Speaker 2", line: "It's been out of order since yesterday." },
        { speaker: "Speaker 1", line: "I'll call the technician right away." }
      ],
      question: "What will Speaker 1 do about the photocopier?",
      answer: "Call the technician."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "How did your presentation go?" },
        { speaker: "Speaker 2", line: "Very well. The clients seemed really impressed." },
        { speaker: "Speaker 1", line: "That's great! Did they give any feedback?" }
      ],
      question: "How did the clients react to the presentation?",
      answer: "They were very impressed."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you met our new colleague Tom?" },
        { speaker: "Speaker 2", line: "Not yet. Which department is he in?" },
        { speaker: "Speaker 1", line: "He's joining the marketing team on Monday." }
      ],
      question: "Which department is Tom joining?",
      answer: "The marketing team."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The heating in the office isn't working." },
        { speaker: "Speaker 2", line: "I know. It's been cold all morning." },
        { speaker: "Speaker 1", line: "Maintenance said they'll fix it by noon." }
      ],
      question: "When will the heating be fixed?",
      answer: "By noon."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can we move our meeting to three o'clock?" },
        { speaker: "Speaker 2", line: "I have another appointment at three." },
        { speaker: "Speaker 1", line: "What about four o'clock then?" }
      ],
      question: "Why can't Speaker 2 meet at three?",
      answer: "She has another appointment."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did the supplier confirm the order?" },
        { speaker: "Speaker 2", line: "Yes, they confirmed delivery for Friday." },
        { speaker: "Speaker 1", line: "Make sure someone is here to receive it." }
      ],
      question: "When will the delivery arrive?",
      answer: "On Friday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Are you attending the farewell party tonight?" },
        { speaker: "Speaker 2", line: "Unfortunately I can't. I have a family commitment." },
        { speaker: "Speaker 1", line: "I'll pass on your best wishes to Sarah." }
      ],
      question: "Why can't Speaker 2 attend the party?",
      answer: "She has a family commitment."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The staff canteen is closed for renovation." },
        { speaker: "Speaker 2", line: "Oh no! For how long?" },
        { speaker: "Speaker 1", line: "About two weeks starting from tomorrow." }
      ],
      question: "How long will the canteen renovation take?",
      answer: "About two weeks."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you get approval for the budget increase?" },
        { speaker: "Speaker 2", line: "Not yet. The finance team is still reviewing it." },
        { speaker: "Speaker 1", line: "I hope they approve it before the quarter ends." }
      ],
      question: "What is the finance team doing?",
      answer: "Reviewing the budget increase request."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you help me with the new software?" },
        { speaker: "Speaker 2", line: "Sure. Have you attended the training yet?" },
        { speaker: "Speaker 1", line: "No, I missed it. I was on leave that day." }
      ],
      question: "Why did Speaker 1 miss the training?",
      answer: "She was on leave."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is Mr. Johnson available for a call?" },
        { speaker: "Speaker 2", line: "He's in a meeting until two o'clock." },
        { speaker: "Speaker 1", line: "I'll call back after two then." }
      ],
      question: "When will Speaker 1 call back?",
      answer: "After two o'clock."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I need the quarterly report by Wednesday." },
        { speaker: "Speaker 2", line: "That's very tight. Can I have until Thursday?" },
        { speaker: "Speaker 1", line: "Thursday morning at the latest." }
      ],
      question: "What is the final deadline for the report?",
      answer: "Thursday morning."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you park in the correct area today?" },
        { speaker: "Speaker 2", line: "I wasn't sure where visitors should park." },
        { speaker: "Speaker 1", line: "Visitors should use the car park on Level 2." }
      ],
      question: "Where should visitors park?",
      answer: "On Level 2."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Are you free for a quick chat this afternoon?" },
        { speaker: "Speaker 2", line: "I'm free after three o'clock." },
        { speaker: "Speaker 1", line: "Let's meet at three thirty then." }
      ],
      question: "When will they meet?",
      answer: "At three thirty."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I can't open the file you sent me." },
        { speaker: "Speaker 2", line: "It's a PDF. Do you have a PDF reader?" },
        { speaker: "Speaker 1", line: "I don't think so. I'll install one now." }
      ],
      question: "What does Speaker 1 need to do?",
      answer: "Install a PDF reader."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you placed the stationery order yet?" },
        { speaker: "Speaker 2", line: "Yes, I sent it to the supplier this morning." },
        { speaker: "Speaker 1", line: "Good. We were running low on paper." }
      ],
      question: "Why was the stationery order important?",
      answer: "They were running low on paper."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "What time does the last bus leave?" },
        { speaker: "Speaker 2", line: "It leaves at eleven fifteen from the station." },
        { speaker: "Speaker 1", line: "That's enough time if we leave by eleven." }
      ],
      question: "When does the last bus leave?",
      answer: "At eleven fifteen."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did the new intern start today?" },
        { speaker: "Speaker 2", line: "Yes, she started at nine this morning." },
        { speaker: "Speaker 1", line: "I'll show her around the office after lunch." }
      ],
      question: "What will Speaker 1 do after lunch?",
      answer: "Show the intern around the office."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The projector in room A is broken." },
        { speaker: "Speaker 2", line: "What time is your presentation?" },
        { speaker: "Speaker 1", line: "In thirty minutes. I need an alternative." }
      ],
      question: "What is the problem with the projector?",
      answer: "It is broken."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you read the memo about the new dress code?" },
        { speaker: "Speaker 2", line: "Yes, it says formal wear is required on Mondays." },
        { speaker: "Speaker 1", line: "Right, starting from next week." }
      ],
      question: "When does the new dress code start?",
      answer: "From next week."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We need volunteers for the charity event." },
        { speaker: "Speaker 2", line: "I'd be happy to help. What's involved?" },
        { speaker: "Speaker 1", line: "Just a few hours on Saturday morning." }
      ],
      question: "When is the charity event?",
      answer: "On Saturday morning."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you translate this letter into English?" },
        { speaker: "Speaker 2", line: "I can try, but it might take a couple of days." },
        { speaker: "Speaker 1", line: "That's fine. Take your time." }
      ],
      question: "How long will the translation take?",
      answer: "A couple of days."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Has the payment from the client cleared?" },
        { speaker: "Speaker 2", line: "Not yet. It usually takes three business days." },
        { speaker: "Speaker 1", line: "Let me know as soon as it comes through." }
      ],
      question: "How long does the payment usually take?",
      answer: "Three business days."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Do you want to join us for lunch?" },
        { speaker: "Speaker 2", line: "I'd love to. Where are you going?" },
        { speaker: "Speaker 1", line: "The Italian place on Fifth Street." }
      ],
      question: "Where are they going for lunch?",
      answer: "The Italian place on Fifth Street."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I need someone to cover the reception desk." },
        { speaker: "Speaker 2", line: "I can do it from two to four o'clock." },
        { speaker: "Speaker 1", line: "That would be perfect. Thank you." }
      ],
      question: "When will Speaker 2 cover the reception desk?",
      answer: "From two to four o'clock."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I'm having trouble with my password." },
        { speaker: "Speaker 2", line: "You'll need to contact the IT help desk." },
        { speaker: "Speaker 1", line: "Do you have their number?" }
      ],
      question: "What should Speaker 1 do about the password problem?",
      answer: "Contact the IT help desk."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The water cooler on floor three is empty." },
        { speaker: "Speaker 2", line: "I'll ask the office assistant to refill it." },
        { speaker: "Speaker 1", line: "Please do it before the afternoon meeting." }
      ],
      question: "What will Speaker 2 ask the office assistant to do?",
      answer: "Refill the water cooler."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you remember to book the conference room?" },
        { speaker: "Speaker 2", line: "Oh no, I forgot! Is it still available?" },
        { speaker: "Speaker 1", line: "I'll check the system and let you know." }
      ],
      question: "What did Speaker 2 forget to do?",
      answer: "Book the conference room."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is the new product ready for launch?" },
        { speaker: "Speaker 2", line: "Almost. We're just finishing the packaging." },
        { speaker: "Speaker 1", line: "We need it ready by the end of this month." }
      ],
      question: "What still needs to be done before launch?",
      answer: "The packaging needs to be finished."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "My flight to Singapore is at seven in the morning." },
        { speaker: "Speaker 2", line: "That's very early. Will you take a taxi?" },
        { speaker: "Speaker 1", line: "Yes, I've already booked one for five thirty." }
      ],
      question: "How will Speaker 1 get to the airport?",
      answer: "By taxi."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Has everyone completed the safety training?" },
        { speaker: "Speaker 2", line: "All except the new staff who joined last week." },
        { speaker: "Speaker 1", line: "Schedule them for the session on Thursday." }
      ],
      question: "Who still needs to complete the safety training?",
      answer: "The new staff who joined last week."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "What is the dress code for the gala dinner?" },
        { speaker: "Speaker 2", line: "It's black tie, so formal evening wear." },
        { speaker: "Speaker 1", line: "Good thing I have my suit ready." }
      ],
      question: "What is the dress code for the gala dinner?",
      answer: "Black tie / formal evening wear."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you proofread this document for me?" },
        { speaker: "Speaker 2", line: "Sure. When do you need it?" },
        { speaker: "Speaker 1", line: "By end of business today if possible." }
      ],
      question: "When does Speaker 1 need the document proofread?",
      answer: "By end of business today."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Our internet connection has been very slow today." },
        { speaker: "Speaker 2", line: "Several people have complained about the same thing." },
        { speaker: "Speaker 1", line: "IT says they'll fix it within the hour." }
      ],
      question: "What is the problem in the office?",
      answer: "The internet connection is very slow."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I'd like to apply for annual leave next month." },
        { speaker: "Speaker 2", line: "You'll need to fill in a leave application form." },
        { speaker: "Speaker 1", line: "Can I get it from HR or fill it in online?" }
      ],
      question: "What does Speaker 1 need to do to apply for leave?",
      answer: "Fill in a leave application form."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The results of the survey are very positive." },
        { speaker: "Speaker 2", line: "That's great. When will they be published?" },
        { speaker: "Speaker 1", line: "We're planning to release them on Monday." }
      ],
      question: "When will the survey results be published?",
      answer: "On Monday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I need a replacement for tomorrow's shift." },
        { speaker: "Speaker 2", line: "I can do it if it's the morning shift." },
        { speaker: "Speaker 1", line: "Yes, it starts at seven and finishes at two." }
      ],
      question: "What time does the morning shift start?",
      answer: "At seven o'clock."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is the report ready for the board meeting?" },
        { speaker: "Speaker 2", line: "Almost. I'm just adding the final charts." },
        { speaker: "Speaker 1", line: "Make sure it's ready by nine tomorrow." }
      ],
      question: "What time must the report be ready?",
      answer: "By nine tomorrow."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The delivery truck will arrive at noon." },
        { speaker: "Speaker 2", line: "Should I arrange for someone to receive it?" },
        { speaker: "Speaker 1", line: "Yes, please arrange two people to help unload." }
      ],
      question: "How many people need to help with the delivery?",
      answer: "Two people."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you finished setting up the new computers?" },
        { speaker: "Speaker 2", line: "Almost. Just two more to go." },
        { speaker: "Speaker 1", line: "Great. Staff need them by tomorrow morning." }
      ],
      question: "When do the staff need the computers?",
      answer: "By tomorrow morning."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "My presentation was very well received." },
        { speaker: "Speaker 2", line: "I heard. The director gave you a compliment." },
        { speaker: "Speaker 1", line: "Yes, she said it was the best this quarter." }
      ],
      question: "What did the director say about the presentation?",
      answer: "It was the best this quarter."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The company picnic is this coming Saturday." },
        { speaker: "Speaker 2", line: "Oh! I haven't confirmed my attendance yet." },
        { speaker: "Speaker 1", line: "Please reply to the email by tomorrow." }
      ],
      question: "What must Speaker 2 do by tomorrow?",
      answer: "Confirm attendance by replying to the email."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We're restructuring the customer service team." },
        { speaker: "Speaker 2", line: "How will that affect current staff?" },
        { speaker: "Speaker 1", line: "Some roles will change but no one will be let go." }
      ],
      question: "Will any staff lose their jobs in the restructuring?",
      answer: "No, no one will be let go."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you recommend a good hotel near the venue?" },
        { speaker: "Speaker 2", line: "The Grand Hotel is only five minutes away." },
        { speaker: "Speaker 1", line: "Is it expensive?" }
      ],
      question: "Where does Speaker 2 recommend staying?",
      answer: "The Grand Hotel."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I'd like to return this jacket." },
        { speaker: "Speaker 2", line: "Do you have the receipt?" },
        { speaker: "Speaker 1", line: "Yes, I bought it three days ago." }
      ],
      question: "What does Speaker 2 ask for when returning the jacket?",
      answer: "The receipt."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Has the client confirmed the meeting?" },
        { speaker: "Speaker 2", line: "Yes, they confirmed it for two o'clock Tuesday." },
        { speaker: "Speaker 1", line: "Good. I'll prepare the presentation tonight." }
      ],
      question: "When is the client meeting confirmed?",
      answer: "Two o'clock on Tuesday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I can't find the Anderson file anywhere." },
        { speaker: "Speaker 2", line: "I think Maria borrowed it last week." },
        { speaker: "Speaker 1", line: "I'll ask her to return it this afternoon." }
      ],
      question: "Who borrowed the Anderson file?",
      answer: "Maria."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The bonus announcement will be made tomorrow." },
        { speaker: "Speaker 2", line: "Really? How much will it be this year?" },
        { speaker: "Speaker 1", line: "I heard it's higher than last year." }
      ],
      question: "When will the bonus be announced?",
      answer: "Tomorrow."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Excuse me. Where is the Human Resources office?" },
        { speaker: "Speaker 2", line: "It's on the fourth floor, room four ten." },
        { speaker: "Speaker 1", line: "Thank you very much." }
      ],
      question: "Where is the Human Resources office?",
      answer: "On the fourth floor, room 410."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We need to update our emergency contact list." },
        { speaker: "Speaker 2", line: "I'll send a form to all staff this afternoon." },
        { speaker: "Speaker 1", line: "Please make sure responses are back by Friday." }
      ],
      question: "What will Speaker 2 send to staff this afternoon?",
      answer: "A form to update emergency contacts."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you met our new IT manager?" },
        { speaker: "Speaker 2", line: "Yes, briefly. She seems very experienced." },
        { speaker: "Speaker 1", line: "She starts officially on the first of April." }
      ],
      question: "When does the new IT manager officially start?",
      answer: "On the first of April."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The road to the airport is under repair." },
        { speaker: "Speaker 2", line: "How much extra time should we allow?" },
        { speaker: "Speaker 1", line: "At least thirty minutes more than usual." }
      ],
      question: "How much extra time is needed to get to the airport?",
      answer: "At least thirty minutes."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can you take the minutes at today's meeting?" },
        { speaker: "Speaker 2", line: "Of course. Should I email them to everyone?" },
        { speaker: "Speaker 1", line: "Yes, send them to all team members by Friday." }
      ],
      question: "What should Speaker 2 do with the meeting minutes?",
      answer: "Email them to all team members by Friday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is the first aid kit fully stocked?" },
        { speaker: "Speaker 2", line: "I checked last week and we're low on bandages." },
        { speaker: "Speaker 1", line: "I'll order some more today." }
      ],
      question: "What item is the first aid kit running low on?",
      answer: "Bandages."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you enjoy the team building day?" },
        { speaker: "Speaker 2", line: "Yes, it was great for getting to know everyone." },
        { speaker: "Speaker 1", line: "We should do it more often." }
      ],
      question: "What did Speaker 2 think about the team building day?",
      answer: "It was great / enjoyed it."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "When is the deadline for expense claims?" },
        { speaker: "Speaker 2", line: "All claims from this month are due by the thirtieth." },
        { speaker: "Speaker 1", line: "I'll make sure to submit mine on time." }
      ],
      question: "When must expense claims be submitted?",
      answer: "By the thirtieth."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The website is down again this morning." },
        { speaker: "Speaker 2", line: "The IT team is working on it right now." },
        { speaker: "Speaker 1", line: "Let's hope it's back up before our clients see it." }
      ],
      question: "What is the IT team doing?",
      answer: "Working on fixing the website."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Do I need to register for the workshop?" },
        { speaker: "Speaker 2", line: "Yes, registration is required in advance." },
        { speaker: "Speaker 1", line: "What's the registration deadline?" }
      ],
      question: "Is registration required for the workshop?",
      answer: "Yes, registration is required in advance."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The electricity bill for last month was very high." },
        { speaker: "Speaker 2", line: "We should remind staff to save energy." },
        { speaker: "Speaker 1", line: "I'll put up notices about switching off appliances." }
      ],
      question: "What will Speaker 1 do to reduce energy use?",
      answer: "Put up notices about switching off appliances."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We're opening a new office in the south." },
        { speaker: "Speaker 2", line: "How many staff will be based there?" },
        { speaker: "Speaker 1", line: "About twenty to start with." }
      ],
      question: "How many staff will work at the new office initially?",
      answer: "About twenty."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I've lost my access card again." },
        { speaker: "Speaker 2", line: "You'll need to report it to security." },
        { speaker: "Speaker 1", line: "Can I get a temporary card in the meantime?" }
      ],
      question: "What must Speaker 1 do about the lost access card?",
      answer: "Report it to security."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did the clients accept our revised proposal?" },
        { speaker: "Speaker 2", line: "They have a few concerns about the pricing." },
        { speaker: "Speaker 1", line: "I'll arrange a call to discuss their concerns." }
      ],
      question: "What concern do the clients have?",
      answer: "About the pricing."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Are all the interview rooms booked for tomorrow?" },
        { speaker: "Speaker 2", line: "Yes, we have twelve candidates coming in." },
        { speaker: "Speaker 1", line: "Make sure water and glasses are provided." }
      ],
      question: "How many candidates are coming for interviews?",
      answer: "Twelve candidates."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Have you backed up the files on the server?" },
        { speaker: "Speaker 2", line: "Yes, I did it yesterday evening." },
        { speaker: "Speaker 1", line: "Good. We had a crash last week and lost data." }
      ],
      question: "Why is it important to back up files?",
      answer: "Because they had a crash last week and lost data."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Could you help me carry these boxes?" },
        { speaker: "Speaker 2", line: "Of course. Where do they need to go?" },
        { speaker: "Speaker 1", line: "To the storage room on the ground floor." }
      ],
      question: "Where do the boxes need to go?",
      answer: "To the storage room on the ground floor."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Attendance at the annual dinner is mandatory." },
        { speaker: "Speaker 2", line: "What if someone has a prior commitment?" },
        { speaker: "Speaker 1", line: "They need to inform HR at least a week in advance." }
      ],
      question: "What must someone do if they cannot attend the annual dinner?",
      answer: "Inform HR at least a week in advance."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Why was the staff meeting postponed?" },
        { speaker: "Speaker 2", line: "The director had an urgent client call." },
        { speaker: "Speaker 1", line: "It's been rescheduled to Thursday at ten." }
      ],
      question: "Why was the staff meeting postponed?",
      answer: "The director had an urgent client call."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "How was your first week at the new branch?" },
        { speaker: "Speaker 2", line: "It was challenging but very exciting." },
        { speaker: "Speaker 1", line: "I'm sure you'll settle in very quickly." }
      ],
      question: "How did Speaker 2 find the first week?",
      answer: "Challenging but exciting."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Is the new marketing strategy ready?" },
        { speaker: "Speaker 2", line: "It's been approved and will launch next month." },
        { speaker: "Speaker 1", line: "Excellent. The timing is perfect." }
      ],
      question: "When will the marketing strategy launch?",
      answer: "Next month."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Can we use the auditorium for the presentation?" },
        { speaker: "Speaker 2", line: "It's already booked for the whole day tomorrow." },
        { speaker: "Speaker 1", line: "I'll check if the large boardroom is available." }
      ],
      question: "Why can't they use the auditorium?",
      answer: "It's already booked for the whole day."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The printer keeps jamming every hour." },
        { speaker: "Speaker 2", line: "That's the third time this week." },
        { speaker: "Speaker 1", line: "We should consider getting it replaced." }
      ],
      question: "What does Speaker 1 suggest doing about the printer?",
      answer: "Getting it replaced."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Did you receive a parking fine last week?" },
        { speaker: "Speaker 2", line: "Yes, I parked in a restricted zone by mistake." },
        { speaker: "Speaker 1", line: "I hope you've paid it already." }
      ],
      question: "Why did Speaker 2 receive a parking fine?",
      answer: "She parked in a restricted zone."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We need a decision on the venue by Friday." },
        { speaker: "Speaker 2", line: "Can we get quotes from at least three places?" },
        { speaker: "Speaker 1", line: "Good idea. Please arrange that today." }
      ],
      question: "What does Speaker 2 suggest before choosing a venue?",
      answer: "Getting quotes from at least three places."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Has the new staff handbook been distributed?" },
        { speaker: "Speaker 2", line: "Not yet. It's being printed right now." },
        { speaker: "Speaker 1", line: "Please hand it out before the end of the day." }
      ],
      question: "What is currently happening with the staff handbook?",
      answer: "It is being printed."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I need someone fluent in Spanish for a call." },
        { speaker: "Speaker 2", line: "Clara in accounts is a native speaker." },
        { speaker: "Speaker 1", line: "Perfect. Could you ask her for me?" }
      ],
      question: "Who speaks Spanish fluently?",
      answer: "Clara in accounts."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The lift is out of service again today." },
        { speaker: "Speaker 2", line: "Again? That's the second time this month." },
        { speaker: "Speaker 1", line: "Maintenance is working on it now." }
      ],
      question: "How many times has the lift broken down this month?",
      answer: "Twice / two times."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "We plan to hire five more engineers this year." },
        { speaker: "Speaker 2", line: "Have the positions been advertised yet?" },
        { speaker: "Speaker 1", line: "The job postings go live on Monday." }
      ],
      question: "When will the job postings go live?",
      answer: "On Monday."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "Are there any rooms available for tonight?" },
        { speaker: "Speaker 2", line: "We have one deluxe room available." },
        { speaker: "Speaker 1", line: "I'll take it. Can I check in immediately?" }
      ],
      question: "What type of room is available?",
      answer: "A deluxe room."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "The client wants changes to the logo." },
        { speaker: "Speaker 2", line: "What kind of changes does she want?" },
        { speaker: "Speaker 1", line: "She wants the font changed and a different color." }
      ],
      question: "What changes does the client want to the logo?",
      answer: "A different font and color."
    },
    {
      dialogue: [
        { speaker: "Speaker 1", line: "I've been asked to give a talk next week." },
        { speaker: "Speaker 2", line: "What will you be speaking about?" },
        { speaker: "Speaker 1", line: "About time management in the workplace." }
      ],
      question: "What will Speaker 1 talk about?",
      answer: "Time management in the workplace."
    },
  ],

  // ── PART D: SENTENCE COMPLETION (100 items) ──────────────────
  D: [
    { sentence: "It's _____ tonight. Bring your sweater.", answer: "cold" },
    { sentence: "She was too _____ to speak in front of the crowd.", answer: "nervous" },
    { sentence: "He worked very _____ and finished the task early.", answer: "hard" },
    { sentence: "Please be _____ when you enter the library.", answer: "quiet" },
    { sentence: "The exam was quite _____ and took three hours.", answer: "difficult" },
    { sentence: "She _____ the letter and put it in the envelope.", answer: "sealed" },
    { sentence: "The bus was _____ so we had to stand all the way.", answer: "crowded" },
    { sentence: "He forgot to _____ his phone before the meeting.", answer: "charge" },
    { sentence: "The instructions were not very _____ to understand.", answer: "easy" },
    { sentence: "She is very _____ about her work and always does her best.", answer: "serious" },
    { sentence: "The new employee was very _____ on his first day.", answer: "nervous" },
    { sentence: "We need to _____ the meeting to next Monday.", answer: "postpone" },
    { sentence: "The doctor told him to _____ more water every day.", answer: "drink" },
    { sentence: "She was _____ to receive the award at the ceremony.", answer: "honored" },
    { sentence: "He could not _____ where he had put his keys.", answer: "remember" },
    { sentence: "The weather was very _____ and we enjoyed the picnic.", answer: "pleasant" },
    { sentence: "She _____ the project team to complete the work on time.", answer: "encouraged" },
    { sentence: "The _____ of the new building took over two years.", answer: "construction" },
    { sentence: "He was _____ at how quickly she learned the new system.", answer: "impressed" },
    { sentence: "The meeting was _____ because the chairman was away.", answer: "cancelled" },
    { sentence: "She made a _____ decision to change her career path.", answer: "brave" },
    { sentence: "The train was running twenty minutes _____ that day.", answer: "late" },
    { sentence: "We need more _____ to complete the marketing campaign.", answer: "time" },
    { sentence: "She _____ all of her documents in a safe place.", answer: "kept" },
    { sentence: "The manager asked him to _____ his report by noon.", answer: "submit" },
    { sentence: "The hotel provided _____ service to all its guests.", answer: "excellent" },
    { sentence: "He found the job _____ and applied immediately.", answer: "interesting" },
    { sentence: "She was _____ to start her new position next week.", answer: "ready" },
    { sentence: "The client was _____ with the quality of the product.", answer: "satisfied" },
    { sentence: "He could not _____ the question asked by the reporter.", answer: "answer" },
    { sentence: "She _____ all the data into the spreadsheet carefully.", answer: "entered" },
    { sentence: "The seminar was very _____ and we learned a great deal.", answer: "informative" },
    { sentence: "He had to _____ the meeting because of an emergency.", answer: "leave" },
    { sentence: "The office was very _____ early in the morning.", answer: "quiet" },
    { sentence: "She _____ her manager for help with the complex task.", answer: "asked" },
    { sentence: "The flight was _____ due to bad weather conditions.", answer: "delayed" },
    { sentence: "He was very _____ when he received the good news.", answer: "happy" },
    { sentence: "Please _____ all the windows before you leave today.", answer: "close" },
    { sentence: "The _____ will take place in the main conference hall.", answer: "presentation" },
    { sentence: "She needed more _____ to complete the creative project.", answer: "time" },
    { sentence: "The report contained many _____ statistics and data.", answer: "useful" },
    { sentence: "He had to work _____ to meet the tight deadline.", answer: "overtime" },
    { sentence: "The company offered her a very _____ salary package.", answer: "competitive" },
    { sentence: "She _____ the call and explained the situation clearly.", answer: "answered" },
    { sentence: "The new _____ will improve communication across teams.", answer: "system" },
    { sentence: "He was always _____ to help his colleagues with tasks.", answer: "willing" },
    { sentence: "The _____ of the event exceeded everyone's expectations.", answer: "success" },
    { sentence: "She always _____ her work before submitting it.", answer: "checks" },
    { sentence: "He was given a _____ to lead the new department.", answer: "promotion" },
    { sentence: "The conference was very well _____ by all participants.", answer: "received" },
    { sentence: "She _____ early to prepare for the important meeting.", answer: "arrived" },
    { sentence: "The budget for this project is very _____ this year.", answer: "limited" },
    { sentence: "He had to _____ the terms of the contract carefully.", answer: "review" },
    { sentence: "The _____ team worked very hard throughout the project.", answer: "entire" },
    { sentence: "She was able to _____ the problem within a few minutes.", answer: "solve" },
    { sentence: "He was feeling much better _____ taking the medicine.", answer: "after" },
    { sentence: "The event was _____ in the hotel's grand ballroom.", answer: "held" },
    { sentence: "She has been _____ in the company for over ten years.", answer: "working" },
    { sentence: "He needs to _____ his skills to progress in his career.", answer: "improve" },
    { sentence: "The _____ from customers has been very positive.", answer: "feedback" },
    { sentence: "She was _____ with the results of the annual review.", answer: "pleased" },
    { sentence: "He spoke _____ to the audience despite being nervous.", answer: "confidently" },
    { sentence: "The item was out of _____ and could not be purchased.", answer: "stock" },
    { sentence: "She _____ the importance of teamwork in the meeting.", answer: "stressed" },
    { sentence: "The event was a great _____ for the entire company.", answer: "success" },
    { sentence: "He always _____ his work before sending it out.", answer: "proofreads" },
    { sentence: "The company plans to _____ into new markets next year.", answer: "expand" },
    { sentence: "She was responsible for _____ the project from start to finish.", answer: "managing" },
    { sentence: "He could not _____ the technical fault in the machine.", answer: "identify" },
    { sentence: "The shop was _____ for the entire public holiday.", answer: "closed" },
    { sentence: "She has an excellent _____ for numbers and data.", answer: "memory" },
    { sentence: "He agreed to _____ the role on a temporary basis.", answer: "take" },
    { sentence: "The staff were all very _____ and helpful to visitors.", answer: "friendly" },
    { sentence: "She needs to _____ the completed form to human resources.", answer: "submit" },
    { sentence: "The _____ for the best employee goes to her this year.", answer: "award" },
    { sentence: "He was very _____ about starting his new business.", answer: "excited" },
    { sentence: "The training was _____ by an industry expert from abroad.", answer: "conducted" },
    { sentence: "She kept the conversation _____ and professional.", answer: "brief" },
    { sentence: "He was _____ by the level of support from his team.", answer: "touched" },
    { sentence: "The project _____ were clearly outlined from the start.", answer: "goals" },
    { sentence: "She will _____ her colleagues about the new procedure.", answer: "inform" },
    { sentence: "He gave a very _____ and well-prepared talk on safety.", answer: "clear" },
    { sentence: "The _____ was located on the third floor of the building.", answer: "office" },
    { sentence: "She found the module very _____ for her daily work.", answer: "useful" },
    { sentence: "He was asked to _____ a summary of the day's events.", answer: "prepare" },
    { sentence: "The workshop participants were very _____ and engaged.", answer: "attentive" },
    { sentence: "She always meets her _____ no matter how busy she is.", answer: "deadlines" },
    { sentence: "He reviewed the _____ carefully before signing the deal.", answer: "contract" },
    { sentence: "The staff _____ was held every Monday morning at nine.", answer: "briefing" },
    { sentence: "She spoke to the _____ about her concerns regarding pay.", answer: "manager" },
    { sentence: "He decided to _____ for the post of department head.", answer: "apply" },
    { sentence: "The company's _____ grew by fifteen percent last year.", answer: "revenue" },
    { sentence: "She _____ her gratitude to all the volunteers at the event.", answer: "expressed" },
    { sentence: "He is _____ for coordinating all travel arrangements.", answer: "responsible" },
    { sentence: "The board decided to _____ the annual salary review.", answer: "conduct" },
    { sentence: "She always brings a _____ to every meeting she attends.", answer: "notepad" },
    { sentence: "He was promoted to head _____ after three successful years.", answer: "manager" },
    { sentence: "The _____ was postponed because of the CEO's illness.", answer: "meeting" },
    { sentence: "She hopes to _____ her degree within the next two years.", answer: "complete" },
  ],

  // ── PART E: DICTATION (100 sentences) ───────────────────────
  E: [
    { text: "Can you work on Monday?" },
    { text: "Please send me the report by noon." },
    { text: "The meeting starts at nine o'clock." },
    { text: "She finished the project last week." },
    { text: "He forgot to attend the morning briefing." },
    { text: "The office will be closed on Friday." },
    { text: "Please bring your ID to the reception desk." },
    { text: "The flight was delayed by two hours." },
    { text: "She applied for the position of team leader." },
    { text: "He submitted his report before the deadline." },
    { text: "The new policy will take effect from Monday." },
    { text: "Please confirm your attendance by tomorrow." },
    { text: "The conference room is on the second floor." },
    { text: "She completed the training with high marks." },
    { text: "He was promoted after three years of service." },
    { text: "The shipment arrived two days ahead of schedule." },
    { text: "Please review the attached document before signing." },
    { text: "The manager will address the team after lunch." },
    { text: "She requested a leave of absence for two weeks." },
    { text: "He organized all the files in alphabetical order." },
    { text: "The annual report is ready for the board meeting." },
    { text: "Please update your contact details in the system." },
    { text: "The client was satisfied with our presentation." },
    { text: "She transferred to the head office in September." },
    { text: "He is responsible for managing the accounts team." },
    { text: "The workshop will be held in the main conference hall." },
    { text: "She drafted the proposal and sent it to the director." },
    { text: "He received a commendation for his outstanding work." },
    { text: "The quarterly sales figures exceeded our projections." },
    { text: "Please return all borrowed items to the library." },
    { text: "The renovation is expected to be complete by April." },
    { text: "She attended all the sessions without missing one." },
    { text: "He resigned and his last working day is Friday." },
    { text: "The electricity will be off from eight to ten." },
    { text: "Please use the stairs during a fire emergency." },
    { text: "She greeted all the guests as they arrived." },
    { text: "He called the client to reschedule the appointment." },
    { text: "The bonus payment will be made at the end of the month." },
    { text: "Please keep all confidential documents in the cabinet." },
    { text: "She led the team to complete the project on time." },
    { text: "He apologized for the delay in responding to the email." },
    { text: "The staff canteen is open from seven in the morning." },
    { text: "Please do not print unnecessary documents to save paper." },
    { text: "She passed all three rounds of the selection process." },
    { text: "He took detailed notes during the entire training session." },
    { text: "The parking area for visitors is behind the building." },
    { text: "She will present her findings at tomorrow's meeting." },
    { text: "He cleaned and organized his desk at the end of the day." },
    { text: "The results of the survey will be shared on Monday." },
    { text: "Please log out of the system before leaving the office." },
    { text: "She volunteered to lead the community outreach program." },
    { text: "He was selected for the leadership development program." },
    { text: "The new branch will open in the city centre next spring." },
    { text: "Please complete the online registration form today." },
    { text: "She recommended a highly experienced consultant." },
    { text: "He will give a keynote speech at the annual conference." },
    { text: "The fire drill is scheduled for Thursday at noon." },
    { text: "Please make sure all visitors sign the register at reception." },
    { text: "She is fluent in three languages including Mandarin." },
    { text: "He was late for work because of the road construction." },
    { text: "The budget for the project has been approved by the board." },
    { text: "Please reply to the invitation before the closing date." },
    { text: "She handled the customer complaint with great professionalism." },
    { text: "He backed up all his work on the external hard drive." },
    { text: "The IT team will upgrade the servers this weekend." },
    { text: "Please wear your company badge at all times on the premises." },
    { text: "She checked all documents carefully before submission." },
    { text: "He will shadow the department head for the next two weeks." },
    { text: "The supplier confirmed delivery for Wednesday afternoon." },
    { text: "Please notify HR if you will be absent from work." },
    { text: "She accepted the offer and will start on the first of March." },
    { text: "He printed and distributed the agenda before the meeting." },
    { text: "The water cooler on the third floor was refilled today." },
    { text: "Please submit all expense claims by the thirtieth." },
    { text: "She organized a team building activity for Saturday." },
    { text: "He installed the new software on all office computers." },
    { text: "The annual staff dinner will be held at the Grand Hotel." },
    { text: "Please ensure the lights are switched off at the end of the day." },
    { text: "She was recognized for her contribution to the project." },
    { text: "He attended the seminar and returned with new ideas." },
    { text: "The patient needs to rest for at least one week." },
    { text: "Please call the reception desk if you need assistance." },
    { text: "She was offered a scholarship to study overseas." },
    { text: "He needs to submit his leave application by Friday." },
    { text: "The training program covers six different modules." },
    { text: "Please stand by for an important announcement." },
    { text: "She sent the final invoice to the accounts department." },
    { text: "He represented the company at the international trade fair." },
    { text: "The new employee will be introduced to the team today." },
    { text: "Please report any safety hazards to the supervisor." },
    { text: "She spoke clearly and confidently throughout the interview." },
    { text: "He prepared a detailed summary of the client's requirements." },
    { text: "The quarterly review will be conducted by the director." },
    { text: "Please arrive at least fifteen minutes before the interview." },
    { text: "She joined the company fresh from university last year." },
    { text: "He informed his manager about the technical problem." },
    { text: "The team celebrated after successfully completing the project." },
    { text: "Please read and sign the confidentiality agreement." },
    { text: "She helped her colleague finish the urgent report." },
  ],

  // ── PART F: PASSAGE RECONSTRUCTION (100 passages) ───────────
  F: [
    {
      passage: "Mike went for ten job interviews. At the last interview, he finally received a job offer. He was very excited and accepted the offer immediately.",
      hint: "Write about Mike's job search, interviews, and how he felt when he got the offer."
    },
    {
      passage: "Sarah started her own business after leaving her job at a large company. She faced many challenges in the beginning, but with hard work and determination, her business grew steadily over the next three years.",
      hint: "Describe why Sarah started her business, the challenges she faced, and her eventual success."
    },
    {
      passage: "The company announced a new work-from-home policy that allows employees to work remotely two days a week. The management believes this will improve staff productivity and work-life balance. Most employees reacted positively to the new arrangement.",
      hint: "Explain the new policy, why management introduced it, and how employees responded."
    },
    {
      passage: "Every year, the city holds a cultural festival that lasts for three days. Thousands of visitors come from around the country to enjoy the food, music, and performances. The festival helps to promote local businesses and tourism.",
      hint: "Describe the festival, who attends, and why it is important."
    },
    {
      passage: "James had been studying for his professional certification for over a year. He took the exam three times before finally passing. When he received his certificate, he felt that all his effort had been worthwhile.",
      hint: "Write about James' journey to get his certification and how he felt when he succeeded."
    },
    {
      passage: "The school introduced a new recycling program to reduce waste on the campus. Students and teachers were encouraged to separate their rubbish into different bins. Within one month, the amount of waste sent to the landfill was reduced by forty percent.",
      hint: "Describe the program, who participated, and the results."
    },
    {
      passage: "Anna was nervous about giving her first speech in front of a large audience. She practiced every day for two weeks before the event. When the day arrived, she delivered her speech confidently and received a standing ovation.",
      hint: "Write about Anna's preparation for her speech and how it went."
    },
    {
      passage: "The hospital recently installed a new digital record system to replace paper files. Doctors and nurses had to attend training sessions to learn how to use the new system. The hospital management expects the change to reduce errors and improve patient care.",
      hint: "Explain what system was introduced, the training involved, and the expected benefits."
    },
    {
      passage: "David decided to learn a new language after being passed over for a promotion. He took evening classes and practiced every day during his lunch break. After eighteen months, he was fluent enough to conduct meetings in that language.",
      hint: "Describe why David learned a new language, how he did it, and what he achieved."
    },
    {
      passage: "The town council voted to build a new community library in the town centre. The library will include a reading area, computer stations, and a children's section. Construction is expected to begin in the spring and take about eighteen months to complete.",
      hint: "Write about the new library, its planned features, and when it will be built."
    },
    {
      passage: "A local charity organized a fundraising marathon to support children in need. Hundreds of participants signed up and collected donations from their friends and family. The event raised enough money to provide school supplies for over five hundred children.",
      hint: "Describe the fundraising event and what was achieved."
    },
    {
      passage: "The marketing team launched a new social media campaign for the company's latest product. They created short videos and posted them daily across multiple platforms. Within two weeks, the product had received over one million views online.",
      hint: "Explain the campaign, what was done, and the results."
    },
    {
      passage: "Rachel moved to a new city for her job and did not know anyone there. She joined several community groups and attended local events to meet people. Within three months, she had made many new friends and felt at home.",
      hint: "Write about Rachel's experience moving to a new city and how she settled in."
    },
    {
      passage: "The engineering team discovered a fault in the company's main production machine. They worked through the night to repair it so that production would not be delayed. By morning, the machine was working perfectly and the team was praised for their efforts.",
      hint: "Describe the problem, how it was fixed, and the outcome."
    },
    {
      passage: "The government introduced a new program to encourage people to use public transport. Commuters were offered discounted monthly travel passes. In the first three months, bus and train usage increased by thirty percent across the city.",
      hint: "Explain the program, the incentive offered, and the results."
    },
    {
      passage: "Tom had always wanted to travel the world. After saving for five years, he finally had enough money to take a six-month trip across several continents. He visited over twenty countries and described the experience as life-changing.",
      hint: "Write about Tom's dream, how he prepared, and what he experienced."
    },
    {
      passage: "A software company developed a new app to help users manage their personal finances. The app tracks spending, sets budgets, and sends alerts when a limit is approaching. It became the most downloaded finance app within its first month of release.",
      hint: "Describe the app, its features, and how successful it was."
    },
    {
      passage: "The school principal decided to introduce a reading program for students who were struggling with literacy. Volunteer teachers stayed after school to help students read books of their choice. After six months, every student in the program had improved their reading level.",
      hint: "Explain the reading program, who was involved, and the results."
    },
    {
      passage: "Helen was diagnosed with a serious illness and had to take several months off work to recover. During her recovery, her colleagues sent her cards and meals to show their support. When she returned, she was deeply touched by their kindness.",
      hint: "Write about Helen's illness, how colleagues supported her, and her feelings on return."
    },
    {
      passage: "A new café opened near the train station and quickly became popular with commuters. It offered a wide selection of coffees and freshly made sandwiches at affordable prices. By the end of the first week, there was a queue out the door every morning.",
      hint: "Describe the café, what it offered, and how popular it became."
    },
    {
      passage: "The sports team had not won a championship in fifteen years. They hired a new coach who changed their training methods and built team spirit. In their first season under the new coach, they won the regional title.",
      hint: "Write about the team's history, the new coach, and the result."
    },
    {
      passage: "A group of scientists spent three years researching the effects of sleep on academic performance. Their study showed that students who slept at least eight hours a night scored significantly higher on tests. The findings were published in a leading scientific journal.",
      hint: "Describe the research, its findings, and where the results were published."
    },
    {
      passage: "Peter lost his wallet on the bus and assumed it was gone forever. A fellow passenger found it and tracked him down through a business card inside the wallet. Peter was extremely grateful and thanked the honest stranger publicly.",
      hint: "Write about Peter's lost wallet and how it was returned."
    },
    {
      passage: "The university launched a new online learning platform to help students access course materials from anywhere. Lecturers uploaded videos, notes, and assignments to the platform. Student satisfaction with the system increased significantly within the first semester.",
      hint: "Explain the platform, how it was used, and the outcome."
    },
    {
      passage: "A retired teacher decided to write a book about her forty years of experience in education. She spent two years writing and editing before it was finally published. The book became a bestseller among parents and teachers across the country.",
      hint: "Write about the teacher, her book, and its success."
    },
    {
      passage: "The company relocated its headquarters to a new building in the business district. The new office was designed with open spaces, breakout areas, and natural lighting to encourage collaboration. Staff reported feeling more motivated and productive in the new environment.",
      hint: "Describe the relocation, the design of the new office, and staff reaction."
    },
    {
      passage: "Maria decided to learn how to cook after realizing she was spending too much money eating out. She took a cooking class on weekends and practiced at home during the week. After three months, she could prepare a wide variety of healthy meals.",
      hint: "Write about Maria's motivation, how she learned to cook, and the outcome."
    },
    {
      passage: "The national airline expanded its routes to include ten new destinations. The expansion was in response to growing demand from tourists and business travelers. The airline expected to carry two million additional passengers in the first year.",
      hint: "Describe the expansion, the reason behind it, and the expected results."
    },
    {
      passage: "A local farmer began using solar panels to power his farm after rising electricity costs made traditional power unaffordable. The investment paid for itself within four years through reduced energy bills. He also began selling surplus electricity back to the national grid.",
      hint: "Write about the farmer's situation, his solution, and the outcome."
    },
    {
      passage: "Two colleagues disagreed strongly over how a project should be handled. They agreed to bring the matter to their manager, who helped them find a compromise. After working through their differences, they collaborated successfully for the remainder of the project.",
      hint: "Describe the conflict, how it was resolved, and the final outcome."
    },
    {
      passage: "The city council introduced a ban on single-use plastic bags in all supermarkets. Shoppers were encouraged to bring reusable bags and were charged a small fee for any plastic bags used. Within a year, plastic bag usage had dropped by eighty percent.",
      hint: "Explain the new rule, how shoppers responded, and the result."
    },
    {
      passage: "Kate applied for a job she was not fully qualified for but believed she could do. She was honest in her interview about her gaps in experience and explained how she planned to address them. She was offered the role and exceeded all expectations in her first six months.",
      hint: "Write about Kate's application, her approach in the interview, and the outcome."
    },
    {
      passage: "The bridge that connects the two towns had been under construction for three years. When it finally opened, it reduced travel time between the towns from an hour to just fifteen minutes. Residents on both sides celebrated the opening with a community event.",
      hint: "Describe the bridge project, the impact it had, and how it was celebrated."
    },
    {
      passage: "A young entrepreneur developed an app that connects farmers directly with city consumers. The app allows customers to order fresh produce online and have it delivered within twenty-four hours. The startup attracted significant investment within its first year.",
      hint: "Explain the app, how it works, and its early success."
    },
    {
      passage: "The team prepared for months for an international competition. Despite facing stronger and more experienced teams, they performed exceptionally well. Although they did not win, they returned home proud of their achievement and determined to improve further.",
      hint: "Write about the team's preparation, their performance, and their attitude after the competition."
    },
    {
      passage: "A doctor moved from the city to work in a remote village that had no medical facility. She set up a small clinic and began treating patients who had previously traveled long distances for care. Her dedication earned her an award from the national health authority.",
      hint: "Describe the doctor's move, the clinic she set up, and the recognition she received."
    },
    {
      passage: "The company's sales dropped sharply after a competitor released a similar product at a lower price. The management team held an emergency meeting and decided to improve the product's features rather than lower the price. Customer satisfaction and sales recovered within six months.",
      hint: "Explain the problem, the decision made, and the result."
    },
    {
      passage: "Lisa had never spoken publicly before but was asked to represent her department at a major industry conference. She spent weeks preparing and rehearsing her speech with colleagues. On the day, she delivered her talk without any notes and was highly praised.",
      hint: "Write about Lisa's challenge, her preparation, and how the event went."
    },
    {
      passage: "The town experienced severe flooding after three days of continuous rain. Emergency services worked around the clock to evacuate residents and distribute food and water. Recovery efforts took several weeks, but no lives were lost during the disaster.",
      hint: "Describe the flooding, the emergency response, and the recovery."
    },
    {
      passage: "A primary school started a garden project where students grew their own vegetables. Every class was responsible for looking after a section of the garden. The fresh produce was used in the school cafeteria, and students learned valuable lessons about nutrition and the environment.",
      hint: "Explain the garden project, student involvement, and the lessons learned."
    },
    {
      passage: "David was offered a very well-paid job in another country but was reluctant to leave his family. After many discussions with his wife and children, they agreed to move together. The family adapted quickly and David excelled in his new role.",
      hint: "Write about David's difficult decision, the family discussion, and the outcome."
    },
    {
      passage: "The company introduced a flexible working hours program to help staff balance their personal and professional lives. Employees could now choose to start anytime between seven and ten in the morning. Absenteeism and staff turnover dropped significantly in the months that followed.",
      hint: "Describe the program, how it worked, and its effects."
    },
    {
      passage: "An elderly man who had spent his life as a fisherman wrote a memoir about his experiences at sea. The book was initially self-published in small numbers. After a journalist wrote about it online, it went viral and sold over one hundred thousand copies.",
      hint: "Write about the fisherman's memoir and how it became successful."
    },
    {
      passage: "The research team spent two years investigating the causes of a rare disease. They identified a protein in the body that triggered the illness when levels were too high. Their findings were considered a major breakthrough in medical science.",
      hint: "Explain the research, the discovery made, and its significance."
    },
    {
      passage: "Grace started learning the piano at the age of forty-five after her children left home. She practiced for an hour every morning before going to work. Three years later, she performed at a public recital to a room full of applause.",
      hint: "Write about Grace's decision, her practice routine, and her achievement."
    },
    {
      passage: "The government launched a national campaign to reduce road accidents. Billboards, television advertisements, and school programs all promoted safe driving habits. Within the first year, the number of road fatalities dropped by twenty-two percent.",
      hint: "Describe the campaign, how it was carried out, and the results."
    },
    {
      passage: "After being made redundant, Ken used the opportunity to start a small printing business from home. He spent the first six months building a client base through word of mouth. Within two years, he had enough work to rent a proper workshop and hire two assistants.",
      hint: "Write about Ken's situation, what he did, and how his business grew."
    },
    {
      passage: "The technology company partnered with a local university to fund research into artificial intelligence. Students and academics worked alongside industry engineers on practical projects. The partnership produced several patents and three startup companies in its first three years.",
      hint: "Explain the partnership, what was achieved, and the outcomes."
    },
    {
      passage: "A grandmother who had never used a computer before enrolled in a digital literacy class at her local library. She learned to send emails, video call her grandchildren, and shop online. She said the course had completely changed the way she communicated with her family.",
      hint: "Describe the grandmother's experience learning to use a computer and how it helped her."
    },
    {
      passage: "The restaurant received a poor review online that affected its business for several months. The owner took the criticism seriously and made changes to the menu and service. Within a year, the restaurant had regained its reputation and was fully booked every weekend.",
      hint: "Write about the bad review, how the owner responded, and the recovery."
    },
    {
      passage: "A group of volunteers spent three weekends cleaning up a polluted river near their town. They removed tonnes of rubbish and planted native plants along the riverbanks. Local wildlife began to return to the area within a few months of the cleanup.",
      hint: "Describe the cleanup effort and its impact on the environment."
    },
    {
      passage: "John had wanted to run a marathon since his twenties but never found the time. After retiring, he began training seriously and entered his first marathon at the age of sixty-two. He completed the race and raised money for a children's charity.",
      hint: "Write about John's long-held dream, his training, and what he achieved."
    },
    {
      passage: "The airline faced severe criticism after flights were cancelled due to a system failure. Passengers were stranded for up to eighteen hours at the airport. The airline apologized and offered full refunds and travel vouchers to all affected customers.",
      hint: "Explain the problem, the impact on passengers, and how the airline responded."
    },
    {
      passage: "A small bakery began selling its products online after the owner noticed that many customers lived far away. Orders arrived from across the country within the first week. The business expanded its production to meet the unexpected demand.",
      hint: "Describe how the bakery went online and the result."
    },
    {
      passage: "The national park authority introduced a strict limit on the number of visitors per day to protect the environment. Online booking became mandatory for all visitors. The park's ecosystem began to recover, and wildlife numbers increased noticeably.",
      hint: "Write about the new visitor limit, how it was managed, and the environmental outcome."
    },
    {
      passage: "A team of architects designed an innovative low-cost housing project using recycled materials. Each home could be built in under two weeks at a fraction of traditional costs. The project won an international design award and attracted interest from governments worldwide.",
      hint: "Describe the housing project, how it was built, and its recognition."
    },
    {
      passage: "Nina was shy as a child and avoided speaking in groups. She joined a drama club at school and gradually became more comfortable expressing herself. By the time she left school, she was performing in plays and leading class discussions with confidence.",
      hint: "Write about Nina's shyness, how she overcame it, and her progress."
    },
    {
      passage: "The company held its annual staff survey and found that many employees felt undervalued. The HR team responded by introducing a monthly recognition program to celebrate outstanding contributions. Employee morale improved noticeably over the following quarter.",
      hint: "Explain the survey findings, the response, and the result."
    },
    {
      passage: "A marine biologist discovered a new species of fish in deep ocean waters off the coast. She documented her findings and submitted them to a scientific journal for review. The discovery added to the growing list of species identified in the region.",
      hint: "Describe the discovery, the documentation process, and its significance."
    },
    {
      passage: "The city decided to convert an abandoned industrial site into a public park. The project took eighteen months to complete and involved landscaping, walking paths, and a children's playground. It quickly became one of the most visited outdoor spaces in the area.",
      hint: "Write about the transformation of the industrial site into a park and its reception."
    },
    {
      passage: "Henry struggled to manage his time and often missed deadlines at work. He attended a time management workshop and began using a daily planner. Within two months, he was consistently meeting his targets and felt much less stressed.",
      hint: "Describe Henry's problem, what he did about it, and the outcome."
    },
    {
      passage: "A company launched an internship program to give university students hands-on industry experience. Over twenty students joined the program in its first year. Several of them were later offered permanent positions after graduating.",
      hint: "Explain the internship program, who joined, and the outcome for participants."
    },
    {
      passage: "The community raised funds to restore an old building that had historical significance. Volunteers and local businesses donated their time and resources to the project. The restored building now serves as a museum and community centre.",
      hint: "Write about the restoration project and how the community was involved."
    },
    {
      passage: "A retired soldier began writing poetry to cope with his experience after leaving the military. His poems were initially shared with close friends. When they were published as a collection, they resonated deeply with readers around the world.",
      hint: "Describe why the soldier wrote poetry and how his work was eventually received."
    },
    {
      passage: "The school sports team had lost every match for two seasons. A new sports teacher introduced new training routines and a positive team culture. By the end of the year, the team had won five consecutive matches and reached the regional finals.",
      hint: "Write about the team's poor record, the changes made, and the improvement."
    },
    {
      passage: "The health authority launched a campaign urging people over fifty to attend regular health screenings. Free appointments were made available at local clinics. Thousands took part, and several serious conditions were detected early as a result.",
      hint: "Describe the screening campaign, how it was made accessible, and its impact."
    },
    {
      passage: "Alice had been in the same job for twelve years and felt her career had stalled. She enrolled in a part-time postgraduate program while continuing to work. After completing the qualification, she was promoted to a senior management role.",
      hint: "Write about Alice's situation, what she did to change it, and the result."
    },
    {
      passage: "The neighborhood association organized a street fair to bring residents together. Stalls offered local food, crafts, and entertainment for all ages. The event was such a success that it became an annual tradition.",
      hint: "Describe the street fair and its impact on the community."
    },
    {
      passage: "The company's customer satisfaction scores had been declining for two years. Management hired a specialist consultancy to identify the causes and suggest solutions. After implementing the recommendations, satisfaction levels rose to their highest ever in twelve months.",
      hint: "Explain the problem, the approach taken, and the outcome."
    },
    {
      passage: "A young girl from a remote village won a national science competition with her project on water purification. She had no access to a laboratory and conducted her experiments using basic household materials. Her win earned her a university scholarship.",
      hint: "Write about the girl's achievement, her limited resources, and the reward."
    },
    {
      passage: "The mountain rescue team was called out on forty occasions last winter to help stranded hikers. Many of the incidents involved people who were not properly equipped for the cold weather. The team urged all walkers to check the forecast and pack emergency supplies.",
      hint: "Describe the rescue team's work and the advice they gave hikers."
    },
    {
      passage: "The company director was a firm believer in giving back to society. Each year, the company donated ten percent of its profits to local charities. Staff were also encouraged to volunteer during work hours, and many did so regularly.",
      hint: "Write about the director's approach to corporate responsibility and what the company did."
    },
    {
      passage: "Oliver had always been passionate about protecting the environment. After university, he joined an organization working to protect endangered rainforests. He spent three years living in remote areas and working directly with local communities.",
      hint: "Describe Oliver's passion, his work, and how he lived it out."
    },
    {
      passage: "A restaurant owner noticed that large amounts of food were being wasted every day. She partnered with a local charity to donate unsold food at the end of each evening. The initiative reduced food waste by seventy percent and fed hundreds of people each week.",
      hint: "Write about the problem the owner identified and the solution she found."
    },
    {
      passage: "The marathon runner collapsed during a race due to extreme heat. Fellow competitors stopped to help her until medical staff arrived. She recovered fully and was deeply moved by the kindness shown by strangers.",
      hint: "Describe what happened during the race and how others responded."
    },
    {
      passage: "A primary school teacher noticed that many students were arriving at school without having eaten breakfast. She organized a breakfast club that opened thirty minutes before school started. Student concentration and academic performance improved noticeably within a term.",
      hint: "Explain the problem the teacher observed, what she did, and the results."
    },
    {
      passage: "The two companies had been rivals for years before deciding to merge. The merger brought together their expertise and client bases. Within a year of the merger, the combined company had become the market leader in its sector.",
      hint: "Write about the rivalry, the merger, and the outcome."
    },
    {
      passage: "A former professional athlete set up a foundation to provide sports coaching to underprivileged youth. He funded the program through sponsorships and fundraising events. Over five years, more than two thousand young people benefited from the program.",
      hint: "Describe the foundation, how it was funded, and its impact."
    },
    {
      passage: "The company's internal communications were slow and inefficient, relying mainly on emails and paper memos. A new messaging platform was introduced that allowed instant communication across all departments. Productivity improved and internal response times dropped dramatically.",
      hint: "Explain the problem, the solution, and the improvement."
    },
    {
      passage: "Lucy worked as a nurse for twenty years before deciding to study medicine. Balancing study, work, and family was extremely demanding. When she graduated as a doctor, her patients and colleagues celebrated her extraordinary dedication.",
      hint: "Write about Lucy's career change, the challenges she faced, and her achievement."
    },
    {
      passage: "The coastal town was struggling economically after the local fishing industry declined. A group of residents formed a cooperative to promote tourism and local crafts. Within three years, visitor numbers had tripled and new businesses had opened throughout the town.",
      hint: "Describe the town's challenge, the response, and the economic recovery."
    },
    {
      passage: "A teenager invented a device that could detect water leaks in pipes before they caused damage. She developed the idea for a school science project and tested it in her own home. After winning several awards, a manufacturing company offered to produce the device commercially.",
      hint: "Write about the invention, how it was developed, and what followed."
    },
    {
      passage: "The new CEO took over a company that was losing money and facing bankruptcy. She restructured the business, cut unnecessary costs, and focused on core products. Within two years, the company returned to profit and began expanding again.",
      hint: "Describe the situation the CEO inherited, what she did, and the results."
    },
    {
      passage: "A documentary filmmaker spent five years traveling to document the lives of traditional craftspeople. She filmed potters, weavers, and woodcarvers whose skills had been passed down for generations. The resulting documentary was nominated for a major international award.",
      hint: "Write about the filmmaker's project, what she documented, and the recognition it received."
    },
    {
      passage: "The city launched a bicycle-sharing scheme to reduce traffic congestion in the centre. Hundreds of bikes were made available at docking stations across the city. The scheme proved very popular, especially with young commuters, and was extended to nearby suburbs within a year.",
      hint: "Describe the scheme, who used it, and how it was expanded."
    },
    {
      passage: "A librarian noticed that reading rates among children in her community had dropped sharply. She started a monthly book club where children could discuss their favorite stories. Membership grew quickly and the club attracted national media attention within its first year.",
      hint: "Write about the problem, the librarian's response, and the outcome."
    },
    {
      passage: "The manufacturer recalled a batch of products after receiving reports of a safety fault. Customers were contacted directly and offered a full refund or replacement. The company acted swiftly and transparency helped to maintain customer trust.",
      hint: "Describe the recall, how customers were treated, and the impact on trust."
    },
    {
      passage: "A fire broke out in an apartment building late at night. Residents were evacuated quickly thanks to working fire alarms and well-practiced drills. All fifty residents escaped safely and the firefighters contained the blaze within an hour.",
      hint: "Write about the fire, the evacuation, and the response."
    },
    {
      passage: "The village had no access to clean drinking water and residents relied on a polluted river. A non-governmental organization built a water treatment facility funded by international donations. Clean water was available to all two thousand residents within six months.",
      hint: "Describe the problem, the solution, and the outcome for the community."
    },
    {
      passage: "An engineer designed a low-cost prosthetic arm for people who could not afford standard prosthetics. He used a 3D printer to make the parts and assembled them by hand. He has since provided over three hundred people in developing countries with the device.",
      hint: "Write about the engineer's design, how it was made, and its impact."
    },
    {
      passage: "The sports center introduced free gym sessions for senior citizens every Tuesday morning. The program was designed to improve physical health and reduce isolation among older residents. Attendance grew steadily and participants reported feeling healthier and more socially connected.",
      hint: "Describe the program, who it was for, and the benefits."
    },
    {
      passage: "A team of volunteers spent a month teaching English to refugees in a temporary settlement. Classes were held in a donated tent with limited resources. By the end of the program, most participants could hold basic conversations in English.",
      hint: "Write about the teaching program, the conditions, and what was achieved."
    },
    {
      passage: "The startup company developed software that automates repetitive administrative tasks. Businesses using the software reported saving up to ten hours of staff time per week. Demand for the product grew rapidly and the company tripled its staff within eighteen months.",
      hint: "Describe the software, its benefits, and the company's growth."
    },
    {
      passage: "A father and son who had not spoken for ten years were reunited after both signed up for the same charity walk. They spent eight hours walking together and used the time to talk through their differences. Their reconciliation was described as unexpected and deeply moving.",
      hint: "Write about the estrangement, the unexpected reunion, and the outcome."
    },
    {
      passage: "The school principal discovered that bullying was a serious problem after an anonymous survey. She introduced a peer support program where older students mentored younger ones. Reported incidents of bullying decreased by sixty percent within one school year.",
      hint: "Describe the problem, the solution introduced, and the results."
    },
    {
      passage: "A group of scientists launched a satellite to study the effects of climate change on polar ice. The satellite collected data continuously over a two-year period. The findings were shared with governments worldwide to help inform environmental policy.",
      hint: "Write about the satellite mission, what it studied, and how the results were used."
    },
  ]
};

// Shuffle and select N questions from a part
function getRandomQuestions(part, count) {
  const bank = [...QUESTION_BANK[part]];
  // Fisher-Yates shuffle
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, Math.min(count, bank.length));
}
