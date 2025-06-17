const SHEET_CSV = {
  Vocab:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=191931963&single=true&output=csv',
  Vocab_politics: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=836666397&single=true&output=csv',
  Vocab_economy: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=2040366335&single=true&output=csv',
  Vocab_Laws: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=190603581&single=true&output=csv',
  Vocab_health: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=220584476&single=true&output=csv',
  Vocab_phycology: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1398920549&single=true&output=csv',
  Vocab_life: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1458245094&single=true&output=csv',
  Vocab2:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1246786786&single=true&output=csv',
  GrMatch: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=477155350&single=true&output=csv',
  GrFill:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=97078008&single=true&output=csv'
};
const TOTAL = 10;
const ITEMS_PER_PAGE = 30;
let questions = {}, current = [], vocabData = [];

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mode').addEventListener('change', (e) => {
    const mode = e.target.value;
    const quizOptions = document.getElementById('quiz-options');
    const learnOptions = document.getElementById('learn-options');
  
    if (mode === 'learn') {
      quizOptions.classList.add('hidden');
      learnOptions.classList.remove('hidden');
    } else { // quiz
      quizOptions.classList.remove('hidden');
      learnOptions.classList.add('hidden');
    }
  });
  
  document.getElementById('start').onclick = async () => {
    const mainMode = document.getElementById('mode').value;
    
    // Clear previous content
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('pagination-container').innerHTML = '';
    document.getElementById('next').classList.add('hidden');
  
    if (mainMode === 'learn') {
      const category = document.getElementById('learn-category').value;
      if (!questions[category]) {
        const res = await fetch(SHEET_CSV[category]);
        const text = await res.text();
        questions[category] = parseCSV(text, category);
      }
      vocabData = questions[category];
      displayVocabLearnPage(1); // Display first page
    } else { // 'quiz' mode
      const quizType = document.getElementById('quiz-type').value;
      if (!questions[quizType]) {
        const res = await fetch(SHEET_CSV[quizType]);
        const text = await res.text();
        questions[quizType] = parseCSV(text, quizType);
      }
      
      current = shuffle(questions[quizType]).slice(0, TOTAL);
      window.quizState = { mode: quizType, idx: 0, score: 0, selectedChoice: null, answered: false };
      showQuestion();
    }
  };
  
  document.getElementById('next').onclick = () => {
    window.quizState.idx++;
    showQuestion();
  }
});

function displayVocabLearnPage(page) {
  const container = document.getElementById('quiz-container');
  const paginationContainer = document.getElementById('pagination-container');
  container.innerHTML = '';
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(vocabData.length / ITEMS_PER_PAGE);
  page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = vocabData.slice(start, end);

  const categoryDropdown = document.getElementById('learn-category');
  const selectedCategoryName = categoryDropdown.options[categoryDropdown.selectedIndex].text;

  let tableHTML = `
    <div class="vocab-table-container">
      <h2>📚 單字學習表 (${selectedCategoryName})</h2>
      <div class="vocab-table">
        <div class="table-header">
          <div class="table-cell header">漢字</div>
          <div class="table-cell header">平假名</div>
          <div class="table-cell header">詞義</div>
        </div>
  `;
  
  pageData.forEach((row, index) => {
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
  
  // Render Pagination
  if (totalPages <= 1) return;

  // Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '上一頁';
  prevBtn.className = 'pagination-btn';
  if (page === 1) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.onclick = () => displayVocabLearnPage(page - 1);
  }
  paginationContainer.appendChild(prevBtn);

  // Page numbers info
  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `第 ${page} / ${totalPages} 頁`;
  pageIndicator.className = 'pagination-info'; // You can style this
  paginationContainer.appendChild(pageIndicator);
  
  // Next Button
  const paginationNextBtn = document.createElement('button');
  paginationNextBtn.textContent = '下一頁';
  paginationNextBtn.className = 'pagination-btn';
  if (page === totalPages) {
    paginationNextBtn.classList.add('disabled');
  } else {
    paginationNextBtn.onclick = () => displayVocabLearnPage(page + 1);
  }
  paginationContainer.appendChild(paginationNextBtn);
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
    // Also clear pagination if it exists
    document.getElementById('pagination-container').innerHTML = '';
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
      if (mode.startsWith('Vocab_'))  return [parts[0] || '', parts[1] || '', parts[2] || '']; // 3個欄位
      if (mode==='GrMatch') return [parts[0], parts[1], parts[2]];
      if (mode==='GrFill')  return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]]; // 7個欄位
    });
}
