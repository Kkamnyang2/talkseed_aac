/**
 * AAC 앱 메인 로직
 */

console.log('🔄 app.js 파일 로드 시작...');

let currentCards = [];
let currentCategories = [];
let selectedCategory = 'all';
let editingCardId = null;

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TalkSeed AAC App Starting...');
    
    // AACStorage 확인
    console.log('📦 Checking AACAACStorage...', typeof AACStorage);
    if (typeof AACStorage === 'undefined') {
        console.error('❌ AACStorage not loaded!');
        alert('앱을 로드할 수 없습니다. 페이지를 새로고침해주세요.');
        return;
    }
    console.log('✅ AACStorage is loaded');
    
    // TTS 확인
    console.log('🔊 Checking TTS...', typeof TTS);
    if (typeof TTS === 'undefined') {
        console.error('❌ TTS not loaded!');
    } else {
        console.log('✅ TTS is loaded');
    }
    
    try {
        // 데이터 로드
        console.log('📂 Loading categories...');
        loadCategories();
        console.log('✅ Categories loaded:', currentCategories.length);
        
        console.log('📊 Loading cards...');
        loadCards();
        console.log('✅ Cards loaded:', currentCards.length);
        
        // 이벤트 리스너 등록
        console.log('🔗 Initializing event listeners...');
        initEventListeners();
        console.log('✅ Event listeners initialized');
        
        // 설정 로드
        console.log('⚙️ Loading settings...');
        loadSettings();
        console.log('✅ Settings loaded');
        
        // 자주 쓰는 문장 로드
        console.log('⭐ Loading favorite sentences...');
        loadFavoriteSentences();
        console.log('✅ Favorite sentences loaded');
        
        // 보조 단어 바 렌더링
        console.log('💬 Rendering auxiliary words bar...');
        renderAuxiliaryWordsBar();
        console.log('✅ Auxiliary words bar rendered');
        
        // 인포그래픽 선택 분류표 렌더링
        console.log('📊 Rendering quick select grid...');
        renderQuickSelectGrid();
        console.log('✅ Quick select grid rendered');
        
        console.log('✅ App initialized successfully');
        console.log('📊 Final state - Cards:', currentCards.length, 'Categories:', currentCategories.length);
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        console.error('Stack trace:', error.stack);
        alert('앱 초기화 중 오류가 발생했습니다: ' + error.message);
    }
});

/**
 * 이벤트 리스너 초기화
 */
function initEventListeners() {
    console.log('🔗 Attaching event listeners...');
    
    try {
        // 사이드바 토글
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
            console.log('✅ sidebar-toggle listener attached');
        } else {
            console.error('❌ sidebar-toggle element not found');
        }
        
        // 카드 추가 버튼
        const addCardBtn = document.getElementById('add-card-btn');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', openAddCardDialog);
            console.log('✅ add-card-btn listener attached');
        } else {
            console.error('❌ add-card-btn element not found');
        }
        
        // 설정 버튼
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', openSettingsDialog);
            console.log('✅ settings-btn listener attached');
        } else {
            console.error('❌ settings-btn element not found');
        }
        
        // 카테고리 관리 버튼
        const manageCategoriesBtn = document.getElementById('manage-categories-btn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', openCategoryDialog);
            console.log('✅ manage-categories-btn listener attached');
        } else {
            console.error('❌ manage-categories-btn element not found');
        }
        
        // 색상 선택 미리보기
        const cardColor = document.getElementById('card-color');
        if (cardColor) {
            cardColor.addEventListener('input', (e) => {
                document.getElementById('color-preview').style.backgroundColor = e.target.value;
            });
            console.log('✅ card-color listener attached');
        }
        
        // 설정 슬라이더
        const speechRate = document.getElementById('speech-rate');
        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                const rate = parseFloat(e.target.value);
                document.getElementById('rate-value').textContent = rate.toFixed(1) + 'x';
                TTS.setRate(rate);
            });
            console.log('✅ speech-rate listener attached');
        }
        
        const speechPitch = document.getElementById('speech-pitch');
        if (speechPitch) {
            speechPitch.addEventListener('input', (e) => {
                const pitch = parseFloat(e.target.value);
                document.getElementById('pitch-value').textContent = pitch.toFixed(1) + 'x';
                TTS.setPitch(pitch);
            });
            console.log('✅ speech-pitch listener attached');
        }
        
        console.log('✅ All event listeners attached successfully');
    } catch (error) {
        console.error('❌ Error attaching event listeners:', error);
        throw error;
    }
}

/**
 * 카테고리 로드 및 렌더링
 */
function loadCategories() {
    currentCategories = AACStorage.getCategories();
    renderSidebar();
    updateCategorySelect();
}

/**
 * 카드 로드 및 렌더링
 */
function loadCards() {
    currentCards = AACStorage.getCards();
    renderCards();
}

/**
 * 사이드바 렌더링
 */
function renderSidebar() {
    console.log('🔄 renderSidebar called, categories:', currentCategories.length);
    const sidebar = document.querySelector('.sidebar-content');
    
    if (!sidebar) {
        console.error('❌ .sidebar-content element not found!');
        return;
    }
    
    let html = `
        <button class="category-item ${selectedCategory === 'all' ? 'active' : ''}" 
                onclick="selectCategory('all')">
            <i class="material-icons">home</i>
            <span class="category-name">전체</span>
        </button>
    `;
    
    currentCategories.forEach(cat => {
        // 이모티콘이 있으면 이모티콘 사용, 없으면 Material 아이콘 사용
        const iconHtml = cat.emoji 
            ? `<span style="font-size: 24px;">${cat.emoji}</span>`
            : `<i class="material-icons">${cat.icon}</i>`;
        
        html += `
            <button class="category-item ${selectedCategory === cat.id ? 'active' : ''}"
                    onclick="selectCategory('${cat.id}')"
                    style="color: ${selectedCategory === cat.id ? 'white' : 'inherit'}; 
                           background: ${selectedCategory === cat.id ? cat.backgroundColor : 'transparent'}">
                ${iconHtml}
                <span class="category-name">${cat.name}</span>
            </button>
        `;
    });
    
    sidebar.innerHTML = html;
    console.log('✅ Sidebar rendered successfully');
}

/**
 * 카드 렌더링
 */
