const SHEET_CSV = {
  Vocab:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1246786786&single=true&output=csv',
  GrMatch: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=477155350&single=true&output=csv',
  GrFill:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=97078008&single=true&output=csv'
};
const TOTAL = 10;
let questions = {}, current = [];

document.getElementById('start').onclick = async () => {
  const mode = document.getElementById('mode').value;
  if (!questions[mode]) {
    const res = await fetch(SHEET_CSV[mode]);
    const text = await res.text();
    questions[mode] = parseCSV(text, mode);
  }
  current = shuffle(questions[mode]).slice(0, TOTAL);
  window.quizState = { mode, idx: 0, score: 0 };
  showQuestion();
};

function showQuestion() {
  const { mode, idx, score } = window.quizState;
  const container = document.getElementById('quiz-container');
  const nextBtn = document.getElementById('next');
  container.innerHTML = '';
  nextBtn.classList.add('hidden');
  if (idx >= TOTAL) {
    container.innerHTML = `<h2>🎉 分數：${score}/${TOTAL}</h2>`;
    return;
  }

  const q = current[idx];
  let promptHTML = '';
  if (mode === 'Vocab') {
    promptHTML = `<strong>${q[0]}</strong>`;
  } else if (mode === 'GrMatch') {
    promptHTML = `<strong>${q[0]}</strong><p><small>${q[2]||''}</small></p>`;
  } else {
    promptHTML = `<p>${q[0].replace(/___/,'<strong>___</strong>')}</p>`;
  }

  // 建立題目卡片
  container.innerHTML = `<div class="card prompt">${promptHTML}</div>`;
  
  // 建立選項容器
  buildChoices(mode, q, container);
}

function buildChoices(mode, q, container) {
  // 產生選項：正解 + 3 干擾
  const pool = current.map(r=> (mode==='GrFill'? r[2]: r[1]) );
  const correct = mode==='GrFill'? q[2]: q[1];
  const opts = shuffle([correct, ...sample(pool,3)]);
  
  // 建立選項容器
  const choicesContainer = document.createElement('div');
  choicesContainer.className = 'choices';
  
  opts.forEach(opt=>{
    const div = document.createElement('div');
    div.textContent = opt;
    div.className = 'choice';
    div.onclick = () => choose(opt===correct, div);
    choicesContainer.appendChild(div);
  });
  
  container.appendChild(choicesContainer);
}

function choose(isCorrect, el) {
  el.classList.add(isCorrect?'correct':'wrong');
  document.querySelectorAll('.choice').forEach(c=>c.onclick=null);
  if (isCorrect) window.quizState.score++;
  document.getElementById('next').classList.remove('hidden');
}

document.getElementById('next').onclick = () => {
  window.quizState.idx++;
  showQuestion();
}

// —— 工具函式 ——
const shuffle = arr => arr.sort(()=>Math.random()-0.5);
const sample = (arr, n) => shuffle([...new Set(arr)]).slice(0,n);

/**  
 * 簡易 CSV 解析，回傳二維陣列  
 * mode 控制每行要幾個欄位 (ignore header)  
 */
function parseCSV(text, mode) {
  return text.trim()
    .split('\n').slice(1)
    .map(line=> {
      const parts = line.split(',');
      if (mode==='Vocab')   return [parts[0], parts[1], parts[2]];
      if (mode==='GrMatch') return [parts[0], parts[1], parts[2]];
      if (mode==='GrFill')  return [parts[0], parts[1], parts[2]];
    });
}
