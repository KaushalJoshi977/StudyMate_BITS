/* StudyMate static prototype: no backend, frameworks, or external JS libraries. */
(() => {
  'use strict';
  const KEY = 'studymate_workspace_v1';
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const COLORS = [
    { color:'#7162e8', tint:'#f0edff', label:'Violet' },
    { color:'#3188c8', tint:'#eaf5ff', label:'Blue' },
    { color:'#e58b55', tint:'#fff0e5', label:'Orange' },
    { color:'#24a58f', tint:'#e6f9f4', label:'Mint' },
    { color:'#d15e93', tint:'#ffedf5', label:'Rose' },
    { color:'#8a9a42', tint:'#f3f6e7', label:'Olive' }
  ];
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2,'0');
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const dayDate = key => { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d); };
  const dayOffset = (key, days) => { const d=dayDate(key); d.setDate(d.getDate()+days); return dateKey(d); };
  const startOfWeek = key => dayOffset(key, -(dayDate(key).getDay()+6)%7);
  const dateTime = (key, time) => `${key}T${time}`;
  const timeObj = value => { const [d,t] = value.split('T'); const [h,m] = t.split(':').map(Number); const dt=dayDate(d);dt.setHours(h,m,0,0);return dt; };
  const timeMins = hhmm => {const [h,m] = hhmm.split(':').map(Number);return h*60+m;};
  const minsTime = n => `${pad(Math.floor(n/60))}:${pad(n%60)}`;
  const niceTime = s => { const [h,m]=s.split(':').map(Number);return `${h%12||12}:${pad(m)} ${h>=12?'PM':'AM'}`; };
  const niceDate = key => dayDate(key).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
  const niceLongDate = key => dayDate(key).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const isToday = key => key===dateKey(new Date());
  const uid = () => (crypto?.randomUUID?.() || ('sm'+Date.now().toString(36)+Math.random().toString(36).slice(2,10)));
  const minutesText = min => min>=60 ? `${Math.floor(min/60)}h${min%60?` ${min%60}m`:''}` : `${min}m`;
  const pct = (a,b) => b?Math.round(100*a/b):0;
  let view = 'today';
  let selectedWeek = startOfWeek(dateKey(new Date()));
  let selectedCourse = 'all';
  let selectedReplanId = null;
  let focus = null;
  let focusInterval = null;
  let toastTimeout = null;

  function demoData() {
    const today = dateKey(new Date());
    const yesterday = dayOffset(today,-1);
    const next = n => dayOffset(today,n);
    const courses = [
      {id:'c_ds',name:'Data Structures & Algorithms',code:'CS201',color:COLORS[0].color},
      {id:'c_db',name:'Database Systems',code:'CS204',color:COLORS[1].color},
      {id:'c_re',name:'Requirements Engineering',code:'SE507',color:COLORS[3].color},
      {id:'c_st',name:'Statistics & Probability',code:'MA203',color:COLORS[2].color}
    ];
    const task = (id,courseId,title,minutes,deadline,scheduledAt,status='planned',type='Practice') => ({id,courseId,title,minutes,deadline,scheduledAt,status,type});
    const tasks = [
      task('t1','c_ds','Sorting algorithms recap',45,next(4),dateTime(yesterday,'19:00'),'completed','Revision'),
      task('t2','c_st','Probability practice problems',45,next(2),dateTime(yesterday,'20:00'),'missed'),
      task('t3','c_db','Normalization practice',45,next(3),dateTime(today,'19:00')),
      task('t4','c_re','Refine user stories & acceptance criteria',40,next(5),dateTime(today,'20:00'),'planned','Assignment'),
      task('t5','c_ds','Graph traversal exercises',60,next(4),dateTime(next(1),'19:00')),
      task('t6','c_st','ANOVA and hypothesis testing',45,next(6),dateTime(next(1),'20:15')),
      task('t7','c_db','SQL joins and subqueries',45,next(8),dateTime(next(2),'18:30')),
      task('t8','c_re','Prioritize requirements for MVP',50,next(7),dateTime(next(3),'19:00'),'planned','Assignment'),
      task('t9','c_ds','Dynamic programming review',45,next(9),null,'planned','Revision'),
      task('t10','c_re','Read discovery interview notes',30,next(6),null,'planned','Reading')
    ];
    const topics = [
      {id:'m1',courseId:'c_ds',name:'Sorting and search',confidence:'strong',reviewAt:next(7)},
      {id:'m2',courseId:'c_ds',name:'Graphs',confidence:'developing',reviewAt:next(2)},
      {id:'m3',courseId:'c_ds',name:'Dynamic programming',confidence:'review',reviewAt:today},
      {id:'m4',courseId:'c_db',name:'Normalization',confidence:'developing',reviewAt:next(3)},
      {id:'m5',courseId:'c_db',name:'SQL fundamentals',confidence:'strong',reviewAt:next(8)},
      {id:'m6',courseId:'c_re',name:'User stories',confidence:'developing',reviewAt:next(3)},
      {id:'m7',courseId:'c_re',name:'Prioritization',confidence:'review',reviewAt:today},
      {id:'m8',courseId:'c_st',name:'Probability distributions',confidence:'review',reviewAt:today},
      {id:'m9',courseId:'c_st',name:'Descriptive statistics',confidence:'strong',reviewAt:next(7)}
    ];
    const availability = {
      0:[{start:'09:00',end:'12:00'},{start:'16:00',end:'19:00'}],
      1:[{start:'18:30',end:'22:00'}],2:[{start:'18:30',end:'22:00'}],
      3:[{start:'18:30',end:'22:00'}],4:[{start:'18:30',end:'22:00'}],
      5:[{start:'18:30',end:'22:00'}],6:[{start:'09:00',end:'12:00'},{start:'16:00',end:'19:00'}]
    };
    return {version:1, profile:{name:'Student'}, courses,tasks,topics,availability,meta:{createdAt:new Date().toISOString(),rescheduled:0,isDemo:true}};
  }
  function load() {
    try {
      const raw=localStorage.getItem(KEY);
      if (!raw) return demoData();
      const parsed=JSON.parse(raw);
      if (!Array.isArray(parsed.courses)||!Array.isArray(parsed.tasks)||!Array.isArray(parsed.topics)||!parsed.availability) throw Error('Invalid saved data');
      return parsed;
    } catch (err) { console.warn('StudyMate: could not read saved workspace:',err); return demoData(); }
  }
  let state = load();
  function save() { try {localStorage.setItem(KEY,JSON.stringify(state));}catch(e){toast('Storage is unavailable. Changes may not persist.',true);} }
  function colorFor(c) {return COLORS.find(x=>x.color===c?.color)||COLORS[0];}
  const course = id => state.courses.find(c=>c.id===id);
  const taskById = id => state.tasks.find(t=>t.id===id);
  const topicById = id => state.topics.find(t=>t.id===id);
  const courseName = id => course(id)?.name||'Deleted course';
  const sortedTasks = arr => [...arr].sort((a,b)=>(a.deadline||'9999').localeCompare(b.deadline||'9999'));
  const courseStyle = c => {const color=colorFor(c);return `--course-color:${color.color};--tint:${color.tint}`;};
  const planned = t => t.status!=='completed'&&t.status!=='missed';
  const isPast = t => t.status==='planned'&&t.scheduledAt&&timeObj(t.scheduledAt).getTime()<Date.now()-60000;
  const attention = t => t.status==='missed'||isPast(t);
  const needsPlanning = t => planned(t)&&!t.scheduledAt;
  const allAttention = () => state.tasks.filter(attention).sort((a,b)=>a.deadline.localeCompare(b.deadline));
  const weekDates = wk => Array.from({length:7},(_,i)=>dayOffset(wk,i));
  const tasksOnDay = day => state.tasks.filter(t=>t.scheduledAt?.slice(0,10)===day).sort((a,b)=>a.scheduledAt.localeCompare(b.scheduledAt));
  const weekTasks = wk => state.tasks.filter(t=>t.scheduledAt&&t.scheduledAt.slice(0,10)>=wk&&t.scheduledAt.slice(0,10)<=dayOffset(wk,6));
  const dayCapacity = day => (state.availability[dayDate(day).getDay()]||[]).reduce((s,w)=>s+timeMins(w.end)-timeMins(w.start),0);
  const dayPlanned = day => tasksOnDay(day).filter(t=>t.status!=='missed').reduce((s,t)=>s+t.minutes,0);
  const weekCapacity = wk => weekDates(wk).reduce((sum,day)=>sum+dayCapacity(day),0);
  function getStatus(t) {
    if(t.status==='completed')return {kind:'green',text:'Completed'};
    if(t.status==='missed')return {kind:'red',text:'Missed'};
    if(isPast(t))return {kind:'red',text:'Needs re-plan'};
    if(!t.scheduledAt)return {kind:'amber',text:'Unscheduled'};
    if(t.deadline<dateKey(new Date()))return {kind:'red',text:'Overdue'};
    return {kind:'blue',text:'Planned'};
  }
  const tag = (text,kind='gray') => `<span class="tag ${kind}">${esc(text)}</span>`;
  function priorityScore(t) {
    const days=Math.ceil((dayDate(t.deadline).getTime()-dayDate(dateKey(new Date())).getTime())/86400000);
    return (attention(t)?180:0)+(!t.scheduledAt?45:0)+Math.max(0,100-days*12)+(t.type==='Assignment'?15:0)-t.minutes/20;
  }
  function nextAction() {return [...state.tasks].filter(t=>t.status!=='completed').sort((a,b)=>priorityScore(b)-priorityScore(a))[0];}
  function totalProgress(){ const complete=state.tasks.filter(t=>t.status==='completed').length;return {complete,total:state.tasks.length,percent:pct(complete,state.tasks.length)};}
  const titleMap={today:'Overview',planner:'Weekly planner',courses:'My courses',mastery:'Topic mastery',availability:'Availability',insights:'My progress',settings:'About & data'};
  function heading(eyebrow,title,subtitle,actions='') {return `<div class="page-heading"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>${actions?`<div class="heading-actions">${actions}</div>`:''}</div>`;}
  function toast(message,error=false){
    const root=$('#toastRoot');root.innerHTML=`<div class="toast ${error?'error':''}">${icon(error?'alert':'check-circle')}<span>${esc(message)}</span></div>`;
    if(toastTimeout)clearTimeout(toastTimeout);
    toastTimeout=setTimeout(()=>root.innerHTML='',4200);
  }
  function navigate(to){view=titleMap[to]?to:'today';$('#sidebar').classList.remove('open');$('#mobileShade').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'});}
  function render() {
    $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    $('#breadcrumbText').textContent=titleMap[view];
    $('#avatarInitial').textContent=(state.profile.name.trim().charAt(0)||'S').toUpperCase();
    $('#profileText').textContent=state.profile.name;
    const html={today:renderToday,planner:renderPlanner,courses:renderCourses,mastery:renderMastery,availability:renderAvailability,insights:renderInsights,settings:renderSettings}[view]();
    $('#appView').innerHTML=html;
  }
  function sessionRow(t) {
    const c=course(t.courseId);const s=getStatus(t);
    const showAction=t.status!=='completed';
    return `<div class="session-row" style="${courseStyle(c)}"><div class="session-time">${t.scheduledAt?niceTime(t.scheduledAt.slice(11)):'—'}</div><div class="session-accent"></div><div class="session-main"><strong>${esc(t.title)}</strong><div class="sub">${esc(courseName(t.courseId))} · ${t.minutes} min · Due ${niceDate(t.deadline)}</div></div><div class="session-actions">${tag(s.text,s.kind)}${showAction?`<button class="link-button" data-action="${attention(t)?'replan':'complete'}" data-id="${t.id}">${attention(t)?'Re-plan':'Done'}</button>`:''}</div></div>`;
  }
  function renderToday(){
    const today=dateKey(new Date()); const todayTasks=tasksOnDay(today);
    const week= startOfWeek(today); const current=weekTasks(week); const complete=current.filter(t=>t.status==='completed').length;
    const next=nextAction();const urgent=allAttention().length;const unscheduled=state.tasks.filter(needsPlanning).length;
    const imminent=sortedTasks(state.tasks.filter(t=>t.status!=='completed')).slice(0,4);
    const {name}=state.profile;
    const greeting=new Date().getHours()<12?'Good morning':new Date().getHours()<17?'Good afternoon':'Good evening';
    return `${heading('YOUR STUDY SPACE',`${greeting}, ${name.split(' ')[0]} 👋`,'One clear next action, a plan that fits your life.',`<button class="btn secondary" data-action="new-course">${icon('book')} Add course</button><button class="btn" data-action="new-task">${icon('plus')} New study task</button>`)}
      <div class="dashboard-hero">
        <section class="hero-card ${next?'':'hero-empty'}"><div><div class="hero-top">${icon('spark')} YOUR NEXT BEST STUDY ACTION</div>${next?`<h2>${esc(next.title)}</h2><div class="hero-meta">${esc(courseName(next.courseId))} · ${next.minutes} min · Due ${niceDate(next.deadline)} ${attention(next)?'· Needs a new slot':''}</div>`:`<h2>Your study plan is all caught up!</h2><div class="hero-meta">Add a course or task to get started.</div>`}</div><div class="hero-cta">${next?`<button class="btn" data-action="${attention(next)?'replan':'focus'}" data-id="${next.id}">${icon(attention(next)?'refresh':'play')}${attention(next)?' Find a new time':' Start studying'}</button><button class="btn secondary" data-view="planner">See weekly plan ${icon('arrow')}</button>`:`<button class="btn" data-action="new-task">${icon('plus')} Add a study task</button>`}</div></section>
        <section class="card overview-side"><div><div class="side-kicker">This week's progress</div><div class="big-progress"><div class="ring" style="--pct:${pct(complete,current.length)}"><div class="ring-inside"><strong>${pct(complete,current.length)}%</strong><span>completed</span></div></div><div class="progress-info"><strong>${complete} of ${current.length}</strong><p>scheduled sessions<br>completed this week</p></div></div></div><div class="progress-foot">${icon('spark')}${complete?'Every completed session adds up.':'Small steps make big progress.'}</div></section>
      </div>
      <div class="stat-grid">
       <div class="card stat-card"><div class="stat-icon purple">${icon('book')}</div><div><div class="stat-label">Active courses</div><div class="stat-number">${state.courses.length}</div><div class="stat-note">In your workspace</div></div></div>
       <div class="card stat-card"><div class="stat-icon green">${icon('check-circle')}</div><div><div class="stat-label">Sessions completed</div><div class="stat-number">${state.tasks.filter(t=>t.status==='completed').length}</div><div class="stat-note">All-time progress</div></div></div>
       <div class="card stat-card"><div class="stat-icon amber">${icon('alert')}</div><div><div class="stat-label">Needs attention</div><div class="stat-number">${urgent}</div><div class="stat-note">Missed or past sessions</div></div></div>
       <div class="card stat-card"><div class="stat-icon blue">${icon('calendar')}</div><div><div class="stat-label">To be scheduled</div><div class="stat-number">${unscheduled}</div><div class="stat-note">Awaiting a study slot</div></div></div>
      </div>
      <div class="dashboard-body"><div class="stack"><section class="card card-pad"><div class="section-title"><div><h2>Today's study plan</h2><p>${niceLongDate(today)}</p></div><button class="link-button" data-view="planner">View planner ${icon('arrow')}</button></div>${todayTasks.length?todayTasks.map(sessionRow).join(''):`<div class="empty-state"><div class="empty-symbol">${icon('calendar')}</div><strong>No sessions booked today</strong><p>Add a task or use the weekly planner to schedule your next study session.</p><button class="btn small ghost" data-action="new-task">${icon('plus')} Plan a session</button></div>`}</section>
       <section class="card card-pad"><div class="section-title"><div><h2>Keep your momentum</h2><p>Unfinished tasks need an intentional decision.</p></div></div>${urgent?`<div class="notice">${icon('alert')} <span><strong>${urgent} session${urgent>1?'s':''} need${urgent===1?'s':''} attention.</strong> Pick a new slot that works before each deadline.</span></div><button class="btn ghost" data-action="replan-all">${icon('refresh')} Review missed sessions</button>`:`<div class="notice">${icon('check-circle')} You're up to date. Any missed or past sessions will appear here for re-planning.</div>`}</section></div>
       <div class="stack"><section class="card card-pad"><div class="section-title"><div><h2>Upcoming deadlines</h2><p>Know what's around the corner</p></div></div>${imminent.length?imminent.map(t=>`<div class="due-item" style="${courseStyle(course(t.courseId))}"><span class="course-dot"></span><div><strong>${esc(t.title)}</strong><p>${esc(courseName(t.courseId))}</p></div><span class="due-date">${niceDate(t.deadline)}</span></div>`).join(''):`<div class="empty-state"><strong>Nothing due right now</strong></div>`}</section><section class="callout">${icon('spark')}<strong>Designed around real life</strong><p>Your available hours—not an ideal timetable—decide when study sessions can fit. Change your availability any time.</p><button class="link-button" data-view="availability">Set my availability ${icon('arrow')}</button></section></div></div>`;
  }
  function renderPlanner(){
    const days=weekDates(selectedWeek);
    const week=weekTasks(selectedWeek);
    const used=week.filter(t=>t.status!=='missed').reduce((s,t)=>s+t.minutes,0);
    const total=weekCapacity(selectedWeek);
    const unscheduled=state.tasks.filter(needsPlanning).length;
    const urgent=allAttention().length;
    const plannerDays=days.map(day=>{
      const dayTasks=tasksOnDay(day);const capacity=dayCapacity(day);const booked=dayPlanned(day);
      const overloaded=booked>capacity;
      return `<div class="day-column ${isToday(day)?'is-today':''} ${overloaded?'is-overload':''}"><div class="day-head"><div class="day-name">${SHORT_DAYS[dayDate(day).getDay()]}</div><div class="day-date">${dayDate(day).getDate()}</div></div><div class="day-slots">${dayTasks.map(t=>{let c=course(t.courseId);return `<button class="planner-task ${t.status==='completed'?'completed':attention(t)?'missed':''}" data-action="${attention(t)?'replan':'task-details'}" data-id="${t.id}" style="${courseStyle(c)}"><small>${t.scheduledAt?niceTime(t.scheduledAt.slice(11)):''}</small><strong>${esc(t.title)}</strong><small>${t.minutes}m · ${esc(c?.code||'Course')}</small></button>`;}).join('')}</div><div class="day-foot">${minutesText(booked)} / ${minutesText(capacity)} used<br><button class="day-add" data-action="new-task" data-date="${day}">${icon('plus')} Add</button></div></div>`;
    }).join('');
    const capacityBars=days.map(day=>{const totalDay=dayCapacity(day);const usedDay=dayPlanned(day);return `<div class="capacity-row ${usedDay>totalDay?'capacity-over':''}"><div class="capacity-meter"><strong>${SHORT_DAYS[dayDate(day).getDay()]}</strong><span>${minutesText(usedDay)} / ${minutesText(totalDay)}</span></div><div class="progress-track"><div class="progress-fill" style="width:${totalDay?Math.min(100,pct(usedDay,totalDay)):0}%"></div></div></div>`;}).join('');
    return `${heading('MAKE ROOM FOR WHAT MATTERS','Your weekly planner','Study sessions mapped to your actual available hours.',`<button class="btn secondary" data-action="auto-plan">${icon('spark')} Auto-plan tasks</button><button class="btn" data-action="replan-all">${icon('refresh')} Re-plan missed work</button>`)}
    <div class="card card-pad"><div class="section-title"><div><h2>Week at a glance</h2><p>Click any session to complete it, move it, or mark it missed.</p></div><div class="week-toolbar"><button class="icon-button" aria-label="Previous week" data-action="week-prev">${icon('chev-left')}</button><strong>${niceDate(days[0])} – ${niceDate(days[6])}</strong><button class="icon-button" aria-label="Next week" data-action="week-next">${icon('chev-right')}</button></div></div><div class="planner-grid-layout"><div class="week-scroll"><div class="week-grid">${plannerDays}</div></div><div class="planner-side"><section class="card card-pad"><div class="section-title"><h2>Weekly capacity</h2></div><div style="font-size:23px;font-weight:800">${minutesText(used)} <small style="color:var(--muted);font-weight:500;font-size:12px">/ ${minutesText(total)}</small></div><p class="planner-note">Committed session time versus your weekly availability.</p>${capacityBars}</section><section class="callout">${icon('alert')}<strong>Plan health</strong><p>${urgent?`${urgent} session(s) need a new slot.`:'No missed sessions need a decision.'} ${unscheduled?`${unscheduled} task(s) are waiting to be scheduled.`:'All other tasks have slots.'}</p><button class="link-button" data-view="availability">Adjust study hours ${icon('arrow')}</button></section></div></div></div>`;
  }
  function renderCourses(){
    const courseCards=state.courses.map(c=>{
      const tasks=state.tasks.filter(t=>t.courseId===c.id),completed=tasks.filter(t=>t.status==='completed').length;
      return `<article class="card course-card" style="${courseStyle(c)}"><div class="course-card-top"><div class="course-initial">${esc(c.code.slice(0,2).toUpperCase())}</div>${tag(c.code,'gray')}</div><h3>${esc(c.name)}</h3><p>${tasks.length} study task${tasks.length===1?'':'s'} · ${state.topics.filter(t=>t.courseId===c.id).length} topics</p><div class="course-card-bottom"><span>Course progress</span><strong>${pct(completed,tasks.length)}%</strong></div><div class="progress-track"><div class="progress-fill" style="background:${esc(c.color)};width:${pct(completed,tasks.length)}%"></div></div><div style="display:flex;justify-content:space-between;margin-top:15px;align-items:center"><button class="link-button" data-action="filter-course" data-id="${c.id}">View tasks ${icon('arrow')}</button><button class="mini-button danger" data-action="delete-course" data-id="${c.id}" aria-label="Delete ${esc(c.name)}">${icon('trash')}</button></div></article>`;
    }).join('');
    const filter=['all',...state.courses.map(c=>c.id)].map(id=>`<button class="filter-pill ${selectedCourse===id?'active':''}" data-action="filter-course" data-id="${id}">${id==='all'?'All courses':esc(course(id)?.code||'Course')}</button>`).join('');
    const tasks=sortedTasks(state.tasks.filter(t=>selectedCourse==='all'||t.courseId===selectedCourse));
    return `${heading('YOUR ACADEMIC WORLD','Courses & study tasks','Keep every deadline, topic and session organized in one place.',`<button class="btn secondary" data-action="new-course">${icon('plus')} Add course</button><button class="btn" data-action="new-task">${icon('plus')} Add study task</button>`)}
      ${state.courses.length?`<div class="course-grid">${courseCards}</div>`:`<div class="card empty-state" style="margin-bottom:20px"><div class="empty-symbol">${icon('book')}</div><strong>No courses yet</strong><p>Add a course first, then create study tasks.</p><button class="btn small" data-action="new-course">Add first course</button></div>`}
      <section class="card card-pad"><div class="section-title"><div><h2>Your study tasks</h2><p>Manage tasks and see how close the deadlines are.</p></div></div><div class="filter-row">${filter}</div>${tasks.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Task</th><th>Course</th><th>Due</th><th>Study time</th><th>Status</th><th>Actions</th></tr></thead><tbody>${tasks.map(t=>{const s=getStatus(t);return `<tr><td><strong>${esc(t.title)}</strong><small>${esc(t.type)} · ${t.scheduledAt?'Scheduled '+niceDate(t.scheduledAt.slice(0,10))+' '+niceTime(t.scheduledAt.slice(11)):'Not scheduled'}</small></td><td>${esc(course(t.courseId)?.code||'—')}</td><td>${niceDate(t.deadline)}</td><td>${t.minutes} min</td><td>${tag(s.text,s.kind)}</td><td><div class="table-actions"><button class="mini-button" data-action="task-details" data-id="${t.id}">${icon('edit')} Manage</button></div></td></tr>`}).join('')}</tbody></table></div>`:`<div class="empty-state"><strong>No tasks found</strong><p>Create a task to start building your plan.</p><button class="btn small ghost" data-action="new-task">Add a task</button></div>`}</section>`;
  }
  function renderMastery(){
    const topics=state.topics;
    const scores={strong:100,developing:55,review:15};
    const courseSummary=state.courses.map(c=>{const ts=topics.filter(t=>t.courseId===c.id);const score=ts.length?Math.round(ts.reduce((sum,t)=>sum+(scores[t.confidence]||0),0)/ts.length):0;return `<div class="readiness-card" style="${courseStyle(c)}"><div class="readiness-initial">${esc(c.code.slice(0,2))}</div><div class="readiness-details"><strong>${esc(c.name)}</strong><div class="progress-track"><div class="progress-fill" style="width:${score}%;background:${esc(c.color)}"></div></div></div><span class="readiness-value">${score}%</span></div>`;}).join('');
    const dueReview=topics.filter(t=>t.confidence!=='strong'&&t.reviewAt<=dateKey(new Date())).length;
    return `${heading('LEARN. REVIEW. IMPROVE.','Topic mastery','Finishing a task is different from feeling ready for the exam.',`<button class="btn" data-action="new-topic">${icon('plus')} Add topic</button>`)}
      <div class="notice">${icon('info')} Mark each topic as Strong, Developing or Needs review. Readiness scores are simple visual estimates, not actual exam predictions.</div>
      <div class="mastery-layout"><section class="card card-pad"><div class="section-title"><div><h2>Topic confidence</h2><p>${topics.length} tracked topics · ${dueReview} waiting for review</p></div></div>${topics.length?topics.map(t=>{const c=course(t.courseId);return `<div class="mastery-item" style="${courseStyle(c)}"><span class="course-dot"></span><div><strong>${esc(t.name)}</strong><small>${esc(c?.name||'Course')} · Review ${niceDate(t.reviewAt)}</small><button class="link-button" data-action="schedule-review" data-id="${t.id}">Schedule review ${icon('arrow')}</button></div><div class="confidence-actions"><button class="confidence-choice strong ${t.confidence==='strong'?'selected':''}" data-action="confidence" data-id="${t.id}" data-value="strong">Strong</button><button class="confidence-choice developing ${t.confidence==='developing'?'selected':''}" data-action="confidence" data-id="${t.id}" data-value="developing">Developing</button><button class="confidence-choice review ${t.confidence==='review'?'selected':''}" data-action="confidence" data-id="${t.id}" data-value="review">Needs review</button></div></div>`;}).join(''):`<div class="empty-state"><strong>No topics tracked</strong><p>Add topics to monitor your revision needs.</p></div>`}</section><div class="stack"><section class="card card-pad"><div class="section-title"><h2>Course readiness</h2></div>${state.courses.length?courseSummary:'<p class="planner-note">Add courses to see a readiness overview.</p>'}</section><section class="callout">${icon('spark')}<strong>Review is part of learning</strong><p>Topic confidence is self-reported in this prototype. Create study sessions to revisit weak topics, then update your confidence.</p></section></div></div>`;
  }
  function renderAvailability(){
    const days=[1,2,3,4,5,6,0];
    const list=days.map(d=>{const windows=state.availability[d]||[];const total=windows.reduce((sum,w)=>sum+timeMins(w.end)-timeMins(w.start),0);return `<div class="card availability-day"><div><h3>${DAYS[d]}</h3><p>${windows.length?windows.map(w=>`${niceTime(w.start)} – ${niceTime(w.end)}`).join(' · '):'No study hours'}</p></div><div class="availability-day-right"><div class="day-hours">${minutesText(total)}</div><button class="mini-button" data-action="edit-availability" data-day="${d}">${icon('edit')} Edit</button></div></div>`;}).join('');
    const total=weekCapacity(startOfWeek(dateKey(new Date())));
    return `${heading('PLAN AROUND YOUR LIFE','Your available study time','Tell StudyMate when you can realistically study—not when you wish you could.')}
      <div class="notice">${icon('info')} The planner only suggests slots inside these windows and does not double-book sessions. You can define up to two windows per day in this prototype.</div><section class="card card-pad" style="margin-bottom:20px"><div class="section-title"><div><h2>Your weekly study capacity</h2><p>Total available hours across a normal week</p></div><strong style="font-size:25px;color:var(--primary)">${minutesText(total)}</strong></div><p class="planner-note">Changes affect new suggestions; existing booked sessions are not moved automatically. Conflicting sessions will be highlighted in the planner.</p></section><div class="availability-list">${list}</div>`;
  }
  function renderInsights(){
    const complete=state.tasks.filter(t=>t.status==='completed');const total=state.tasks.length;
    const minutes=complete.reduce((s,t)=>s+t.minutes,0);
    const active=state.tasks.filter(t=>t.status==='planned').length;
    const overdue=allAttention().length;
    const perCourse=state.courses.map(c=>{const tasks=state.tasks.filter(t=>t.courseId===c.id);const done=tasks.filter(t=>t.status==='completed').length;return `<div class="bar-row"><div class="bar-row-heading"><span>${esc(c.name)}</span><span>${done}/${tasks.length} completed</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct(done,tasks.length)}%;background:${esc(c.color)}"></div></div></div>`;}).join('');
    const distribution=[{label:'Completed',n:complete.length,color:'var(--green)'},{label:'Planned',n:active,color:'var(--primary)'},{label:'Missed',n:state.tasks.filter(t=>t.status==='missed').length,color:'var(--red)'}].map(a=>`<div class="bar-row"><div class="bar-row-heading"><span>${a.label}</span><span>${a.n} sessions</span></div><div class="progress-track"><div class="progress-fill" style="background:${a.color};width:${pct(a.n,total)}%"></div></div></div>`).join('');
    return `${heading('THE BIGGER PICTURE','Your study progress','A simple overview based on the sessions you actually track.')}
      <div class="insights-grid"><div class="card insight-metric"><div class="muted">Overall completion rate</div><strong>${pct(complete.length,total)}%</strong><p>${complete.length} of ${total} tasks completed</p></div><div class="card insight-metric"><div class="muted">Completed study time</div><strong>${minutesText(minutes)}</strong><p>Across completed study sessions</p></div><div class="card insight-metric"><div class="muted">Re-planned sessions</div><strong>${state.meta.rescheduled||0}</strong><p>${overdue} session(s) currently need attention</p></div></div>
      <div class="insights-two"><section class="card card-pad"><div class="section-title"><h2>Progress by course</h2></div>${perCourse||'<p class="planner-note">Add courses to see your progress.</p>'}</section><section class="card card-pad"><div class="section-title"><h2>Session status</h2></div>${distribution}<div class="soft-note">These are prototype workspace counts—not measured user-retention or learning-outcome metrics.</div></section></div>`;
  }
  function renderSettings(){
    return `${heading('UNDER THE HOOD','About this prototype','StudyMate is a functional front-end built for product discovery and user testing.')}
      <div class="settings-grid"><section class="card card-pad"><div class="section-title"><h2>Workspace & your data</h2></div><div class="setting-option">${icon('user')}<div><strong>Profile</strong><p>Change the name shown on your dashboard.</p><button class="btn secondary small" data-action="edit-profile">Edit my name</button></div></div><div class="rule"></div><div class="setting-option">${icon('download')}<div><strong>Save a backup</strong><p>Download your courses, tasks and availability as a JSON file.</p><button class="btn secondary small" data-action="export">Export my data</button></div></div><div class="rule"></div><div class="setting-option">${icon('refresh')}<div><strong>Reset sample workspace</strong><p>Replace all locally saved changes with fresh example data. This cannot be undone.</p><button class="btn small danger" data-action="reset-demo">Reset demo data</button></div></div></section>
      <section class="card card-pad"><div class="section-title"><h2>What this MVP tests</h2></div><ul class="scope-list"><li><strong>Course setup:</strong> courses, deadlines, tasks and effort</li><li><strong>Today view:</strong> a clear next best study action</li><li><strong>Weekly planner:</strong> real availability and workload</li><li><strong>Recovery:</strong> missed sessions, valid slot suggestions and manual adjustment</li><li><strong>Mastery:</strong> self-reported topic confidence</li></ul><div class="soft-note"><strong>Important:</strong> This static website runs entirely in your browser. Data is stored in localStorage on this device and browser only. It does not provide accounts, cloud sync, notifications, LMS integrations or real AI recommendations. Use Export before clearing browser data.</div></section></div>`;
  }
  function renderModal(title,subtitle,body,wide=false){
    $('#modalRoot').innerHTML=`<div class="modal-backdrop" data-action="close-backdrop"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-head"><div><h2>${esc(title)}</h2>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('x')}</button></header><div class="modal-body">${body}</div></section></div>`;
    $('#modalRoot input:not([type="hidden"]),#modalRoot select,#modalRoot button')?.focus({preventScroll:true});
  }
  function closeModal(){
    $('#modalRoot').innerHTML='';
    if(focusInterval)clearInterval(focusInterval);
    focusInterval=null;focus=null;
  }
  const actions = `<div class="modal-actions"><button type="button" class="btn secondary" data-action="close-modal">Cancel</button><button type="submit" class="btn">Save changes</button></div>`;
  function openNewCourse(){
    renderModal('Add a course','Organize your academic commitments.',`<form data-form="course"><div class="field"><label for="cname">Course name</label><input id="cname" name="name" maxlength="70" placeholder="e.g., Operating Systems" required autofocus></div><div class="form-grid"><div class="field"><label for="ccode">Course code</label><input id="ccode" name="code" maxlength="12" placeholder="e.g., CS301" required></div><div class="field"><label for="ccolor">Accent color</label><select id="ccolor" name="color">${COLORS.map(c=>`<option value="${c.color}">${c.label}</option>`).join('')}</select></div></div>${actions.replace('Save changes','Add course')}</form>`);
  }
  function openNewTask(day=''){
    if(!state.courses.length){toast('Add a course before creating a task.',true);openNewCourse();return;}
    const today=dateKey(new Date());
    renderModal('Create a study task','Add a deadline and time estimate. StudyMate can find an available slot.',`<form data-form="task"><div class="field"><label for="taskTitle">What will you study?</label><input name="title" id="taskTitle" maxlength="100" placeholder="e.g., Solve 10 SQL queries" required></div>
      <div class="form-grid"><div class="field"><label for="taskCourse">Course</label><select id="taskCourse" name="courseId" required>${state.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label for="taskType">Task type</label><select id="taskType" name="type"><option>Practice</option><option>Revision</option><option>Assignment</option><option>Reading</option><option>Exam prep</option></select></div><div class="field"><label for="taskMinutes">Estimated effort (minutes)</label><input id="taskMinutes" type="number" name="minutes" min="15" max="480" step="5" value="45" required></div><div class="field"><label for="taskDeadline">Deadline</label><input id="taskDeadline" type="date" name="deadline" min="${today}" value="${day&&day>today?day:dayOffset(today,5)}" required></div></div>
      <div class="field"><label for="taskPlacement">When to schedule?</label><select id="taskPlacement" name="placement" data-placement-select><option value="auto" ${!day?'selected':''}>Suggest first available slot</option><option value="manual" ${day?'selected':''}>I'll pick a date and time</option><option value="later">Leave unscheduled for now</option></select><span class="help">Automatic suggestions respect your study hours and other booked sessions.</span></div>
      <div id="manualFields" class="form-grid" ${!day?'hidden':''}><div class="field"><label for="taskDay">Study date</label><input id="taskDay" type="date" name="scheduleDate" min="${today}" value="${day||today}"></div><div class="field"><label for="taskHour">Start time</label><input id="taskHour" type="time" name="scheduleTime" value="19:00" step="900"></div></div>${actions.replace('Save changes','Create task')}</form>`);
  }
  function openNewTopic(){
    if(!state.courses.length){toast('Add a course first.',true);openNewCourse();return;}
    const today=dateKey(new Date());
    renderModal('Track a new topic','Use confidence levels to plan realistic revisions.',`<form data-form="topic"><div class="field"><label for="topicName">Topic name</label><input id="topicName" name="name" maxlength="90" placeholder="e.g., Binary search trees" required></div><div class="form-grid"><div class="field"><label for="topicCourse">Course</label><select id="topicCourse" name="courseId">${state.courses.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label for="topicConfidence">Current confidence</label><select id="topicConfidence" name="confidence"><option value="review">Needs review</option><option value="developing">Developing</option><option value="strong">Strong</option></select></div><div class="field full"><label for="topicReview">Next review</label><input type="date" id="topicReview" name="reviewAt" value="${dayOffset(today,2)}" min="${today}" required></div></div>${actions.replace('Save changes','Add topic')}</form>`);
  }
  function openAvailability(day){
    const d=Number(day),windows=state.availability[d]||[];
    const first=windows[0]||{start:'',end:''};const second=windows[1]||{start:'',end:''};
    renderModal(`Edit ${DAYS[d]}`,'Set up to two study windows for this day.',`<form data-form="availability" data-day="${d}"><div class="form-grid"><div class="field"><label>Window 1 — Start</label><input type="time" name="start1" value="${first.start}"></div><div class="field"><label>Window 1 — End</label><input type="time" name="end1" value="${first.end}"></div><div class="field"><label>Window 2 — Start (optional)</label><input type="time" name="start2" value="${second.start}"></div><div class="field"><label>Window 2 — End (optional)</label><input type="time" name="end2" value="${second.end}"></div></div><p class="modal-message">Leave every time blank to mark this day unavailable. Study slots must not overlap.</p>${actions}</form>`);
  }
  function openProfile(){
    renderModal('Your profile','This name is only used in your local workspace.',`<form data-form="profile"><div class="field"><label for="profileName">Your name</label><input id="profileName" name="name" value="${esc(state.profile.name)}" maxlength="45" required></div>${actions}</form>`);
  }
  function showTaskDetails(id){
    const t=taskById(id);if(!t)return;
    const status=getStatus(t);
    renderModal(t.title,`${courseName(t.courseId)} · ${t.minutes} minutes · Due ${niceDate(t.deadline)}`,`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${tag(status.text,status.kind)}${tag(t.type,'gray')}</div><p class="modal-message">${t.scheduledAt?'Current study slot: '+niceLongDate(t.scheduledAt.slice(0,10))+' at '+niceTime(t.scheduledAt.slice(11)):'This task has not been scheduled yet.'}</p><div class="form-grid"><button class="btn ghost" data-action="schedule" data-id="${t.id}">${icon('calendar')} ${t.scheduledAt?'Move session':'Find study time'}</button>${t.status==='completed'?`<button class="btn secondary" data-action="reopen" data-id="${t.id}">${icon('refresh')} Reopen task</button>`:`<button class="btn secondary" data-action="complete" data-id="${t.id}">${icon('check')} Mark complete</button><button class="btn secondary" data-action="missed" data-id="${t.id}">${icon('alert')} Mark missed</button>`}</div><div class="rule"></div><button class="mini-button danger" data-action="delete-task" data-id="${t.id}">${icon('trash')} Delete task</button>`);
  }
  function conflictsFor(task,proposed){
    const start=timeObj(proposed).getTime(),end=start+task.minutes*60000;
    return state.tasks.filter(t=>t.id!==task.id&&t.status==='planned'&&t.scheduledAt&&!isPast(t)).some(t=>{
      const s=timeObj(t.scheduledAt).getTime();return start<s+t.minutes*60000&&s<end;
    });
  }
  function placementError(task,proposed){
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(proposed)||Number.isNaN(timeObj(proposed).getTime()))return 'Choose a valid date and time.';
    const start=timeObj(proposed),end=new Date(start.getTime()+task.minutes*60000);
    if(start.getTime()<Date.now()-60000)return 'Choose a future study slot.';
    if(dateKey(end)>task.deadline || dateKey(start)>task.deadline)return 'This session must finish by its deadline.';
    if(dateKey(start)!==dateKey(end))return 'A study session cannot extend into the next day.';
    const w=state.availability[start.getDay()]||[];
    const startMin=start.getHours()*60+start.getMinutes(),endMin=startMin+task.minutes;
    if(!w.some(x=>startMin>=timeMins(x.start)&&endMin<=timeMins(x.end)))return 'That time is outside your availability. Edit your study hours or choose another slot.';
    if(conflictsFor(task,proposed))return 'That time overlaps an existing study session.';
    return null;
  }
  function findSlots(task,limit=3){
    const today=dateKey(new Date());
    if(task.deadline<today)return [];
    const last=task.deadline<dayOffset(today,21)?task.deadline:dayOffset(today,21);
    const slots=[];
    for(let d=today;d<=last;d=dayOffset(d,1)){
      const windows=[...(state.availability[dayDate(d).getDay()]||[])].sort((a,b)=>a.start.localeCompare(b.start));
      for(const w of windows){
        let possible=timeMins(w.start);const max=timeMins(w.end);
        if(d===today){const now=new Date();possible=Math.max(possible,Math.ceil((now.getHours()*60+now.getMinutes()+2)/15)*15);}
        if(possible>=1440)continue;
        const busy=state.tasks.filter(t=>t.id!==task.id&&t.status==='planned'&&t.scheduledAt?.startsWith(d)&&!isPast(t)).map(t=>({start:timeMins(t.scheduledAt.slice(11)),end:timeMins(t.scheduledAt.slice(11))+t.minutes})).sort((a,b)=>a.start-b.start);
        for(const other of busy){if(possible+task.minutes<=other.start)break;possible=Math.max(possible,other.end);}
        if(possible+task.minutes<=max){
          const proposed=dateTime(d,minsTime(possible));
          if(!placementError(task,proposed)){slots.push(proposed);if(slots.length>=limit)return slots;}
        }
      }
    }
    return slots;
  }
  function replanTask(t,at){
    const error=placementError(t,at);if(error){toast(error,true);return false;}
    t.scheduledAt=at;t.status='planned';state.meta.rescheduled=(state.meta.rescheduled||0)+1;save();closeModal();render();toast(`Moved to ${niceDate(at.slice(0,10))} at ${niceTime(at.slice(11))}.`);return true;
  }
  function openReplan(id){
    const tasks=id?[taskById(id)].filter(Boolean):allAttention();
    if(!tasks.length){toast('No missed sessions need re-planning.');return;}
    const t=tasks.find(x=>x.id===selectedReplanId)||tasks[0];selectedReplanId=t.id;
    const suggestions=findSlots(t,3);
    const tablist=tasks.length>1?`<div class="replan-list">${tasks.map(item=>`<button class="${item.id===t.id?'active':''}" data-action="replan" data-id="${item.id}">${esc(item.title)}</button>`).join('')}</div>`:'';
    const candidates=suggestions.length?suggestions.map(at=>`<div class="suggestion"><div><strong>${niceLongDate(at.slice(0,10))}</strong><small>${niceTime(at.slice(11))} · ${t.minutes} minutes · No conflict</small></div><button class="btn small" data-action="apply-slot" data-id="${t.id}" data-at="${at}">Use slot ${icon('arrow')}</button></div>`).join(''):`<div class="notice">${icon('alert')} No valid future slot was found before ${niceLongDate(t.deadline)}. Adjust your availability, reduce the task's effort, or discuss the deadline. StudyMate won't create an impossible schedule.</div>`;
    const today=dateKey(new Date());
    renderModal('Re-plan a study session','Find a realistic time instead of carrying an outdated timetable forward.',`${tablist}<p class="modal-message"><strong>${esc(t.title)}</strong><br>${t.minutes} minutes · Deadline: ${niceLongDate(t.deadline)}</p><div class="section-title"><h2>Suggested free slots</h2></div>${candidates}<div class="rule"></div><div class="section-title"><h2>Or choose a slot manually</h2></div><form data-form="manual-plan" data-id="${t.id}"><div class="form-grid"><div class="field"><label>Study date</label><input type="date" name="day" min="${today}" value="${suggestions[0]?.slice(0,10)||today}" required></div><div class="field"><label>Start time</label><input type="time" name="time" step="900" value="${suggestions[0]?.slice(11)||'19:00'}" required></div></div><div class="modal-actions"><button class="btn secondary" type="button" data-action="close-modal">Cancel</button><button class="btn" type="submit">Check & move session</button></div></form>`,true);
  }
  function openSchedule(id){
    const t=taskById(id);if(!t)return;
    selectedReplanId=t.id;openReplan(t.id);
  }
  function doAutoPlan(){
    const todo=sortedTasks(state.tasks.filter(needsPlanning));
    if(!todo.length){toast('All open tasks already have study slots.');return;}
    let added=0;
    for(const t of todo){const slot=findSlots(t,1)[0];if(slot){t.scheduledAt=slot;added++;}}
    if(added){save();render();}
    toast(added?`${added} task${added===1?'':'s'} scheduled. ${todo.length-added} still need${todo.length-added===1?'s':''} capacity.`:'No free slots found before these deadlines. Update your availability.',added===0);
  }
  function openFocus(id){
    const t=taskById(id);if(!t||t.status==='completed')return;
    if(attention(t)){openReplan(id);return;}
    closeModal();focus={id:t.id,remaining:t.minutes*60,running:true};
    renderModal('Focus session',`${t.title} · ${courseName(t.courseId)}`,`<div class="focus-area"><div class="focus-ring"><div><strong id="focusClock">${pad(t.minutes)}:00</strong><small>time remaining</small></div></div><p>Minimize distractions. When you're done, mark this session complete.</p><div class="focus-buttons"><button class="btn secondary" id="focusPauseButton" data-action="focus-toggle">${icon('pause')} Pause</button><button class="btn" data-action="complete" data-id="${t.id}">${icon('check')} Mark complete</button></div></div>`);
    focusInterval=setInterval(()=>{
      if(!focus||!focus.running)return;
      if(focus.remaining>0)focus.remaining--;
      const clock=$('#focusClock');if(clock)clock.textContent=`${pad(Math.floor(focus.remaining/60))}:${pad(focus.remaining%60)}`;
      if(focus.remaining===0){focus.running=false;toast('Focus timer finished. Mark your session complete!');const b=$('#focusPauseButton');if(b){b.disabled=true;b.textContent='Time finished';}}
    },1000);
  }
  function markComplete(id){
    const t=taskById(id);if(!t)return;
    if(t.status==='completed'){toast('This session is already completed.');return;}
    t.status='completed';t.completedAt=new Date().toISOString();save();closeModal();render();toast('Study session completed. Great work!');
  }
  function markMissed(id){
    const t=taskById(id);if(!t)return;
    t.status='missed';save();closeModal();render();toast('Marked as missed. Re-plan when you are ready.');
  }
  function exportData(){
    const payload=JSON.stringify(state,null,2);const blob=new Blob([payload],{type:'application/json'});const href=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=href;a.download=`studymate-backup-${dateKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
    toast('Workspace backup downloaded.');
  }
  document.addEventListener('click',ev=>{
    const el=ev.target.closest('[data-action],[data-view]');if(!el)return;
    if(el.dataset.action==='close-backdrop'){if(ev.target===el)closeModal();return;}
    if(el.dataset.view){navigate(el.dataset.view);return;}
    const act=el.dataset.action,id=el.dataset.id;
    switch(act){
      case 'toggle-sidebar':$('#sidebar').classList.toggle('open');$('#mobileShade').classList.toggle('open');break;
      case 'close-sidebar':$('#sidebar').classList.remove('open');$('#mobileShade').classList.remove('open');break;
      case 'close-modal':closeModal();break;
      case 'new-course':openNewCourse();break;
      case 'new-task':openNewTask(el.dataset.date||'');break;
      case 'new-topic':openNewTopic();break;
      case 'edit-profile':openProfile();break;
      case 'edit-availability':openAvailability(el.dataset.day);break;
      case 'replan-all':selectedReplanId=null;openReplan();break;
      case 'replan':selectedReplanId=id;openReplan(id);break;
      case 'schedule':openSchedule(id);break;
      case 'apply-slot':{const t=taskById(id);if(t)replanTask(t,el.dataset.at);break;}
      case 'auto-plan':doAutoPlan();break;
      case 'task-details':showTaskDetails(id);break;
      case 'focus':openFocus(id);break;
      case 'focus-toggle':if(focus){focus.running=!focus.running;el.innerHTML=focus.running?`${icon('pause')} Pause`:`${icon('play')} Resume`;}break;
      case 'complete':markComplete(id);break;
      case 'missed':markMissed(id);break;
      case 'reopen':{const t=taskById(id);if(t){t.status='planned';delete t.completedAt;save();closeModal();render();toast('Task reopened.');}break;}
      case 'delete-task':{const t=taskById(id);if(t&&confirm(`Delete "${t.title}"?`)){state.tasks=state.tasks.filter(x=>x.id!==id);save();closeModal();render();toast('Task deleted.');}break;}
      case 'delete-course':{const c=course(id);if(c&&confirm(`Delete "${c.name}" and all its study tasks and topics? This cannot be undone.`)){state.courses=state.courses.filter(x=>x.id!==id);state.tasks=state.tasks.filter(x=>x.courseId!==id);state.topics=state.topics.filter(x=>x.courseId!==id);selectedCourse='all';save();render();toast('Course and related data deleted.');}break;}
      case 'filter-course':selectedCourse=id;navigate('courses');break;
      case 'confidence':{const topic=topicById(id);if(topic&&['strong','developing','review'].includes(el.dataset.value)){topic.confidence=el.dataset.value;topic.reviewAt=dayOffset(dateKey(new Date()),topic.confidence==='strong'?7:topic.confidence==='developing'?3:0);save();render();toast('Topic confidence updated.');}break;}
      case 'schedule-review':{const topic=topicById(id);if(!topic)return;const deadline=topic.reviewAt<dateKey(new Date())?dayOffset(dateKey(new Date()),3):topic.reviewAt;const t={id:uid(),courseId:topic.courseId,title:`Review: ${topic.name}`,minutes:30,deadline,scheduledAt:null,status:'planned',type:'Revision'};const slot=findSlots(t,1)[0];t.scheduledAt=slot||null;state.tasks.push(t);save();navigate('courses');toast(slot?'Review session created and scheduled.':'Review task created, but no free slot was found.');break;}
      case 'week-prev':selectedWeek=dayOffset(selectedWeek,-7);render();break;
      case 'week-next':selectedWeek=dayOffset(selectedWeek,7);render();break;
      case 'reset-demo':if(confirm('Reset StudyMate? All locally saved changes will be replaced with sample data.')){state=demoData();selectedWeek=startOfWeek(dateKey(new Date()));selectedCourse='all';save();navigate('today');toast('Sample workspace restored.');}break;
      case 'export':exportData();break;
    }
  });
  document.addEventListener('change',ev=>{
    if(ev.target.matches('[data-placement-select]')){
      const fields=$('#manualFields');if(fields)fields.hidden=ev.target.value!=='manual';
    }
  });
  document.addEventListener('submit',ev=>{
    const form=ev.target.closest('form[data-form]');if(!form)return;
    ev.preventDefault();
    const f=new FormData(form),text=k=>String(f.get(k)||'').trim();
    try{
      switch(form.dataset.form){
        case 'course':{
          const name=text('name'),code=text('code').toUpperCase(),color=text('color');
          if(name.length<2||!code){toast('Enter a course name and code.',true);return;}
          if(state.courses.some(c=>c.code.toUpperCase()===code)){toast('This course code is already used.',true);return;}
          state.courses.push({id:uid(),name,code,color:COLORS.some(c=>c.color===color)?color:COLORS[0].color});save();closeModal();render();toast('Course added. Now create your first task.');break;
        }
        case 'task':{
          const title=text('title'),courseId=text('courseId'),type=text('type'),minutes=Number(f.get('minutes')),deadline=text('deadline'),placement=text('placement');
          if(title.length<2||!course(courseId)){toast('Enter a valid task and course.',true);return;}
          if(!Number.isInteger(minutes)||minutes<15||minutes>480){toast('Effort must be between 15 and 480 minutes.',true);return;}
          if(!/^\d{4}-\d{2}-\d{2}$/.test(deadline)||deadline<dateKey(new Date())){toast('Choose today or a future deadline.',true);return;}
          const t={id:uid(),title,courseId,type,minutes,deadline,scheduledAt:null,status:'planned'};
          if(placement==='manual'){
            const proposed=dateTime(text('scheduleDate'),text('scheduleTime'));
            const error=placementError(t,proposed);if(error){toast(error,true);return;}
            t.scheduledAt=proposed;
          }else if(placement==='auto'){t.scheduledAt=findSlots(t,1)[0]||null;}
          state.tasks.push(t);save();closeModal();render();toast(t.scheduledAt?'Task created and assigned a free study slot.':'Task saved without a slot. Adjust availability or use Auto-plan.');break;
        }
        case 'topic':{
          const name=text('name'),courseId=text('courseId'),confidence=text('confidence'),reviewAt=text('reviewAt');
          if(name.length<2||!course(courseId)||!['strong','developing','review'].includes(confidence)||!reviewAt){toast('Complete the topic details.',true);return;}
          state.topics.push({id:uid(),name,courseId,confidence,reviewAt});save();closeModal();render();toast('Topic added to your mastery tracker.');break;
        }
        case 'availability':{
          const windows=[];
          for(const n of [1,2]){
            const start=text(`start${n}`),end=text(`end${n}`);
            if(!start&&!end)continue;
            if(!start||!end||timeMins(start)>=timeMins(end)){toast(`Window ${n} must have a valid start and end time.`,true);return;}
            windows.push({start,end});
          }
          windows.sort((a,b)=>a.start.localeCompare(b.start));
          if(windows.length===2&&timeMins(windows[0].end)>timeMins(windows[1].start)){toast('Your study windows cannot overlap.',true);return;}
          state.availability[Number(form.dataset.day)]=windows;save();closeModal();render();toast('Available study hours updated.');break;
        }
        case 'profile':{
          const name=text('name');if(!name){toast('Please enter your name.',true);return;}
          state.profile.name=name;save();closeModal();render();toast('Profile updated.');break;
        }
        case 'manual-plan':{
          const t=taskById(form.dataset.id);if(!t)return;
          replanTask(t,dateTime(text('day'),text('time')));break;
        }
      }
    }catch(error){console.error('StudyMate form error:',error);toast('We could not save that change. Please check your inputs.',true);}
  });
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeModal();});
  save();
  render();
})();