function renderCards() {
    console.log('🔄 renderCards called, total cards:', currentCards.length);
    const grid = document.getElementById('card-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!grid) {
        console.error('❌ #card-grid element not found!');
        return;
    }
    if (!emptyState) {
        console.error('❌ #empty-state element not found!');
        return;
    }
    
    // 선택된 카테고리에 따라 필터링
    let filteredCards = currentCards;
    if (selectedCategory !== 'all') {
        const category = currentCategories.find(c => c.id === selectedCategory);
        if (category) {
            filteredCards = currentCards.filter(card => card.category === category.name);
        }
    }
    console.log('📊 Filtered cards:', filteredCards.length, 'for category:', selectedCategory);
    
    // 빈 상태 표시
    if (filteredCards.length === 0) {
        console.log('ℹ️ No cards to display, showing empty state');
        grid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // 카드 렌더링
    grid.innerHTML = filteredCards.map(card => `
        <div class="aac-card" 
             style="background-color: ${card.backgroundColor || '#BBDEFB'}"
             onclick="speakCard('${card.id}')">
            ${card.imageUrl ? `<img src="${card.imageUrl}" class="card-image" alt="${card.text}" onerror="this.style.display='none'">` : ''}
            <div class="card-text">${card.text}</div>
            <button class="card-menu-btn" onclick="event.stopPropagation(); openCardMenu('${card.id}', event)">
                <i class="material-icons">more_vert</i>
            </button>
        </div>
    `).join('');
    console.log('✅ Cards rendered successfully');
}

/**
 * 카테고리 선택
 */
function selectCategory(categoryId) {
    console.log('🔍 selectCategory called with:', categoryId);
    selectedCategory = categoryId;
    
    // 디버깅: 선택된 카테고리 정보 출력
    if (categoryId !== 'all') {
        const category = currentCategories.find(c => c.id === categoryId);
        console.log('📂 Selected category:', category);
        if (category) {
            const matchingCards = currentCards.filter(card => card.category === category.name);
            console.log('🎴 Cards in this category:', matchingCards.length);
            console.log('🎴 Card categories:', matchingCards.map(c => c.category));
        }
    } else {
        console.log('📂 Selected: All categories');
        console.log('🎴 Total cards:', currentCards.length);
    }
    
    renderSidebar();
    renderCards();
}

/**
 * 사이드바 토글
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // 모바일에서는 open 클래스 토글
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    }
}

/**
 * 카드 클릭 - 문장에 추가
 */
function speakCard(cardId) {
    const card = currentCards.find(c => c.id === cardId);
    if (card) {
        // 문장에 단어 추가
        addWordToSentence(card.text);
        
        // 시각적 피드백
        const cardElement = event.currentTarget;
        if (cardElement) {
            cardElement.classList.add('speaking');
            setTimeout(() => {
                cardElement.classList.remove('speaking');
            }, 300);
        }
    }
}

/**
 * 카드 추가 다이얼로그 열기
 */
function openAddCardDialog() {
    editingCardId = null;
    document.getElementById('dialog-title').textContent = '새 카드 추가';
    document.getElementById('card-text').value = '';
    document.getElementById('card-image-url').value = '';
    document.getElementById('card-category').value = '';
    document.getElementById('card-color').value = '#BBDEFB';
    document.getElementById('color-preview').style.backgroundColor = '#BBDEFB';
    
    // 새 카테고리 입력 섹션 숨기기
    const newCatSection = document.getElementById('new-category-section');
    if (newCatSection) newCatSection.style.display = 'none';
    
    document.getElementById('card-dialog').style.display = 'flex';
}

/**
 * 카드 편집 다이얼로그 열기
 */
function openEditCardDialog(cardId) {
    const card = currentCards.find(c => c.id === cardId);
    if (!card) return;
    
    editingCardId = cardId;
    document.getElementById('dialog-title').textContent = '카드 편집';
    document.getElementById('card-text').value = card.text;
    document.getElementById('card-image-url').value = card.imageUrl || '';
    document.getElementById('card-category').value = card.category || '';
    document.getElementById('card-color').value = card.backgroundColor || '#BBDEFB';
    document.getElementById('color-preview').style.backgroundColor = card.backgroundColor || '#BBDEFB';
    
    // 기존 이미지가 있으면 미리보기 표시
    if (card.imageUrl) {
        const preview = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        
        if (preview && previewContainer) {
            preview.src = card.imageUrl;
            previewContainer.style.display = 'block';
        }
        
        // Base64 이미지인 경우 uploadedImageData에 저장
        if (card.imageUrl.startsWith('data:')) {
            uploadedImageData = card.imageUrl;
        }
    }
    
    document.getElementById('card-dialog').style.display = 'flex';
}

/**
 * 카드 다이얼로그 닫기
 */
function closeCardDialog() {
    document.getElementById('card-dialog').style.display = 'none';
    
    // 이미지 미리보기 초기화
    uploadedImageData = null;
    const preview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    if (preview) preview.src = '';
    if (previewContainer) previewContainer.style.display = 'none';
    
    // 파일 입력 초기화
    const fileInput = document.getElementById('card-image-file');
    const cameraInput = document.getElementById('card-image-camera');
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
}

/**
 * 이미지 업로드 임시 저장 변수
 */
let uploadedImageData = null;

/**
 * 이미지 업로드 핸들러
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
        showToast('이미지 파일만 업로드할 수 있습니다');
        return;
    }
    
    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
        showToast('이미지 크기는 5MB 이하여야 합니다');
        return;
    }
    
    // 파일을 Base64로 변환
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        
        // 미리보기 표시
        const preview = document.getElementById('image-preview');
        const previewContainer = document.getElementById('image-preview-container');
        
        if (preview && previewContainer) {
            preview.src = uploadedImageData;
            previewContainer.style.display = 'block';
        }
        
        // URL 입력 필드 비우기
        const urlInput = document.getElementById('card-image-url');
        if (urlInput) {
            urlInput.value = '';
        }
        
        showToast('✅ 이미지가 선택되었습니다');
    };
    
    reader.onerror = function() {
        showToast('❌ 이미지 읽기 실패');
    };
    
    reader.readAsDataURL(file);
}

/**
 * 카드 이미지 제거
 */
function removeCardImage() {
    uploadedImageData = null;
    
    const preview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('image-preview-container');
    
    if (preview) preview.src = '';
    if (previewContainer) previewContainer.style.display = 'none';
    
    // 파일 입력 초기화
    const fileInput = document.getElementById('card-image-file');
    const cameraInput = document.getElementById('card-image-camera');
    if (fileInput) fileInput.value = '';
    if (cameraInput) cameraInput.value = '';
    
    showToast('이미지가 제거되었습니다');
}

/**
 * 카드 저장
 */
function saveCard() {
    const text = document.getElementById('card-text').value.trim();
    if (!text) {
        showToast('텍스트를 입력해주세요');
        return;
    }
    
    // 이미지 URL 결정 (업로드 이미지 우선, 없으면 URL 입력값)
    let imageUrl = uploadedImageData;
    if (!imageUrl) {
        imageUrl = document.getElementById('card-image-url').value.trim();
    }
    
    const cardData = {
        text: text,
        imageUrl: imageUrl,
        category: document.getElementById('card-category').value,
        backgroundColor: document.getElementById('card-color').value
    };
    
    if (editingCardId) {
        // 편집
        AACStorage.updateCard(editingCardId, cardData);
        showToast('카드가 수정되었습니다');
    } else {
        // 새로 추가
        AACStorage.addCard(cardData);
        showToast('카드가 추가되었습니다');
    }
    
    // 업로드 이미지 데이터 초기화
    uploadedImageData = null;
    
    loadCards();
    closeCardDialog();
}

/**
 * 카드 메뉴 열기
 */
function openCardMenu(cardId, event) {
    event.stopPropagation();
    
    // 기존 메뉴 제거
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
    
    // 메뉴 생성
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
        <button onclick="openEditCardDialog('${cardId}'); this.parentElement.remove()">
            <i class="material-icons">edit</i>
            편집
        </button>
        <button class="danger" onclick="deleteCard('${cardId}'); this.parentElement.remove()">
            <i class="material-icons">delete</i>
            삭제
        </button>
    `;
    
    // 위치 설정
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    document.body.appendChild(menu);
    
    // 외부 클릭 시 메뉴 닫기
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

/**
 * 카드 삭제
 */
function deleteCard(cardId) {
    if (confirm('정말로 이 카드를 삭제하시겠습니까?')) {
        AACStorage.deleteCard(cardId);
        loadCards();
        showToast('카드가 삭제되었습니다');
    }
}

/**
 * 카테고리 관리 다이얼로그 열기
 */
function openCategoryDialog() {
    document.getElementById('category-dialog').style.display = 'flex';
    renderCategoryList();
}

/**
 * 카테고리 다이얼로그 닫기
 */
function closeCategoryDialog() {
    document.getElementById('category-dialog').style.display = 'none';
    
    // 편집 모드 해제 및 폼 초기화
    editingCategoryId = null;
    document.getElementById('category-name').value = '';
    document.getElementById('category-icon').value = 'restaurant';
    document.getElementById('category-bg-color').value = '#2196F3';
    
    // 버튼을 추가 모드로 되돌리기
    const addBtn = document.querySelector('#category-dialog .btn-primary');
    if (addBtn) {
        addBtn.innerHTML = '<i class="material-icons">add</i> 카테고리 추가';
        addBtn.onclick = addCategory;
    }
}

/**
 * 카테고리 추가
 */
function addCategory() {
    const name = document.getElementById('category-name').value.trim();
    if (!name) {
        showToast('카테고리 이름을 입력해주세요');
        return;
    }
    
    const categoryData = {
        name: name,
        emoji: document.getElementById('category-emoji').value.trim(),
        icon: document.getElementById('category-icon').value,
        backgroundColor: document.getElementById('category-bg-color').value
    };
    
    AACStorage.addCategory(categoryData);
    loadCategories();
    renderCategoryList();
    
    // 입력 필드 초기화
    document.getElementById('category-name').value = '';
    document.getElementById('category-emoji').value = '';
    document.getElementById('category-icon').value = 'restaurant';
    document.getElementById('category-bg-color').value = '#2196F3';
    
    // 편집 모드 해제
    editingCategoryId = null;
    
    showToast('카테고리가 추가되었습니다');
}

/**
 * 카테고리 목록 렌더링
 */
function renderCategoryList() {
    const list = document.getElementById('category-list');
    
    if (currentCategories.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #757575;">등록된 카테고리가 없습니다</p>';
        return;
    }
    
    list.innerHTML = currentCategories.map(cat => {
        // 이모티콘이 있으면 이모티콘 사용, 없으면 Material 아이콘 사용
        const iconHtml = cat.emoji 
            ? `<span style="font-size: 32px;">${cat.emoji}</span>`
            : `<i class="material-icons" style="color: ${cat.backgroundColor}">${cat.icon}</i>`;
        
        return `
            <div class="category-list-item" style="background-color: ${cat.backgroundColor}20">
                ${iconHtml}
                <div class="category-info">
                    <strong>${cat.name}</strong>
                </div>
                <button onclick="editCategory('${cat.id}')" title="편집" style="color: var(--primary-color);">
                    <i class="material-icons">edit</i>
                </button>
                <button onclick="deleteCategory('${cat.id}')" title="삭제">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * 카테고리 편집
 */
let editingCategoryId = null;

function editCategory(categoryId) {
    const category = currentCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    editingCategoryId = categoryId;
    
    // 폼에 기존 값 채우기
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-emoji').value = category.emoji || '';
    document.getElementById('category-icon').value = category.icon;
    document.getElementById('category-bg-color').value = category.backgroundColor;
    
    // 추가 버튼을 수정 버튼으로 변경
    const addBtn = document.querySelector('#category-dialog .btn-primary');
    if (addBtn) {
        addBtn.textContent = '수정';
        addBtn.onclick = updateCategory;
    }
    
    showToast(`"${category.name}" 카테고리 편집 중`);
}

/**
 * 카테고리 수정 저장
 */
function updateCategory() {
    const name = document.getElementById('category-name').value.trim();
    const emoji = document.getElementById('category-emoji').value.trim();
    const icon = document.getElementById('category-icon').value;
    const bgColor = document.getElementById('category-bg-color').value;
    
    if (!name) {
        showToast('카테고리 이름을 입력해주세요');
        return;
    }
    
    AACStorage.updateCategory(editingCategoryId, {
        name: name,
        emoji: emoji,
        icon: icon,
        backgroundColor: bgColor
    });
    
    // 편집 모드 해제
    editingCategoryId = null;
    
    // 추가 버튼으로 되돌리기
    const addBtn = document.querySelector('#category-dialog .btn-primary');
    if (addBtn) {
        addBtn.textContent = '카테고리 추가';
        addBtn.innerHTML = '<i class="material-icons">add</i> 카테고리 추가';
        addBtn.onclick = addCategory;
    }
    
    // 폼 초기화
    document.getElementById('category-name').value = '';
    document.getElementById('category-emoji').value = '';
    document.getElementById('category-icon').value = 'restaurant';
    document.getElementById('category-bg-color').value = '#2196F3';
    
    loadCategories();
    renderCategoryList();
    showToast('카테고리가 수정되었습니다');
}

/**
 * 카테고리 삭제
 */
function deleteCategory(categoryId) {
    if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
        AACStorage.deleteCategory(categoryId);
        loadCategories();
        renderCategoryList();
        showToast('카테고리가 삭제되었습니다');
    }
}

/**
 * 카테고리 선택 드롭다운 업데이트
 */
function updateCategorySelect() {
    const select = document.getElementById('card-category');
    select.innerHTML = '<option value="">카테고리 선택</option>';
    
    currentCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

/**
 * 새 카테고리 입력 필드 토글
 */
function toggleNewCategoryInput() {
    const section = document.getElementById('new-category-section');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        document.getElementById('new-category-name').focus();
    } else {
        section.style.display = 'none';
        // 입력 필드 초기화
        document.getElementById('new-category-name').value = '';
        document.getElementById('new-category-emoji').value = '';
        document.getElementById('new-category-icon').value = 'folder';
        document.getElementById('new-category-color').value = '#9C27B0';
    }
}

/**
 * 카드 다이얼로그에서 새 카테고리 생성
 */
function createNewCategoryFromCard() {
    const name = document.getElementById('new-category-name').value.trim();
    const emoji = document.getElementById('new-category-emoji').value.trim();
    const icon = document.getElementById('new-category-icon').value.trim() || 'folder';
    const bgColor = document.getElementById('new-category-color').value;
    
    if (!name) {
        showToast('카테고리 이름을 입력해주세요');
        return;
    }
    
    // 중복 체크
    if (currentCategories.find(c => c.name === name)) {
        showToast('이미 존재하는 카테고리입니다');
        return;
    }
    
    // 카테고리 추가
    const categoryData = {
        name: name,
        emoji: emoji,
        icon: icon,
        backgroundColor: bgColor,
        order: currentCategories.length + 1
    };
    
    const newCategory = AACStorage.addCategory(categoryData);
    
    // 카테고리 목록 새로고침
    loadCategories();
    updateCategorySelect();
    
    // 새로 만든 카테고리를 선택하기
    document.getElementById('card-category').value = name;
    
    // 입력 필드 숨기기
    toggleNewCategoryInput();
    
    showToast(`"${name}" 카테고리가 추가되었습니다`);
}

/**
 * 카드 다이얼로그에서 카테고리 삭제
 */
function openDeleteCategoryFromCard() {
    const selectedCategoryName = document.getElementById('card-category').value;
    
    if (!selectedCategoryName) {
        showToast('삭제할 카테고리를 먼저 선택해주세요');
        return;
    }
    
    const category = currentCategories.find(c => c.name === selectedCategoryName);
    if (!category) {
        showToast('선택한 카테고리를 찾을 수 없습니다');
        return;
    }
    
    // 해당 카테고리의 카드 개수 확인
    const cardsInCategory = currentCards.filter(card => card.category === selectedCategoryName).length;
    
    let confirmMessage = `정말로 "${selectedCategoryName}" 카테고리를 삭제하시겠습니까?`;
    if (cardsInCategory > 0) {
        confirmMessage += `\n\n⚠️ 이 카테고리에는 ${cardsInCategory}개의 카드가 있습니다.\n카테고리를 삭제해도 카드는 삭제되지 않습니다.`;
    }
    
    if (confirm(confirmMessage)) {
        AACStorage.deleteCategory(category.id);
        loadCategories();
        updateCategorySelect();
        
        // 카테고리 선택 초기화
        document.getElementById('card-category').value = '';
        
        showToast(`"${selectedCategoryName}" 카테고리가 삭제되었습니다`);
    }
}

/**
 * 설정 다이얼로그 열기
 */
function openSettingsDialog() {
    document.getElementById('settings-dialog').style.display = 'flex';
    
    // TTS 엔진 정보 표시
    updateTTSEngineInfo();
}

/**
 * TTS 엔진 정보 업데이트
 */
function updateTTSEngineInfo() {
    const engineName = document.getElementById('engine-name');
    if (engineName && TTS) {
        const info = TTS.getEngineInfo();
        engineName.textContent = info;
        
        // ResponsiveVoice 사용 중이면 아이콘 추가
        if (info.includes('ResponsiveVoice')) {
            engineName.innerHTML = '✅ ' + info;
        }
    }
}

/**
 * 설정 다이얼로그 닫기
 */
function closeSettingsDialog() {
    document.getElementById('settings-dialog').style.display = 'none';
}

/**
 * 설정 로드
 */
function loadSettings() {
    const settings = AACStorage.getSettings();
    document.getElementById('speech-rate').value = settings.speechRate || 1.0;
    document.getElementById('speech-pitch').value = settings.speechPitch || 1.0;
    document.getElementById('rate-value').textContent = (settings.speechRate || 1.0).toFixed(1) + 'x';
    document.getElementById('pitch-value').textContent = (settings.speechPitch || 1.0).toFixed(1) + 'x';
}

/**
 * 모든 데이터 삭제
 */
function clearAllData() {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        AACStorage.clearAll();
        location.reload();
    }
}

