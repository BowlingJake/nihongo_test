const SHEET_CSV = {
  Vocab:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=191931963&single=true&output=csv',
  Vocab2:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1246786786&single=true&output=csv',
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
  
  if (mode === 'Vocab2') {
    // 單字學習模式：顯示完整表格
    showVocabTable(questions[mode]);
  } else {
    // 測驗模式
    current = shuffle(questions[mode]).slice(0, TOTAL);
    window.quizState = { mode, idx: 0, score: 0, selectedChoice: null, answered: false };
    showQuestion();
  }
};

function showVocabTable(data) {
  const container = document.getElementById('quiz-container');
  const nextBtn = document.getElementById('next');
  
  // 隱藏下一題按鈕
  nextBtn.classList.add('hidden');
  
  // 創建表格HTML
  let tableHTML = `
    <div class="vocab-table-container">
      <h2>📚 單字學習表</h2>
      <div class="vocab-table">
        <div class="table-header">
          <div class="table-cell header">漢字</div>
          <div class="table-cell header">平假名</div>
          <div class="table-cell header">詞義</div>
        </div>
  `;
  
  // 添加每一行數據
  data.forEach((row, index) => {
    tableHTML += `
      <div class="table-row ${index % 2 === 0 ? 'even' : 'odd'}">
        <div class="table-cell kanji">${row[0] || ''}</div>
        <div class="table-cell hiragana">${row[1] || ''}</div>
        <div class="table-cell meaning">${row[2] || ''}</div>
      </div>
    `;
  });
  
  tableHTML += `
      </div>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

function showQuestion() {
  const { mode, idx, score } = window.quizState;
  const container = document.getElementById('quiz-container');
  const nextBtn = document.getElementById('next');
  container.innerHTML = '';
  nextBtn.classList.add('hidden');
  
  // 重置答題狀態
  window.quizState.selectedChoice = null;
  window.quizState.answered = false;
  
  if (idx >= TOTAL) {
    container.innerHTML = `<h2>🎉 分數：${score}/${TOTAL}</h2>`;
    return;
  }

  const q = current[idx];
  let promptHTML = '';
  if (mode === 'Vocab') {
    // 只顯示詞彙本身（A欄）
    promptHTML = `<strong>${q[0]}</strong>`;
  } else if (mode === 'GrMatch') {
    promptHTML = `<strong>${q[0]}</strong><p><small>${q[2]||''}</small></p>`;
  } else if (mode === 'GrFill') {
    // 顯示題目（A欄），保留原本的___替換邏輯
    promptHTML = `<p>${q[0].replace(/___/,'<strong>___</strong>')}</p>`;
  }

  // 建立題目卡片
  container.innerHTML = `<div class="card prompt">${promptHTML}</div>`;
  
  // 建立選項容器
  buildChoices(mode, q, container);
  
  // 新增回答按鈕
  const answerBtn = document.createElement('button');
  answerBtn.id = 'answer';
  answerBtn.textContent = '回答';
  answerBtn.className = 'answer-btn hidden';
  answerBtn.onclick = () => showAnswer();
  container.appendChild(answerBtn);
}

function buildChoices(mode, q, container) {
  if (mode === 'Vocab') {
    // 新的單字模式：使用C、D、E、F欄作為四個選項
    const options = [
      { text: q[2], index: 1 }, // C欄 = 選項1
      { text: q[3], index: 2 }, // D欄 = 選項2  
      { text: q[4], index: 3 }, // E欄 = 選項3
      { text: q[5], index: 4 }  // F欄 = 選項4
    ];
    
    console.log('四個選項:', options);
    console.log('正確答案編號 (G欄):', q[6]);
    
    // 建立選項容器
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'choices';
    
    // 正確答案編號來自G欄
    const correctAnswerIndex = parseInt(q[6]);
    
    // 為每個選項創建獨立的方塊
    options.forEach(option => {
      const div = document.createElement('div');
      div.textContent = option.text;
      div.className = 'choice';
      div.dataset.value = option.text;
      div.dataset.isCorrect = (option.index === correctAnswerIndex).toString();
      div.onclick = () => selectChoice(div);
      choicesContainer.appendChild(div);
    });
    
    container.appendChild(choicesContainer);
  } else if (mode === 'GrFill') {
    // 文法填空模式：使用B、C、D、E欄作為四個選項
    const options = [
      { text: q[1], index: 1 }, // B欄 = 選項1
      { text: q[2], index: 2 }, // C欄 = 選項2  
      { text: q[3], index: 3 }, // D欄 = 選項3
      { text: q[4], index: 4 }  // E欄 = 選項4
    ];
    
    console.log('GrFill四個選項:', options);
    console.log('GrFill正確答案編號 (F欄):', q[5]);
    console.log('GrFill詳細解答 (G欄):', q[6]);
    
    // 建立選項容器
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'choices';
    
    // 正確答案編號來自F欄
    const correctAnswerIndex = parseInt(q[5]);
    
    // 為每個選項創建獨立的方塊
    options.forEach(option => {
      const div = document.createElement('div');
      div.textContent = option.text;
      div.className = 'choice';
      div.dataset.value = option.text;
      div.dataset.isCorrect = (option.index === correctAnswerIndex).toString();
      div.onclick = () => selectChoice(div);
      choicesContainer.appendChild(div);
    });
    
    container.appendChild(choicesContainer);
  } else {
    // 其他模式（GrMatch）保持原來的邏輯
    const pool = current.map(r=> r[1] );
    const correct = q[1];
    const opts = shuffle([correct, ...sample(pool,3)]);
    
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'choices';
    
    opts.forEach(opt=>{
      const div = document.createElement('div');
      div.textContent = opt;
      div.className = 'choice';
      div.dataset.value = opt;
      div.dataset.isCorrect = (opt === correct).toString();
      div.onclick = () => selectChoice(div);
      choicesContainer.appendChild(div);
    });
    
    container.appendChild(choicesContainer);
  }
}

function selectChoice(selectedElement) {
  // 如果已經回答過，不允許重新選擇
  if (window.quizState.answered) return;
  
  // 移除所有選項的選中狀態
  document.querySelectorAll('.choice').forEach(choice => {
    choice.classList.remove('selected');
  });
  
  // 設定新的選中狀態
  selectedElement.classList.add('selected');
  window.quizState.selectedChoice = selectedElement;
  
  // 顯示回答按鈕
  document.getElementById('answer').classList.remove('hidden');
}

function showAnswer() {
  if (!window.quizState.selectedChoice || window.quizState.answered) return;
  
  window.quizState.answered = true;
  const selectedChoice = window.quizState.selectedChoice;
  const { mode, idx } = window.quizState;
  const q = current[idx];
  
  // 找到正確答案
  const choices = document.querySelectorAll('.choice');
  choices.forEach(choice => {
    const isCorrect = choice.dataset.isCorrect === 'true';
    const isSelected = choice === selectedChoice;
    
    if (isCorrect) {
      // 正確答案顯示綠色打勾
      choice.classList.add('correct');
      choice.innerHTML = choice.textContent + ' <span class="check-mark">✓</span>';
    } else if (isSelected) {
      // 選錯的答案顯示紅色叉叉
      choice.classList.add('wrong');
      choice.innerHTML = choice.textContent + ' <span class="cross-mark">✗</span>';
    }
    
    // 禁用點擊
    choice.onclick = null;
  });
  
  // 檢查答案是否正確
  const isCorrect = selectedChoice.dataset.isCorrect === 'true';
  if (isCorrect) {
    window.quizState.score++;
  }
  
  // 如果是GrFill模式，顯示詳細解答
  if (mode === 'GrFill') {
    const detailAnswer = q[6]; // G欄是詳細解答
    const container = document.getElementById('quiz-container');
    
    // 創建詳細解答區域
    const detailDiv = document.createElement('div');
    detailDiv.className = 'detail-answer';
    detailDiv.innerHTML = `
      <div class="detail-title">詳細解答：</div>
      <div class="detail-content">${detailAnswer}</div>
    `;
    container.appendChild(detailDiv);
  }
  
  // 隱藏回答按鈕，顯示下一題按鈕
  document.getElementById('answer').classList.add('hidden');
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
      if (mode==='Vocab')   return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]]; // 7個欄位
      if (mode==='Vocab2')  return [parts[0], parts[1], parts[2]]; // 3個欄位：漢字、平假名、詞義
      if (mode==='GrMatch') return [parts[0], parts[1], parts[2]];
      if (mode==='GrFill')  return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]]; // 7個欄位
    });
}
