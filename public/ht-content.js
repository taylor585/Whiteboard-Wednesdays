/* AI Isn’t the Bottleneck. You Are. (id: how-to-think).
   Built 22 October 2026 from the 18 designs Taylor approved in the Whiteboard Wednesdays - Variety Pack (round 1),
   locked to slides with the pack's rotation rules. Pecuna Factorem brand, confirmed by Taylor on 21 October 2026.
   Source: Taylor's video idea of 20 October 2026 (how to think in frameworks so AI can do almost anything).
   Updated 22 October 2026: two opening prompts (ask what a good question is; let AI ask itself the questions), from Taylor's idea that day.
   The salon brief, the chats and the two answers are illustrative, written for this deck. Word counts are measured from the brief. */
(()=>{
const tick='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5 11-12"/></svg>';
const Q=[['Q1','What does done look like?','a goal it can aim at'],['Q2','Should we plan first?','let it ask before it builds'],['Q3','Who’s the best at this?','learn from the top'],['Q4','How will I know it’s good?','write the checks first'],['Q5','What doesn’t it know?','tell it the edges']];
const BRIEF=[['Done','By 31 January I want to run my own Meta ads for my salon at £10 a day, without hiring an agency.'],['Plan','Before you answer, ask me what you need to know about my level, time and budget. Then show me a plan and wait for my OK.'],['Best','Find the five most respected people teaching Meta ads right now. What do they agree on, and what do beginners get wrong?'],['Good','A good plan fits three hours a week, costs under £50, only uses links that work and ends with one live campaign.'],['Edges','Only use official Meta guides, courses and YouTube from 2025 or later. Give it to me as a table: week, topic, resource, link, time.']];
const tabs=on=>'<ol class="ht-tabs" aria-label="Chapters">'+['01 The problem','02 The framework','03 Put together','04 It works for anything'].map((t,i)=>'<li'+(i===on?' class="on" aria-current="step"':'')+'>'+t+'</li>').join('')+'</ol>';
window.WW={
 slides:[
  {
   id:'what-do-i-say',
   title:'What do I say?',
   section:'00 / Cold open',
   kind:'ht-blank ht-e-zoom',
   parts:['<p class="ht-blank-line">The question behind almost every stuck AI user.</p>'],
   reveals:[1],
   source:'Taylor’s video brief, 20 October 2026. The group post is described out loud and is not shown.',
   note:'Hook, about 40 seconds. Let the question write itself on, then tell the story in your own words: someone in the group said they were struggling to find learning and education and did not know where to go. You said: ask AI. They replied: “What do I say?” SAY: “That reply is the whole video. They had the tool. What they did not have was a way to think about the problem.” Do not name the person or show the post.'
  },
  {
   id:'bottleneck',
   title:'AI isn’t the bottleneck. You are.',
   section:'01 / The problem',
   kind:'ht-cursor ht-ch-ink ht-e-draw',
   parts:[
    '<div class="ht-cursor-wrap"><div class="ht-ready">The tool is ready.</div><div class="ht-chatbox" aria-label="An empty AI chat box: someone types where can I learn, then deletes it"><span class="ht-typed" style="--c:17">where can I learn</span><i class="ht-caret" aria-hidden="true"></i></div><div class="ht-isnt">The thinking isn’t.</div></div>',
    '<p class="ht-claim">It can research, plan, write and check its own work. <span class="ht-sweep">The bottleneck is knowing what to ask.</span></p>'
   ],
   reveals:[1,2],
   source:'Illustrative chat box. The claim is Taylor’s argument for this video.',
   note:'About 45 seconds. Watch the cursor: someone starts typing, stops, and deletes it. SAY: “The tool is ready. The thinking isn’t.” Second click: “AI can research, plan, write and check its own work. The bottleneck is knowing what to ask. And that is a skill you can learn in five questions.”'
  },
  {
   id:'good-question',
   title:'Ask what a good question is',
   section:'01 / Questions first · prompt 1',
   kind:'ht-phone ht-e-draw',
   parts:[
    '<div class="ht-handset"><div class="ht-bb ht-me" style="--d:300ms"><b>You</b>What makes a really good question? Research how the best thinkers, coaches and researchers ask hard questions, the kind that make us think in ways we otherwise wouldn’t. Then give me a short checklist I can use before I ask you anything.</div><div class="ht-bb" style="--d:1300ms"><b>AI</b>I’ll look at how great teachers, coaches and researchers ask questions, pull out what the hardest and most useful ones have in common, and give you a short checklist. Shall I start?</div></div>',
    '<div class="ht-side"><div class="micro">Prompt 1 · illustrative chat</div><p class="ht-say">Before you ask AI anything, ask it how to ask.</p><p>You don’t need to know what a good question looks like. <b>Get AI to research it for you first.</b> The quality of the question sets the quality of the thinking.</p></div>'
   ],
   reveals:[1,2],
   source:'Prompt written for this deck from Taylor’s idea of 22 October 2026. The AI reply is illustrative; it was not run for this deck.',
   note:'About 60 seconds. This is the very first move, before any real task. SAY: “If you don’t know what to ask, start one step back. Ask AI what makes a really good question, and get it to research how the best people ask hard questions, the ones that make you think in ways you otherwise wouldn’t.” Read the prompt off the phone. Second click: “The quality of the question sets the quality of the thinking. So level up the question first.”'
  },
  {
   id:'ask-itself',
   title:'Let AI ask itself the questions',
   section:'01 / Questions first · prompt 2',
   kind:'ht-split ht-e-draw',
   parts:[
    '<div class="ht-half ht-b"><div class="micro">Prompt 2 · your end goal</div><p class="ht-prompt">“Here’s my end goal: <b>run my own Meta ads for my salon by 31 January.</b> What questions could you ask yourself that would dramatically improve your answer? Ask yourself really good questions, then show me what they’d look like for this goal.”</p></div>',
    '<div class="ht-half ht-a"><div class="micro">Questions it might ask itself · illustrative</div><ol class="ht-qlist"><li><b>Q1</b>What does success look like, and by when?</li><li><b>Q2</b>What should I ask before I plan?</li><li><b>Q3</b>Whose methods are worth learning from?</li><li><b>Q4</b>How will we know the plan is good?</li><li><b>Q5</b>What don’t I know about this salon?</li></ol><p class="ht-res">Sound familiar? These are the five questions.</p></div>'
   ],
   reveals:[1,2],
   source:'Prompt written for this deck from Taylor’s idea of 22 October 2026. The list is illustrative: the kind of questions this prompt invites, grouped under the five questions. It was not run for this deck.',
   note:'About 75 seconds. SAY: “Then give it your end goal and ask: what questions could you ask yourself that would dramatically improve your answer?” Read the prompt. Second click: “Look at what comes back. What does done look like. What to ask before planning. Who to learn from. How to judge it. What it doesn’t know. That is all thinking in frameworks is. For the rest of this video I’ll show you those five questions one at a time, so you can ask them yourself.”'
  },
  {
   id:'usual-prompt',
   title:'The prompt most people type',
   section:'01 / The problem',
   kind:'ht-torn ht-e-draw',
   parts:[
    '<div class="ht-strip"><span class="ht-tape a" aria-hidden="true"></span><span class="ht-tape b" aria-hidden="true"></span><div class="ht-paper">“Where can I learn paid ads?”</div></div>',
    '<div class="ht-under"><div class="micro">6 words · illustrative</div><p>No goal. No budget. No deadline. Nothing about who is asking. <b>So AI gives the average answer to the average person.</b></p></div>'
   ],
   reveals:[1,2],
   source:'Illustrative prompt, written for this deck. It is the running example: it grows into a full brief on slide 13.',
   note:'About 40 seconds. This is the running example for the whole video. SAY: “Most people skip all of that. Here is what they type instead. Six words. And it is not a bad question. It is just missing everything that makes it yours.” Second click: read the missing pieces one at a time.'
  },
  {
   id:'step-one',
   title:'Most people stop at step one',
   section:'01 / The problem',
   kind:'ht-circle ht-e-draw',
   parts:[
    '<div class="ht-circled"><div class="ht-six">6<svg class="ht-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M30 8C8 12 2 50 8 72s40 26 70 20 22-50 8-70S50 0 22 14" vector-effect="non-scaling-stroke"/></svg></div><svg class="ht-arrow" viewBox="0 0 130 80" aria-hidden="true"><path d="M120 20C90 10 50 20 10 60M10 60l4-18M10 60l18-2"/></svg><div class="ht-call">words. Most people give AI nothing else to go on.</div></div>',
    '<p class="ht-claim">They type a question and stop. <span class="ht-sweep">The real work happens before you type</span>, and it takes five questions.</p>'
   ],
   reveals:[1,2],
   source:'Counted from the illustrative prompt on slide 5.',
   note:'About 30 seconds. The circle goes round the 6. SAY: “That is the whole brief most people give AI. Six words. Then they blame the tool.” Second click: “The real work happens before you type. And it is five questions. Here they are.”'
  },
  {
   id:'five-questions',
   title:'Five questions before you ask',
   section:'02 / The framework',
   kind:'ht-sticky ht-ch-tab ht-e-zoom',
   parts:[tabs(1)].concat(Q.map((q,i)=>'<div class="ht-note" style="--r:'+[-3,2,-2,3,-1][i]+'deg"><span class="ht-pin" aria-hidden="true"></span><b>'+q[1]+'</b><small>'+q[0]+' · '+q[2]+'</small></div>')),
   reveals:[0,1,2,3,4,5],
   source:'Taylor’s framework, from the video brief of 20 October 2026.',
   note:'About 60 seconds, one note per click. SAY each one in a sentence: 1) What does done look like? 2) Should we plan first? 3) Who is the best at this? 4) How will I know it is good? 5) What does it not know? “These are the questions AI handed back two slides ago, in the order I use them. You do not need to know the answer to any of them. You just need to ask them. Let’s take them one at a time, on the paid ads question.”'
  },
  {
   id:'q1-done',
   title:'What does done look like?',
   section:'02 / The framework · Q1',
   kind:'ht-rewrite ht-e-zoom',
   parts:[
    '<p class="ht-line">I want to <span class="ht-x">learn paid ads<span class="ht-fix">run my salon’s ads by 31 January</span></span>.</p>',
    '<div class="ht-brief-line"><span class="micro">Brief, line 1</span><p>'+BRIEF[0][1]+'</p><small>A goal AI can aim at: what, for whom, by when, for how much.</small></div>'
   ],
   reveals:[1,2],
   source:'Illustrative brief, written for this deck.',
   note:'About 60 seconds. The vague words get struck out and the real goal is written over them. SAY: “Learn paid ads is not a goal. AI cannot tell when it is finished. Run my own salon’s ads by the end of January, at ten pounds a day, without an agency: now it knows what done looks like.” Second click: that becomes line 1 of the brief.'
  },
  {
   id:'q2-plan',
   title:'Should we plan first?',
   section:'02 / The framework · Q2',
   kind:'ht-signal ht-e-zoom',
   parts:[
    '<div class="ht-lane"><div class="ht-wire" aria-hidden="true"></div><ol class="ht-stations"><li style="--d:600ms"><b>You ask</b>the goal</li><li style="--d:1300ms"><b>AI asks back</b>what it needs</li><li style="--d:2000ms"><b>The plan</b>on one page</li><li style="--d:2700ms"><b>You approve</b>or change it</li><li class="ht-end"><b>It builds</b>only then</li></ol><div class="ht-dot" aria-hidden="true"></div></div>',
    '<div class="ht-brief-line"><span class="micro">Brief, line 2</span><p>'+BRIEF[1][1]+'</p><small>Plan mode: nothing gets built until you agree the plan.</small></div>'
   ],
   reveals:[1,2],
   source:'Illustrative brief, written for this deck. Plan mode is a feature in tools such as Claude Code; in any chat you can ask for the same thing in words.',
   note:'About 60 seconds. Let the gold dot travel: you ask, AI asks back, a plan, you approve, and only then does it build. SAY: “The fastest way to get a bad answer is to let AI start straight away. Make it ask you questions first, then show you a plan, and wait for your OK.” In Claude Code that is plan mode; in any chat, just say it, as line 2 of the brief does.'
  },
  {
   id:'q3-best',
   title:'Who’s the best at this?',
   section:'02 / The framework · Q3',
   kind:'ht-phone ht-e-zoom',
   parts:[
    '<div class="ht-handset"><div class="ht-bb ht-me" style="--d:300ms"><b>You</b>'+BRIEF[2][1]+'</div><div class="ht-bb" style="--d:1200ms"><b>AI</b>I’ll find the five most followed and best reviewed teachers, list what all five teach, then the mistakes each one warns about. Shall I start?</div></div>',
    '<div class="ht-side"><div class="micro">Illustrative chat</div><p class="ht-say">Borrow the best brains first.</p><p>Ask who is best in the space, what they all agree on, and what beginners get wrong. <b>Then AI works from the top of the field, not the average of the internet.</b></p></div>'
   ],
   reveals:[1,2],
   source:'Illustrative chat, written for this deck. No teachers are named or claimed.',
   note:'About 60 seconds. SAY: “AI has read everyone. The good and the bad. If you don’t point it at the best, you get the average.” Read the request, then the reply: it says how it will research before it does. That is line 3 of the brief.'
  },
  {
   id:'q4-good',
   title:'How will I know it’s good?',
   section:'02 / The framework · Q4',
   kind:'ht-sticky ht-criteria ht-e-zoom',
   parts:[
    '<p class="ht-lead">AI does sloppy work when nobody says what good looks like. <span class="ht-sweep">Write the checks before it starts.</span></p>',
    ['Fits three hours a week','Costs under £50','Every link works','Ends with one live campaign'].map((t,i)=>'<div class="ht-note" style="--r:'+[-2,3,-3,2][i]+'deg;--d:'+(i*300)+'ms"><span class="ht-pin" aria-hidden="true"></span><b>'+t+'</b></div>').join(''),
    '<div class="ht-brief-line"><span class="micro">Brief, line 4</span><p>'+BRIEF[3][1]+'</p><small>If it fails a check, it goes back. Not your mood: the list.</small></div>'
   ],
   reveals:[1,2,3],
   source:'Illustrative acceptance criteria, written for this deck.',
   note:'About 60 seconds. SAY: “I know AI sometimes does sloppy work. So before it starts, I tell it how I will judge it.” Second click: the four checks slap onto the board. Third: “Those become acceptance criteria. If the plan fails one, it goes back. Same idea as the done gate in the AI harnesses video.”'
  },
  {
   id:'q5-edges',
   title:'What doesn’t it know?',
   section:'02 / The framework · Q5',
   kind:'ht-venn ht-e-zoom',
   parts:[
    '<div class="ht-v"><div class="ht-c ht-l"><b>What you know</b>your goal<br>your budget<br>your customers<br>what good looks like</div><div class="ht-c ht-r"><b>What AI knows</b>everything public<br>every course<br>every channel<br>nothing about you</div><div class="ht-ov">The brief</div></div>',
    '<div class="ht-brief-line"><span class="micro">Brief, line 5</span><p>'+BRIEF[4][1]+'</p><small>AI doesn’t know what it doesn’t know. Tell it what’s allowed in and what shape you want back.</small></div>'
   ],
   reveals:[1,2],
   source:'Illustrative brief, written for this deck.',
   note:'About 60 seconds. The two circles slide together and the overlap is the brief. SAY: “AI knows everything public and nothing about you. It doesn’t know what it doesn’t know. So you set the edges: which sources are allowed in, how recent, and what shape you want the answer in.” Second click: line 5 of the brief.'
  },
  {
   id:'the-brief',
   title:'One question, grown into a brief',
   section:'03 / Put together',
   kind:'ht-zoom ht-ch-ink ht-e-draw',
   parts:[
    '<div class="ht-frame"><div class="ht-page"><div class="micro">The brief · illustrative</div><p class="ht-was">Where can I learn paid ads?</p><table>'+BRIEF.map(b=>'<tr'+(b[0]==='Good'?' class="ht-hit"':'')+'><th scope="row">'+b[0]+'</th><td>'+b[1]+'</td></tr>').join('')+'</table></div></div>',
    '<p class="ht-zoom-cap">The line most people skip: <b>how you’ll know it’s good.</b></p>'
   ],
   reveals:[1,2],
   source:'Illustrative brief, written for this deck. Each row is one of the five questions.',
   note:'About 60 seconds. The whole brief on one page: the six-word question struck out, then one line per question. Read the left column: done, plan, best, good, edges. Second click glides in to the acceptance criteria. SAY: “This is the line most people skip, and it is the one that stops the sloppy work.”'
  },
  {
   id:'six-to-116',
   title:'From 6 words to 116',
   section:'03 / Put together',
   kind:'ht-bars ht-e-draw',
   parts:[
    '<div class="ht-rows"><div class="ht-row"><span class="micro">Before</span><div class="ht-track"><div class="ht-bar" style="width:5.2%"></div></div><span class="ht-n">6</span></div><div class="ht-row ht-after"><span class="micro">After</span><div class="ht-track"><div class="ht-bar" style="width:100%"></div></div><span class="ht-n">116</span></div></div>',
    '<p class="ht-claim">Same person, same question. <span class="ht-sweep">The extra 110 words are the thinking.</span></p>'
   ],
   reveals:[1,2],
   source:'Counted from the illustrative brief on slide 13 (22, 26, 22, 22 and 24 words) and the prompt on slide 5 (6 words).',
   note:'About 30 seconds. SAY: “Six words in. A hundred and sixteen out. You didn’t need to know anything about ads to write those extra words. You just answered five questions.”'
  },
  {
   id:'before-after',
   title:'Same AI. Different thinking.',
   section:'03 / Put together',
   kind:'ht-split ht-e-draw',
   parts:[
    '<div class="ht-half ht-b"><div class="micro">Before</div><p class="ht-p">“Where can I learn paid ads?”</p><p class="ht-res">You get: a list of popular courses.</p></div>',
    '<div class="ht-half ht-a"><div class="micro">After</div><p class="ht-p">Salon, £10 a day, by 31 January. Ask me first. Learn from the best five. Under £50, three hours a week. Official guides from 2025, as a weekly table.</p><p class="ht-res">You get: a six-week plan for your salon that ends in a live campaign.</p></div>'
   ],
   reveals:[1,2],
   source:'Illustrative example. The two results describe the kind of answer each prompt invites; neither was run for this deck.',
   note:'About 45 seconds. SAY: “Same AI. Same afternoon. On the left, a list you could have found on Google. On the right, a plan for your business that ends with something live.” If you have run this for real before recording, swap in the real answer and say so.'
  },
  {
   id:'anything',
   title:'It works for anything',
   section:'04 / It works for anything',
   kind:'ht-hold ht-ch-tab ht-e-zoom',
   parts:[tabs(3),'<div class="ht-placeholder"><div class="micro">Placeholder · Taylor’s examples go here before recording</div><p>Each example runs the same five questions on a different job.</p></div>'],
   reveals:[0,1],
   source:'Placeholder. Taylor will supply the examples; none are claimed here.',
   note:'PLACEHOLDER. Taylor is choosing the examples. Each one should show the same five questions on a different job, so viewers see this is not just a learning trick. Add one slide per example after this one before recording.'
  },
  {
   id:'close',
   title:'Know the questions',
   section:'05 / Keep this',
   kind:'ht-invite ht-e-zoom',
   parts:[
    '<div class="ht-card"><div class="ht-card-top"><span>Before your next prompt</span><span>5 questions</span></div><div class="ht-card-body"><div class="ht-cal" aria-hidden="true"><small>Ask</small><b>5</b></div><ol>'+Q.map(q=>'<li><b>'+q[0]+'</b>'+q[1]+'</li>').join('')+'</ol></div><span class="ht-done" aria-hidden="true">'+tick+'</span></div>',
    '<p class="ht-one">You don’t need to know the answer. You need to know the questions.</p>'
   ],
   reveals:[1,2],
   source:'Taylor’s framework, from the video brief of 20 October 2026.',
   note:'About 30 seconds. The card is the thing to screenshot. SAY: “Next time you open AI and think, what do I say? Don’t look for the answer. Ask these five questions.” Second click, slowly: “You don’t need to know the answer. You need to know the questions.”'
  }
 ]
};
})();