/**
 * 토스트 메시지 표시
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * 로딩 표시
 */
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * 디버그: 카드 강제 렌더링 및 상태 출력
 */
function debugCards() {
    console.clear();
    console.log('=== 🔍 디버그 시작 ===');
    
    // 1. 기본 상태 확인
    console.log('1️⃣ 현재 카드 개수:', currentCards.length);
    console.log('2️⃣ 현재 카테고리 개수:', currentCategories.length);
    console.log('3️⃣ 선택된 카테고리:', selectedCategory);
    
    // 2. DOM 요소 확인
    const grid = document.getElementById('card-grid');
    const emptyState = document.getElementById('empty-state');
    console.log('4️⃣ card-grid 요소 존재:', !!grid);
    console.log('5️⃣ empty-state 요소 존재:', !!emptyState);
    
    if (grid) {
        console.log('6️⃣ card-grid display:', window.getComputedStyle(grid).display);
        console.log('7️⃣ card-grid innerHTML 길이:', grid.innerHTML.length);
        console.log('8️⃣ card-grid 부모 요소:', grid.parentElement.className);
    }
    
    // 3. 음식 카테고리 필터링 테스트
    const foodCategory = currentCategories.find(c => c.name === '음식');
    console.log('9️⃣ 음식 카테고리:', foodCategory);
    
    if (foodCategory) {
        const filteredCards = currentCards.filter(card => card.category === foodCategory.name);
        console.log('🔟 음식 카테고리 카드:', filteredCards);
        
        // 4. 강제 렌더링
        console.log('💡 카드 강제 렌더링 시도...');
        selectedCategory = foodCategory.id;
        renderCards();
        
        console.log('✅ 강제 렌더링 완료!');
        showToast('🔍 디버그: 음식 카테고리 강제 렌더링 완료');
    } else {
        console.error('❌ 음식 카테고리를 찾을 수 없습니다!');
        showToast('❌ 음식 카테고리를 찾을 수 없습니다!');
    }
    
    console.log('=== 🔍 디버그 끝 ===');
}

