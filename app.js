const SHEET_CSV = {
  Vocab:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=191931963&single=true&output=csv',
  Vocab_politics: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=836666397&single=true&output=csv',
  Vocab_economy: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=2040366335&single=true&output=csv',
  Vocab_Laws: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=190603581&single=true&output=csv',
  Vocab_health: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=220584476&single=true&output=csv',
  Vocab_phycology: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1398920549&single=true&output=csv',
  Vocab_life: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1458245094&single=true&output=csv',
  Vocab2:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=1246786786&single=true&output=csv',
  Grammar: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=477155350&single=true&output=csv',
  GrammarFill:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKgM8Hm8JC7EonaBhUU_RGcU2EsFOmUXdhHjwUS4Syu8ORdFF3v_tWMWMdeksce8P53fJ5zSHOjUx3/pub?gid=97078008&single=true&output=csv'
};
const TOTAL = 10;
const ITEMS_PER_PAGE = 30;
let questions = {}, current = [], vocabData = [];

document.addEventListener('DOMContentLoaded', () => {
  // 處理主類型選擇（文法/單字）
  document.getElementById('subject-type').addEventListener('change', (e) => {
    const subjectType = e.target.value;
    const grammarOptions = document.getElementById('grammar-options');
    const vocabOptions = document.getElementById('vocab-options');
    const vocabCategoryOptions = document.getElementById('vocab-category-options');
  
    // 清空之前的內容
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('pagination-container').innerHTML = '';
    
    // 重置布局class
    document.body.classList.remove('grammar-wide-layout');
    
    // 隱藏所有選項並重置選擇
    grammarOptions.classList.add('hidden');
    vocabOptions.classList.add('hidden');
    vocabCategoryOptions.classList.add('hidden');
    
    // 重置選擇器的值
    document.getElementById('grammar-mode').value = 'Grammar';
    document.getElementById('vocab-mode').value = 'learn';
    document.getElementById('vocab-category').value = 'Vocab_politics';
    
    if (subjectType === 'grammar') {
      // 文法模式：只顯示文法選項，確保不顯示任何單字相關選項
      grammarOptions.classList.remove('hidden');
    } else if (subjectType === 'vocab') {
      // 單字模式：顯示單字模式選項
      vocabOptions.classList.remove('hidden');
    }
  });

  // 處理單字模式選擇
  document.getElementById('vocab-mode').addEventListener('change', (e) => {
    const vocabMode = e.target.value;
    const vocabCategoryOptions = document.getElementById('vocab-category-options');
    
    // 確保只在單字模式且有選擇時才顯示領域選項
    if (vocabMode && document.getElementById('subject-type').value === 'vocab') {
      vocabCategoryOptions.classList.remove('hidden');
    } else {
      vocabCategoryOptions.classList.add('hidden');
    }
  });
  
  document.getElementById('start').onclick = async () => {
    const subjectType = document.getElementById('subject-type').value;
    
    if (!subjectType) {
      alert('請先選擇文法或單字類型！');
      return;
    }
    
    // Clear previous content
    document.getElementById('quiz-container').innerHTML = '';
    document.getElementById('pagination-container').innerHTML = '';
    document.getElementById('next').classList.add('hidden');
    
    // 重置布局class
    document.body.classList.remove('grammar-wide-layout');
  
    if (subjectType === 'grammar') {
      // 文法模式
      const grammarMode = document.getElementById('grammar-mode').value;
      if (!grammarMode) {
        alert('請選擇文法模式！');
        return;
      }
      
      if (!questions[grammarMode]) {
        const res = await fetch(SHEET_CSV[grammarMode]);
        const text = await res.text();
        questions[grammarMode] = parseCSV(text, grammarMode);
      }
      
      if (grammarMode === 'Grammar') {
        // 文法學習頁面
        vocabData = questions[grammarMode];
        displayVocabLearnPage(1, false); // 文法不使用隱藏模式
      } else if (grammarMode === 'GrammarFill') {
        // 文法測驗翻頁模式
        vocabData = questions[grammarMode];
        displayGrammarQuizPage(1);
      }
    } else if (subjectType === 'vocab') {
      // 單字模式
      const vocabMode = document.getElementById('vocab-mode').value;
      const vocabCategory = document.getElementById('vocab-category').value;
      
      if (!vocabMode) {
        alert('請選擇單字模式！');
        return;
      }
      if (!vocabCategory) {
        alert('請選擇學習領域！');
        return;
      }
      
      if (!questions[vocabCategory]) {
        const res = await fetch(SHEET_CSV[vocabCategory]);
        const text = await res.text();
        questions[vocabCategory] = parseCSV(text, vocabCategory);
      }
      
      if (vocabMode === 'learn') {
        // 單字學習頁面
        vocabData = questions[vocabCategory];
        displayVocabLearnPage(1, false); // 正常模式
      } else if (vocabMode === 'learn-hidden') {
        // 單字學習頁面（隱藏讀音）
        vocabData = questions[vocabCategory];
        displayVocabLearnPage(1, true); // 隱藏讀音模式
      } else {
        // 單字測驗
        current = shuffle(questions[vocabCategory]).slice(0, TOTAL);
        window.quizState = { mode: vocabCategory, idx: 0, score: 0, selectedChoice: null, answered: false };
        showQuestion();
      }
    }
  };
  
  document.getElementById('next').onclick = () => {
    window.quizState.idx++;
    showQuestion();
  }
});