// ==================== 문장 구성 기능 (Version 2 - 직접 입력 지원) ====================

/**
 * 단어를 문장에 추가
 */
function addWordToSentence(word) {
    const input = document.getElementById('sentence-text-input');
    if (!input) return;
    
    // 현재 입력된 텍스트 가져오기
    let currentText = input.value.trim();
    
    // 텍스트가 있으면 공백 추가 후 단어 추가
    if (currentText) {
        input.value = currentText + ' ' + word;
    } else {
        input.value = word;
    }
    
    // 입력 필드에 포커스
    input.focus();
}

/**
 * 구성된 문장 음성 출력 (Version 2 - 입력 필드 텍스트 읽기)
 */
function speakSentence() {
    const input = document.getElementById('sentence-text-input');
    if (!input) return;
    
    const sentence = input.value.trim();
    if (!sentence) {
        showToast('문장을 먼저 입력해주세요');
        return;
    }
    
    TTS.speak(sentence);
    showToast('🔊 문장 읽기: ' + sentence);
}

/**
 * 문장 지우기 (Version 2 - 입력 필드 비우기)
 */
function clearSentence() {
    const input = document.getElementById('sentence-text-input');
    if (!input) return;
    
    if (!input.value.trim()) return;
    
    if (confirm('입력한 문장을 지우시겠습니까?')) {
        input.value = '';
        input.focus();
        showToast('문장이 지워졌습니다');
    }
}

/**
 * 자주 쓰는 문장으로 저장 (Version 2 - 입력 필드 텍스트 저장)
 */
function saveFavoriteSentence() {
    const input = document.getElementById('sentence-text-input');
    if (!input) return;
    
    const sentence = input.value.trim();
    if (!sentence) {
        showToast('문장을 먼저 입력해주세요');
        return;
    }
    
    AACStorage.addFavoriteSentence(sentence);
    loadFavoriteSentences();
    showToast('📌 자주 쓰는 문장에 저장되었습니다');
}

/**
 * 확장 단어 패널 토글
 */
function toggleWordPanel() {
    const panel = document.getElementById('word-panel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        // 패널이 열릴 때 콘텐츠 렌더링
        renderWordPanelContent();
    } else {
        panel.style.display = 'none';
    }
}

/**
 * 자주 쓰는 문장 목록 토글
 */
function toggleFavorites() {
    const list = document.getElementById('favorite-list');
    const tab = document.querySelector('.favorite-tab');
    
    if (list.style.display === 'none' || list.style.display === '') {
        list.style.display = 'block';
        tab.classList.add('open');
    } else {
        list.style.display = 'none';
        tab.classList.remove('open');
    }
}

/**
 * 자주 쓰는 문장 목록 로드
 */
function loadFavoriteSentences() {
    const favorites = AACStorage.getFavoriteSentences();
    const list = document.getElementById('favorite-list');
    
    if (favorites.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 20px; color: #757575;">저장된 문장이 없습니다</p>';
        return;
    }
    
    list.innerHTML = favorites.map(fav => `
        <div class="favorite-item" onclick="useFavoriteSentence('${fav.id}')">
            <div class="favorite-item-text">
                <strong>${fav.text}</strong>
                ${fav.useCount > 0 ? `<small style="color: inherit; opacity: 0.7; margin-left: 8px;">사용 ${fav.useCount}회</small>` : ''}
            </div>
            <div class="favorite-item-actions">
                <button onclick="event.stopPropagation(); speakFavoriteSentence('${fav.id}')" title="읽기">
                    <i class="material-icons">volume_up</i>
                </button>
                <button onclick="event.stopPropagation(); deleteFavoriteSentence('${fav.id}')" title="삭제">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * 자주 쓰는 문장 사용 (Version 2 - 입력 필드에 설정)
 */
function useFavoriteSentence(id) {
    const favorites = AACStorage.getFavoriteSentences();
    const favorite = favorites.find(f => f.id === id);
    
    if (favorite) {
        const input = document.getElementById('sentence-text-input');
        if (input) {
            input.value = favorite.text;
            input.focus();
        }
        
        // 사용 횟수 증가
        AACStorage.incrementFavoriteUseCount(id);
        
        showToast('📝 문장이 입력되었습니다');
    }
}

/**
 * 자주 쓰는 문장 음성 출력
 */
function speakFavoriteSentence(id) {
    const favorites = AACStorage.getFavoriteSentences();
    const favorite = favorites.find(f => f.id === id);
    
    if (favorite) {
        TTS.speak(favorite.text);
        AACStorage.incrementFavoriteUseCount(id);
        loadFavoriteSentences(); // 사용 횟수 업데이트 반영
    }
}

/**
 * 자주 쓰는 문장 삭제
 */
function deleteFavoriteSentence(id) {
    if (confirm('이 문장을 삭제하시겠습니까?')) {
        AACStorage.deleteFavoriteSentence(id);
        loadFavoriteSentences();
        showToast('문장이 삭제되었습니다');
    }
}

// 자주 쓰는 문장 로드는 메인 초기화에서 처리됨

// ==================== CSV 가져오기/내보내기 ====================

/**
 * 카드 데이터를 CSV로 내보내기
 */
function exportCardsToCSV() {
    const cards = AACStorage.getCards();
    
    if (cards.length === 0) {
        showToast('내보낼 카드가 없습니다');
        return;
    }
    
    // CSV 헤더
    let csv = '텍스트,이미지URL,카테고리,배경색\n';
    
    // 카드 데이터 추가
    cards.forEach(card => {
        const text = escapeCSV(card.text);
        const imageUrl = escapeCSV(card.imageUrl || '');
        const category = escapeCSV(card.category || '');
        const backgroundColor = escapeCSV(card.backgroundColor || '#BBDEFB');
        
        csv += `${text},${imageUrl},${category},${backgroundColor}\n`;
    });
    
    // CSV 파일 다운로드
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM 추가
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `aac_cards_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`✅ ${cards.length}개 카드를 CSV로 내보냈습니다`);
}

/**
 * CSV 파일에서 카드 데이터 가져오기
 */
function importCardsFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let csv = e.target.result;
            
            // UTF-8 BOM 제거 (Excel에서 생성된 CSV 파일)
            if (csv.charCodeAt(0) === 0xFEFF) {
                csv = csv.substring(1);
            }
            
            const lines = csv.split('\n');
            
            // 헤더 제거
            const dataLines = lines.slice(1).filter(line => line.trim() !== '');
            
            let importCount = 0;
            let errorCount = 0;
            
            dataLines.forEach(line => {
                try {
                    const values = parseCSVLine(line);
                    
                    if (values.length >= 1 && values[0].trim() !== '') {
                        const cardData = {
                            text: values[0].trim(),
                            imageUrl: values[1] ? values[1].trim() : '',
                            category: values[2] ? values[2].trim() : '',
                            backgroundColor: values[3] ? values[3].trim() : '#BBDEFB'
                        };
                        
                        AACStorage.addCard(cardData);
                        importCount++;
                    }
                } catch (err) {
                    console.error('CSV 행 파싱 오류:', err, line);
                    errorCount++;
                }
            });
            
            // 카드 목록 새로고침
            loadCards();
            
            // 파일 입력 초기화
            event.target.value = '';
            
            if (importCount > 0) {
                showToast(`✅ ${importCount}개 카드를 가져왔습니다` + (errorCount > 0 ? ` (오류 ${errorCount}건)` : ''));
            } else {
                showToast('❌ 가져온 카드가 없습니다');
            }
            
        } catch (error) {
            console.error('CSV 파일 처리 오류:', error);
            showToast('❌ CSV 파일을 읽을 수 없습니다');
        }
    };
    
    // UTF-8 BOM 처리를 위해 readAsText 사용
    reader.readAsText(file);
}

/**
 * CSV 값 이스케이프 (쉼표, 따옴표, 줄바꿈 처리)
 */
function escapeCSV(value) {
    if (value == null) return '';
    
    const stringValue = String(value);
    
    // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
}

/**
 * CSV 행 파싱 (따옴표 안의 쉼표 처리)
 */
function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // 연속된 따옴표는 하나의 따옴표로 처리
                currentValue += '"';
                i++; // 다음 따옴표 건너뛰기
            } else {
                // 따옴표 열기/닫기
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // 쉼표로 구분 (따옴표 밖에서만)
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // 마지막 값 추가
    values.push(currentValue);
    
    return values;
}

/**
 * CSV 템플릿 다운로드
 */
function downloadCSVTemplate() {
    const template = '텍스트,이미지URL,카테고리,배경색\n' +
                     '물,https://cdn-icons-png.flaticon.com/512/2851/2851133.png,음식,#BBDEFB\n' +
                     '밥,https://cdn-icons-png.flaticon.com/512/3480/3480822.png,음식,#FFE0B2\n' +
                     '안녕하세요,https://cdn-icons-png.flaticon.com/512/1077/1077114.png,인사,#FFF9C4';
    
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'aac_cards_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('✅ CSV 템플릿이 다운로드되었습니다');
}

/**
 * 보조 단어 관리 다이얼로그 열기
 */
function openAuxiliaryWordsDialog() {
    const dialog = document.getElementById('auxiliary-words-dialog');
    dialog.style.display = 'flex';
    loadAuxiliaryWordsToDialog();
}

/**
 * 보조 단어 관리 다이얼로그 닫기
 */