function displayVocabLearnPage(page, hiddenMode = false) {
  const container = document.getElementById('quiz-container');
  const paginationContainer = document.getElementById('pagination-container');
  container.innerHTML = '';
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(vocabData.length / ITEMS_PER_PAGE);
  page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = vocabData.slice(start, end);

  // 判斷是否為文法學習模式
  const subjectType = document.getElementById('subject-type').value;
  const isGrammarMode = subjectType === 'grammar';

  let selectedCategoryName = '';
  if (isGrammarMode) {
    selectedCategoryName = '文法';
  } else {
    const categoryDropdown = document.getElementById('vocab-category');
    selectedCategoryName = categoryDropdown.options[categoryDropdown.selectedIndex].text;
  }

  let tableHTML = '';
  if (isGrammarMode) {
    // 設定文法學習模式的寬版布局
    document.body.classList.add('grammar-wide-layout');
    
    // 文法學習表格
    tableHTML = `
      <div class="vocab-table-container">
        <h2>📚 文法學習表 (${selectedCategoryName})</h2>
        <div class="grammar-horizontal-table">
          <div class="table-header">
            <div class="table-cell header pattern-col">文法句型</div>
            <div class="table-cell header description-col">中文說明</div>
            <div class="table-cell header example-col">例句</div>
            <div class="table-cell header meaning-col">例句中文</div>
            <div class="table-cell header action-col">操作</div>
          </div>
    `;
    
    pageData.forEach((row, index) => {
      const hasExtraInfo = (row[4] && row[4].trim()) || (row[5] && row[5].trim()) || (row[6] && row[6].trim()) || (row[7] && row[7].trim());
      tableHTML += `
        <div class="table-row ${index % 2 === 0 ? 'even' : 'odd'}" data-row-index="${index}">
          <div class="table-cell grammar-pattern pattern-col">${row[0] || ''}</div>
          <div class="table-cell grammar-description description-col">${row[1] || ''}</div>
          <div class="table-cell grammar-example example-col">${row[2] || ''}</div>
          <div class="table-cell grammar-meaning meaning-col">${row[3] || ''}</div>
          <div class="table-cell grammar-action action-col">
            ${hasExtraInfo ? `<button class="expand-btn" onclick="toggleGrammarDetails(${index})">📖 詳細</button>` : '<span class="no-extra">—</span>'}
          </div>
        </div>
        ${hasExtraInfo ? `
        <div class="grammar-detail-row hidden" data-row-index="${index}">
          <div class="grammar-detail-content">
            ${row[4] && row[4].trim() ? `<div class="detail-section connection"><strong>🔗 接續方式：</strong><br>${row[4]}</div>` : ''}
            ${row[5] && row[5].trim() ? `<div class="detail-section nuance"><strong>🎯 核心語感：</strong><br>${row[5]}</div>` : ''}
            ${row[6] && row[6].trim() ? `<div class="detail-section etymology"><strong>📚 語源解析：</strong><br>${row[6]}</div>` : ''}
            ${row[7] && row[7].trim() ? `<div class="detail-section comparison"><strong>⚖️ 比較：</strong><br>${row[7]}</div>` : ''}
          </div>
        </div>
        ` : ''}
      `;
    });
  } else {
    // 移除文法學習模式的寬版布局class
    document.body.classList.remove('grammar-wide-layout');
    
    // 單字學習表格
    const modeText = hiddenMode ? '（隱藏讀音模式）' : '';
    tableHTML = `
      <div class="vocab-table-container">
        <h2>📚 單字學習表 (${selectedCategoryName}) ${modeText}</h2>
        <div class="vocab-table">
          <div class="table-header">
            <div class="table-cell header">漢字</div>
            <div class="table-cell header">平假名</div>
            <div class="table-cell header">詞義</div>
          </div>
    `;
    
    pageData.forEach((row, index) => {
      const hiraganaClass = hiddenMode ? 'hiragana hidden-reading' : 'hiragana';
      const kanjiClass = hiddenMode ? 'kanji clickable-kanji' : 'kanji';
      
      tableHTML += `
        <div class="table-row ${index % 2 === 0 ? 'even' : 'odd'}">
          <div class="table-cell ${kanjiClass}" ${hiddenMode ? 'onclick="toggleReading(this)"' : ''}>${row[0] || ''}</div>
          <div class="table-cell ${hiraganaClass}">${row[1] || ''}</div>
          <div class="table-cell meaning">${row[2] || ''}</div>
        </div>
      `;
    });
  }
  
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
    prevBtn.onclick = () => displayVocabLearnPage(page - 1, hiddenMode);
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
    paginationNextBtn.onclick = () => displayVocabLearnPage(page + 1, hiddenMode);
  }
  paginationContainer.appendChild(paginationNextBtn);
}