function closeAuxiliaryWordsDialog() {
    const dialog = document.getElementById('auxiliary-words-dialog');
    dialog.style.display = 'none';
    document.getElementById('aux-word-text').value = '';
    
    // 하단 바 다시 렌더링
    renderAuxiliaryWordsBar();
}

/**
 * 다이얼로그에 보조 단어 목록 로드
 */
function loadAuxiliaryWordsToDialog() {
    const words = AACStorage.getAuxiliaryWords();
    const listContainer = document.getElementById('auxiliary-words-list');
    
    if (words.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-auxiliary-words">
                <i class="material-icons">chat_bubble_outline</i>
                <p>보조 단어가 없습니다.<br>새로운 단어를 추가해보세요!</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = words.map(word => `
        <div class="auxiliary-word-item">
            <span class="word-text">${word.text}</span>
            <button class="delete-btn" onclick="deleteAuxiliaryWordItem('${word.id}')" title="삭제">
                <i class="material-icons">close</i>
            </button>
        </div>
    `).join('');
}

/**
 * 보조 단어 추가
 */
function addAuxiliaryWord() {
    const input = document.getElementById('aux-word-text');
    const text = input.value.trim();
    
    if (!text) {
        showToast('⚠️ 단어를 입력해주세요');
        return;
    }
    
    if (text.length > 10) {
        showToast('⚠️ 단어는 10자 이내로 입력해주세요');
        return;
    }
    
    try {
        AACStorage.addAuxiliaryWord(text);
        input.value = '';
        loadAuxiliaryWordsToDialog();
        showToast(`✅ "${text}" 추가됨`);
    } catch (error) {
        showToast('❌ ' + error.message);
    }
}

/**
 * 보조 단어 삭제
 */
function deleteAuxiliaryWordItem(wordId) {
    if (!confirm('이 보조 단어를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        AACStorage.deleteAuxiliaryWord(wordId);
        loadAuxiliaryWordsToDialog();
        showToast('✅ 보조 단어가 삭제되었습니다');
    } catch (error) {
        showToast('❌ 삭제 실패: ' + error.message);
    }
}

/**
 * 보조 단어 기본값 복원
 */
function resetAuxiliaryWords() {
    if (!confirm('보조 단어를 기본값으로 복원하시겠습니까?\n현재 설정한 단어는 모두 삭제됩니다.')) {
        return;
    }
    
    const defaultWords = AACStorage.getDefaultAuxiliaryWords();
    AACStorage.saveAuxiliaryWords(defaultWords);
    loadAuxiliaryWordsToDialog();
    renderAuxiliaryWordsBar();
    showToast('✅ 기본값으로 복원되었습니다');
}

/**
 * 하단 바에 보조 단어 렌더링
 */
function renderAuxiliaryWordsBar() {
    const words = AACStorage.getAuxiliaryWords();
    const container = document.querySelector('.word-buttons');
    
    if (!container) {
        console.error('auxiliary-words container not found');
        return;
    }
    
    // 기존 단어 버튼들 제거 (more-btn과 manage-btn 제외)
    const existingButtons = container.querySelectorAll('.word-btn:not(.more-btn):not(.manage-btn)');
    existingButtons.forEach(btn => btn.remove());
    
    // 새로운 단어 버튼들 추가
    const moreBtn = container.querySelector('.more-btn');
    words.forEach(word => {
        const btn = document.createElement('button');
        btn.className = 'word-btn';
        btn.onclick = () => addWordToSentence(word.text);
        btn.innerHTML = `
            <img src="${word.icon}" alt="${word.text}" class="word-icon" onerror="this.style.display='none'">
            ${word.text}
        `;
        container.insertBefore(btn, moreBtn);
    });
    
    console.log('✅ Auxiliary words bar rendered with', words.length, 'words');
}

/**
 * 추가 단어 패널 콘텐츠 렌더링
 */
function renderWordPanelContent() {
    renderFavoriteCardsInPanel();
    renderAllCardsByCategory();
    renderAuxiliaryWordsInPanel();
}

/**
 * 즐겨찾기 카드를 추가 단어 패널에 렌더링
 */
function renderFavoriteCardsInPanel() {
    const favoriteCardIds = AACStorage.getFavoriteCards();
    const container = document.getElementById('favorite-cards-list');
    
    if (!container) {
        console.error('favorite-cards-list container not found');
        return;
    }
    
    if (favoriteCardIds.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="material-icons">star_border</i>
                <p>즐겨찾기한 카드가 없습니다.<br>카드의 ⭐ 버튼을 눌러 추가하세요!</p>
            </div>
        `;
        return;
    }
    
    const allCards = AACStorage.getCards();
    const favoriteCards = allCards.filter(card => favoriteCardIds.includes(card.id));
    
    container.innerHTML = favoriteCards.map(card => createFavoriteCardHTML(card, true)).join('');
}

/**
 * 모든 카드를 카테고리별로 추가 단어 패널에 렌더링
 */
function renderAllCardsByCategory() {
    const categories = AACStorage.getCategories();
    const allCards = AACStorage.getCards();
    const container = document.getElementById('all-cards-by-category');
    
    if (!container) {
        console.error('all-cards-by-category container not found');
        return;
    }
    
    let html = '';
    
    categories.forEach(category => {
        const categoryCards = allCards.filter(card => card.category === category.name);
        
        if (categoryCards.length > 0) {
            html += `
                <div class="word-group category-cards-section">
                    <span class="word-group-title">${category.icon ? `<i class="material-icons" style="font-size: 18px; vertical-align: middle;">${category.icon}</i>` : ''} ${category.name}</span>
                    <div class="favorite-cards-grid">
                        ${categoryCards.map(card => createFavoriteCardHTML(card, false)).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

/**
 * 보조 단어를 추가 단어 패널에 렌더링
 */
function renderAuxiliaryWordsInPanel() {
    const words = AACStorage.getAuxiliaryWords();
    const container = document.getElementById('auxiliary-words-in-panel');
    
    if (!container) {
        console.error('auxiliary-words-in-panel container not found');
        return;
    }
    
    container.innerHTML = words.map(word => `
        <button class="word-btn" onclick="addWordToSentence('${word.text}')" style="min-width: auto;">
            ${word.icon ? `<img src="${word.icon}" alt="${word.text}" class="word-icon" onerror="this.style.display='none'">` : ''}
            ${word.text}
        </button>
    `).join('');
}

/**
 * 즐겨찾기 카드 HTML 생성
 */
function createFavoriteCardHTML(card, isFavoriteSection) {
    const isFavorited = AACStorage.isFavoriteCard(card.id);
    
    return `
        <div class="favorite-card-item" style="background-color: ${card.backgroundColor || '#BBDEFB'}">
            <button class="favorite-toggle-btn ${isFavorited ? 'favorited' : ''}" 
                    onclick="event.stopPropagation(); toggleCardFavorite('${card.id}')" 
                    title="${isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}">
                <i class="material-icons">${isFavorited ? 'star' : 'star_border'}</i>
            </button>
            <div onclick="addWordToSentence('${card.text}')" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                ${card.imageUrl ? `<img src="${card.imageUrl}" class="card-image-small" alt="${card.text}" onerror="this.style.display='none'">` : ''}
                <span class="card-text-small">${card.text}</span>
            </div>
        </div>
    `;
}

/**
 * 카드 즐겨찾기 토글
 */
function toggleCardFavorite(cardId) {
    try {
        AACStorage.toggleFavoriteCard(cardId);
        
        // 추가 단어 패널이 열려있으면 다시 렌더링
        const panel = document.getElementById('word-panel');
        if (panel && panel.style.display === 'block') {
            renderWordPanelContent();
        }
        
        const card = currentCards.find(c => c.id === cardId);
        const isFavorited = AACStorage.isFavoriteCard(cardId);
        
        if (isFavorited) {
            showToast(`⭐ "${card.text}" 즐겨찾기 추가`);
        } else {
            showToast(`✓ "${card.text}" 즐겨찾기 해제`);
        }
    } catch (error) {
        console.error('Toggle favorite error:', error);
        showToast('❌ 즐겨찾기 처리 실패');
    }
}

/**
 * 인포그래픽 선택 분류표 렌더링
 */
function renderQuickSelectGrid() {
    const container = document.getElementById('quick-select-grid');
    
    if (!container) {
        console.error('quick-select-grid container not found');
        return;
    }
    
    // 6행 x 10열 그리드 데이터 (아이콘 포함)
    const gridData = [
    // A2
    { text: '나',    icon: '🙋‍♂️', color: '#FFF2CC' },
    { text: '무엇?', icon: '❓',    color: '#C9B2FF' },
    { text: '더',    icon: '➕',    color: '#D8BF95' },
    { text: '안/못', icon: '🚫',    color: '#F8F4E0' },
    { text: '켜요',  icon: '🔆',    color: '#B7D7F0' },
    { text: '작아요',icon: '📉',    color: '#B7D7F0' },
    { text: '가요',  icon: '🚶‍♂️', color: '#C6E0B4' },
    { text: '와요',  icon: '👋',    color: '#C6E0B4' },
    { text: '먹어요',icon: '🍽️',   color: '#C6E0B4' },
    { text: '주세요',icon: '🙏',    color: '#C6E0B4' },

    // A3
    { text: '너',    icon: '👉',    color: '#FFF2CC' },
    { text: '누구?', icon: '🧑❓',   color: '#C9B2FF' },
    { text: '다시',  icon: '🔄',    color: '#D8BF95' },
    { text: '빨라요',icon: '⚡',    color: '#B7D7F0' },
    { text: '느려요',icon: '🐢',    color: '#B7D7F0' },
    { text: '사요',  icon: '🛒',    color: '#C6E0B4' },
    { text: '넣어요',icon: '📥',    color: '#C6E0B4' },
    { text: '꺼내요',icon: '📤',    color: '#C6E0B4' },
    { text: '보내요',icon: '📨',    color: '#C6E0B4' },
    { text: '해요',  icon: '✨',    color: '#C6E0B4' },

    // A4
    { text: '우리',  icon: '👨‍👩‍👧‍👦', color: '#FFF2CC' },
    { text: '어디?', icon: '📍',        color: '#C9B2FF' },
    { text: '그만',  icon: '✋',        color: '#D8BF95' },
    { text: '있어요',icon: '✔️',        color: '#B7D7F0' },
    { text: '없어요',icon: '❌',        color: '#B7D7F0' },
    { text: '열어요',icon: '🔓',        color: '#C6E0B4' },
    { text: '닫아요',icon: '🔒',        color: '#C6E0B4' },
    { text: '빼요',  icon: '➖',        color: '#C6E0B4' },
    { text: '펴요',  icon: '📖',        color: '#C6E0B4' },
    { text: '돼요',  icon: '👌',        color: '#C6E0B4' },

    // A5
    { text: '그거',  icon: '☝️',        color: '#FFF2CC' },
    { text: '언제?', icon: '🕒',        color: '#C9B2FF' },
    { text: '같이',  icon: '🤝',        color: '#D8BF95' },
    { text: '위',    icon: '⬆️',        color: '#F2C314' },
    { text: '아래',  icon: '⬇️',        color: '#F2C314' },
    { text: '찾아요',icon: '🔍',        color: '#C6E0B4' },
    { text: '말해요',icon: '💬',        color: '#C6E0B4' },
    { text: '잘라요',icon: '✂️',        color: '#C6E0B4' },
    { text: '나가요',icon: '🚪',        color: '#C6E0B4' },
    { text: '봐요',  icon: '👀',        color: '#C6E0B4' },

    // A6
    { text: '이거',  icon: '👈',        color: '#FFF2CC' },
    { text: '왜?',  icon: '❓',         color: '#C9B2FF' },
    { text: '많이',  icon: '🔢',        color: '#D8BF95' },
    { text: '안',   icon: '↩️',        color: '#F2C314' }, // 내부 느낌
    { text: '밖',   icon: '↪️',        color: '#F2C314' }, // 외부 느낌
    { text: '꺼요', icon: '💡',        color: '#C6E0B4' },
    { text: '켜요', icon: '🔆',        color: '#C6E0B4' },
    { text: '읽어요',icon: '📚',       color: '#C6E0B4' },
    { text: '들려요',icon: '👂',       color: '#C6E0B4' },
    { text: '놓아요',icon: '👐',       color: '#C6E0B4' },

    // A7
    { text: '저거',  icon: '👉',        color: '#FFF2CC' },
    { text: '어떻게?',icon: '🤔',       color: '#C9B2FF' },
    { text: '조금',  icon: '🤏',        color: '#D8BF95' },
    { text: '앞',   icon: '⬅️',        color: '#F2C314' },
    { text: '뒤',   icon: '➡️',        color: '#F2C314' },
    { text: '옆',   icon: '↔️',        color: '#F2C314' },
    { text: '가져요',icon: '📦',       color: '#C6E0B4' },
    { text: '써요', icon: '✏️',        color: '#C6E0B4' },
    { text: '타요', icon: '🚗',        color: '#C6E0B4' },
    { text: '버려요',icon: '🗑️',       color: '#C6E0B4' }
];
    
    let html = '';
    
    // 그리드 셀 생성 (아이콘 + 텍스트)
    gridData.forEach((cell, index) => {
        html += `
            <div class="quick-select-cell" 
                 style="background-color: ${cell.color};"
                 onclick="addWordToSentence('${cell.text}')"
                 title="${cell.text}">
                ${cell.icon ? `<span class="cell-icon">${cell.icon}</span>` : ''}
                <span class="cell-text">${cell.text}</span>
            </div>
        `;
    });
    
    // 7행 - 네/아니요 (특수 행)
    html += `
        <div class="quick-select-cell special" 
             style="background-color: #90EE90;"
             onclick="addWordToSentence('네')">
            <span class="cell-icon">✅</span>
            <span class="cell-text">네</span>
        </div>
    `;
    
    // 빈 셀 8개
    for (let i = 0; i < 8; i++) {
        html += '<div class="quick-select-cell empty"></div>';
    }
    
    // 아니요
    html += `
        <div class="quick-select-cell special" 
             style="background-color: #FFB6C1;"
             onclick="addWordToSentence('아니요')">
            <span class="cell-icon">❌</span>
            <span class="cell-text">아니요</span>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Quick select grid rendered');
}

/**
 * ============================================
 * 인포그래픽 그리드 다이얼로그 (Version 2)
 * ============================================
 */

/**
 * 인포그래픽 그리드 다이얼로그 열기
 */
function openInfographicGrid() {
    const dialog = document.getElementById('infographic-dialog');
    if (dialog) {
        dialog.style.display = 'flex';
        renderInfographicGrid();
        showToast('📊 인포그래픽 그리드 열림');
    }
}

/**
 * 인포그래픽 그리드 다이얼로그 닫기
 */
function closeInfographicDialog() {
    const dialog = document.getElementById('infographic-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

/**
 * 인포그래픽 그리드 렌더링
 */
function renderInfographicGrid() {
    const container = document.getElementById('infographic-grid');
    if (!container) {
        console.error('❌ Infographic grid container not found');
        return;
    }
    
    // 7행 x 10열 그리드 데이터 (사용자 커스텀 데이터)
    const gridData = [
        // A2 (Row 1)
        { text: '나',    icon: '🙋‍♂️', color: '#FFF2CC' },
        { text: '무엇?', icon: '❓',    color: '#C9B2FF' },
        { text: '더',    icon: '➕',    color: '#D8BF95' },
        { text: '안/못', icon: '🚫',    color: '#F8F4E0' },
        { text: '켜요',  icon: '🔆',    color: '#B7D7F0' },
        { text: '작아요',icon: '📉',    color: '#B7D7F0' },
        { text: '가요',  icon: '🚶‍♂️', color: '#C6E0B4' },
        { text: '와요',  icon: '👋',    color: '#C6E0B4' },
        { text: '먹어요',icon: '🍽️',   color: '#C6E0B4' },
        { text: '주세요',icon: '🙏',    color: '#C6E0B4' },

        // A3 (Row 2)
        { text: '너',    icon: '👉',    color: '#FFF2CC' },
        { text: '누구?', icon: '🧑❓',   color: '#C9B2FF' },
        { text: '다시',  icon: '🔄',    color: '#D8BF95' },
        { text: '빨라요',icon: '⚡',    color: '#B7D7F0' },
        { text: '느려요',icon: '🐢',    color: '#B7D7F0' },
        { text: '사요',  icon: '🛒',    color: '#C6E0B4' },
        { text: '넣어요',icon: '📥',    color: '#C6E0B4' },
        { text: '꺼내요',icon: '📤',    color: '#C6E0B4' },
        { text: '보내요',icon: '📨',    color: '#C6E0B4' },
        { text: '해요',  icon: '✨',    color: '#C6E0B4' },

        // A4 (Row 3)
        { text: '우리',  icon: '👨‍👩‍👧‍👦', color: '#FFF2CC' },
        { text: '어디?', icon: '📍',        color: '#C9B2FF' },
        { text: '그만',  icon: '✋',        color: '#D8BF95' },
        { text: '있어요',icon: '✔️',        color: '#B7D7F0' },
        { text: '없어요',icon: '❌',        color: '#B7D7F0' },
        { text: '열어요',icon: '🔓',        color: '#C6E0B4' },
        { text: '닫아요',icon: '🔒',        color: '#C6E0B4' },
        { text: '빼요',  icon: '➖',        color: '#C6E0B4' },
        { text: '펴요',  icon: '📖',        color: '#C6E0B4' },
        { text: '돼요',  icon: '👌',        color: '#C6E0B4' },

        // A5 (Row 4)
        { text: '그거',  icon: '☝️',        color: '#FFF2CC' },
        { text: '언제?', icon: '🕒',        color: '#C9B2FF' },
        { text: '같이',  icon: '🤝',        color: '#D8BF95' },
        { text: '위',    icon: '⬆️',        color: '#F2C314' },
        { text: '아래',  icon: '⬇️',        color: '#F2C314' },
        { text: '찾아요',icon: '🔍',        color: '#C6E0B4' },
        { text: '말해요',icon: '💬',        color: '#C6E0B4' },
        { text: '잘라요',icon: '✂️',        color: '#C6E0B4' },
        { text: '나가요',icon: '🚪',        color: '#C6E0B4' },
        { text: '봐요',  icon: '👀',        color: '#C6E0B4' },

        // A6 (Row 5)
        { text: '이거',  icon: '👈',        color: '#FFF2CC' },
        { text: '왜?',   icon: '❓',        color: '#C9B2FF' },
        { text: '많이',  icon: '🔢',        color: '#D8BF95' },
        { text: '안',    icon: '↩️',        color: '#F2C314' },
        { text: '밖',    icon: '↪️',        color: '#F2C314' },
        { text: '꺼요',  icon: '💡',        color: '#C6E0B4' },
        { text: '켜요',  icon: '🔆',        color: '#C6E0B4' },
        { text: '읽어요',icon: '📚',        color: '#C6E0B4' },
        { text: '들려요',icon: '👂',        color: '#C6E0B4' },
        { text: '놓아요',icon: '👐',        color: '#C6E0B4' },

        // A7 (Row 6)
        { text: '저거',   icon: '👉',        color: '#FFF2CC' },
        { text: '어떻게?', icon: '🤔',       color: '#C9B2FF' },
        { text: '조금',   icon: '🤏',        color: '#D8BF95' },
        { text: '앞',     icon: '⬅️',        color: '#F2C314' },
        { text: '뒤',     icon: '➡️',        color: '#F2C314' },
        { text: '옆',     icon: '↔️',        color: '#F2C314' },
        { text: '가져요', icon: '📦',        color: '#C6E0B4' },
        { text: '써요',   icon: '✏️',        color: '#C6E0B4' },
        { text: '타요',   icon: '🚗',        color: '#C6E0B4' },
        { text: '버려요', icon: '🗑️',        color: '#C6E0B4' }
    ];
    
    let html = '';
    
    // 그리드 셀 생성 (아이콘 + 텍스트)
    gridData.forEach((cell, index) => {
        html += `
            <div class="infographic-cell" 
                 style="background-color: ${cell.color};"
                 onclick="addWordFromInfographic('${cell.text}')"
                 title="${cell.text}">
                ${cell.icon ? `<span class="cell-icon">${cell.icon}</span>` : ''}
                <span class="cell-text">${cell.text}</span>
            </div>
        `;
    });
    
    // 7행 (Row 7) - 네/아니요 (특수 행)
    html += `
        <div class="infographic-cell special" 
             style="background-color: #90EE90;"
             onclick="addWordFromInfographic('네')"
             title="네">
            <span class="cell-icon">✅</span>
            <span class="cell-text">네</span>
        </div>
    `;
    
    // 빈 셀 8개
    for (let i = 0; i < 8; i++) {
        html += '<div class="infographic-cell empty"></div>';
    }
    
    // 아니요
    html += `
        <div class="infographic-cell special" 
             style="background-color: #FFB6C1;"
             onclick="addWordFromInfographic('아니요')"
             title="아니요">
            <span class="cell-icon">❌</span>
            <span class="cell-text">아니요</span>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ Infographic grid rendered with 70 cells');
}

/**
 * 인포그래픽 그리드에서 단어 추가
 */
function addWordFromInfographic(word) {
    addWordToSentence(word);
    showToast(`📝 "${word}" 추가됨`);
}

// 다이얼로그 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    const dialog = document.getElementById('infographic-dialog');
    if (dialog && e.target === dialog) {
        closeInfographicDialog();
    }
});