function displayGrammarQuizPage(page) {
  const container = document.getElementById('quiz-container');
  const paginationContainer = document.getElementById('pagination-container');
  container.innerHTML = '';
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(vocabData.length / ITEMS_PER_PAGE);
  page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = vocabData.slice(start, end);

  // 建立文法測驗頁面
  let quizHTML = `
    <div class="grammar-quiz-container">
      <h2>📝 文法測驗 (第 ${page} / ${totalPages} 頁)</h2>
      <div class="quiz-questions">
  `;
  
  pageData.forEach((row, index) => {
    const questionNum = start + index + 1;
    // A欄：題目，B-E欄：選項，F欄：正確答案編號，G欄：詳細解答
    const options = [
      { text: row[1], index: 1 }, // B欄 = 選項1
      { text: row[2], index: 2 }, // C欄 = 選項2  
      { text: row[3], index: 3 }, // D欄 = 選項3
      { text: row[4], index: 4 }  // E欄 = 選項4
    ];
    const correctIndex = parseInt(row[5]);
    
    quizHTML += `
      <div class="quiz-question" data-question="${questionNum - 1}">
        <div class="question-header">
          <span class="question-number">第 ${questionNum} 題</span>
        </div>
        <div class="question-text">${row[0].replace(/___/,'<strong>___</strong>')}</div>
        <div class="question-choices">
    `;
    
    options.forEach((option, optIndex) => {
      quizHTML += `
        <div class="quiz-choice" 
             data-question="${questionNum - 1}" 
             data-option="${optIndex + 1}"
             data-is-correct="${option.index === correctIndex}">
          ${optIndex + 1}. ${option.text}
        </div>
      `;
    });
    
    quizHTML += `
        </div>
        <div class="question-detail hidden" data-question="${questionNum - 1}">
          <div class="detail-title">詳細解答：</div>
          <div class="detail-content">${row[6] || ''}</div>
        </div>
      </div>
    `;
  });
  
  quizHTML += `
      </div>
      <div class="quiz-controls">
        <button id="check-answers" class="answer-btn">檢查答案</button>
        <button id="show-details" class="answer-btn hidden">顯示詳解</button>
      </div>
    </div>
  `;
  
  container.innerHTML = quizHTML;
  
  // 添加選擇事件監聽器
  document.querySelectorAll('.quiz-choice').forEach(choice => {
    choice.addEventListener('click', function() {
      const questionNum = this.dataset.question;
      // 取消同一題目的其他選項
      document.querySelectorAll(`.quiz-choice[data-question="${questionNum}"]`).forEach(c => {
        c.classList.remove('selected');
      });
      // 選中當前選項
      this.classList.add('selected');
    });
  });
  
  // 檢查答案按鈕
  document.getElementById('check-answers').addEventListener('click', function() {
    checkGrammarQuizAnswers();
    this.classList.add('hidden');
    document.getElementById('show-details').classList.remove('hidden');
  });
  
  // 顯示詳解按鈕
  document.getElementById('show-details').addEventListener('click', function() {
    document.querySelectorAll('.question-detail').forEach(detail => {
      detail.classList.remove('hidden');
    });
    this.classList.add('hidden');
  });
  
  // Render Pagination
  if (totalPages <= 1) return;

  // Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '上一頁';
  prevBtn.className = 'pagination-btn';
  if (page === 1) {
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.onclick = () => displayGrammarQuizPage(page - 1);
  }
  paginationContainer.appendChild(prevBtn);

  // Page numbers info
  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `第 ${page} / ${totalPages} 頁`;
  pageIndicator.className = 'pagination-info';
  paginationContainer.appendChild(pageIndicator);
  
  // Next Button
  const paginationNextBtn = document.createElement('button');
  paginationNextBtn.textContent = '下一頁';
  paginationNextBtn.className = 'pagination-btn';
  if (page === totalPages) {
    paginationNextBtn.classList.add('disabled');
  } else {
    paginationNextBtn.onclick = () => displayGrammarQuizPage(page + 1);
  }
  paginationContainer.appendChild(paginationNextBtn);
}

function checkGrammarQuizAnswers() {
  let correct = 0;
  let total = 0;
  
  document.querySelectorAll('.quiz-question').forEach(question => {
    const questionNum = question.dataset.question;
    const selectedChoice = question.querySelector('.quiz-choice.selected');
    const correctChoice = question.querySelector('.quiz-choice[data-is-correct="true"]');
    
    total++;
    
    if (selectedChoice) {
      if (selectedChoice.dataset.isCorrect === 'true') {
        selectedChoice.classList.add('correct');
        selectedChoice.innerHTML += ' <span class="check-mark">✓</span>';
        correct++;
      } else {
        selectedChoice.classList.add('wrong');
        selectedChoice.innerHTML += ' <span class="cross-mark">✗</span>';
      }
    }
    
    // 顯示正確答案
    if (correctChoice && (!selectedChoice || selectedChoice !== correctChoice)) {
      correctChoice.classList.add('correct');
      correctChoice.innerHTML += ' <span class="check-mark">✓</span>';
    }
    
    // 禁用所有選項
    question.querySelectorAll('.quiz-choice').forEach(choice => {
      choice.style.pointerEvents = 'none';
    });
  });
  
  // 顯示分數
  const scoreDiv = document.createElement('div');
  scoreDiv.className = 'quiz-score';
  scoreDiv.innerHTML = `<h3>🎉 本頁分數：${correct}/${total}</h3>`;
  document.querySelector('.grammar-quiz-container').insertBefore(scoreDiv, document.querySelector('.quiz-controls'));
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
      if (mode==='Grammar') return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || '', parts[4] || '', parts[5] || '', parts[6] || '', parts[7] || '']; // 8個欄位：句型、中文說明、例句、例句中文、接續方式、核心語感、語源解析、比較
      if (mode==='GrMatch') return [parts[0], parts[1], parts[2]];
      if (mode==='GrFill')  return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]]; // 7個欄位
      if (mode==='GrammarFill') return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], parts[6]]; // 7個欄位
    });
}

// 隱藏讀音模式：點擊漢字顯示/隱藏平假名
function toggleReading(kanjiElement) {
  const row = kanjiElement.closest('.table-row');
  const hiraganaElement = row.querySelector('.hidden-reading');
  
  if (hiraganaElement.classList.contains('hidden-reading')) {
    hiraganaElement.classList.remove('hidden-reading');
    hiraganaElement.classList.add('shown-reading');
    kanjiElement.classList.add('clicked');
  } else if (hiraganaElement.classList.contains('shown-reading')) {
    hiraganaElement.classList.remove('shown-reading');
    hiraganaElement.classList.add('hidden-reading');
    kanjiElement.classList.remove('clicked');
  }
}

// 文法詳細資訊展開/收合功能
function toggleGrammarDetails(rowIndex) {
  const detailRow = document.querySelector(`.grammar-detail-row[data-row-index="${rowIndex}"]`);
  const expandBtn = document.querySelector(`.table-row[data-row-index="${rowIndex}"] .expand-btn`);
  
  if (detailRow && expandBtn) {
    if (detailRow.classList.contains('hidden')) {
      // 展開詳細資訊
      detailRow.classList.remove('hidden');
      detailRow.classList.add('visible');
      expandBtn.innerHTML = '📖 收合';
      expandBtn.classList.add('expanded');
    } else {
      // 收合詳細資訊
      detailRow.classList.remove('visible');
      detailRow.classList.add('hidden');
      expandBtn.innerHTML = '📖 詳細';
      expandBtn.classList.remove('expanded');
    }
  }
}
