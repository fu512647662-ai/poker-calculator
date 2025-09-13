// 全局变量
let players = [];
let playerIdCounter = 0;

// DOM元素
const addPlayerBtn = document.getElementById('add-player-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const playersList = document.getElementById('players-list');
const emptyState = document.getElementById('empty-state');
const verificationStatus = document.getElementById('verification-status');

// 事件监听器
addPlayerBtn.addEventListener('click', addPlayer);
clearAllBtn.addEventListener('click', clearAll);

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
});

// 添加玩家
function addPlayer() {
    const playerName = prompt('请输入玩家昵称：');
    
    if (!playerName || playerName.trim() === '') {
        return;
    }

    // 检查是否已存在同名玩家
    if (players.some(player => player.name === playerName.trim())) {
        alert('该玩家已存在，请使用不同的昵称！');
        return;
    }

    const player = {
        id: ++playerIdCounter,
        name: playerName.trim(),
        buyIn: 0,
        finalStack: 0,
        profitLoss: 0
    };

    players.push(player);
    updateUI();
}

// 删除玩家
function removePlayer(playerId) {
    if (confirm('确定要删除这个玩家吗？')) {
        players = players.filter(player => player.id !== playerId);
        updateUI();
    }
}

// 更新玩家数据
function updatePlayerData(playerId, field, value) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // 验证输入值
    const numValue = parseFloat(value) || 0;
    player[field] = numValue;

    // 计算盈亏
    player.profitLoss = player.finalStack - player.buyIn;

    updateUI();
}

// 更新界面
function updateUI() {
    updatePlayersList();
    updateVerificationStatus();
    updateEmptyState();
}

// 更新玩家列表
function updatePlayersList() {
    playersList.innerHTML = '';

    players.forEach(player => {
        const playerRow = createPlayerRow(player);
        playersList.appendChild(playerRow);
    });
}

// 创建玩家行
function createPlayerRow(player) {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.innerHTML = `
        <div class="player-name">${escapeHtml(player.name)}</div>
        
        <div class="input-group">
            <label class="input-label">总买入</label>
            <input type="number" 
                   class="number-input" 
                   value="${player.buyIn}" 
                   min="0" 
                   step="0.01"
                   onchange="updatePlayerData(${player.id}, 'buyIn', this.value)"
                   oninput="validateInput(this)">
        </div>
        
        <div class="input-group">
            <label class="input-label">结束筹码</label>
            <input type="number" 
                   class="number-input" 
                   value="${player.finalStack}" 
                   min="0" 
                   step="0.01"
                   onchange="updatePlayerData(${player.id}, 'finalStack', this.value)"
                   oninput="validateInput(this)">
        </div>
        
        <div class="input-group">
            <label class="input-label">盈亏</label>
            <div class="profit-loss ${getProfitLossClass(player.profitLoss)}">
                ${formatProfitLoss(player.profitLoss)}
            </div>
        </div>
        
        <button class="btn btn-danger" onclick="removePlayer(${player.id})">
            <span class="btn-icon">🗑️</span>
        </button>
    `;

    return row;
}

// 验证输入
function validateInput(input) {
    const value = parseFloat(input.value);
    
    if (isNaN(value) || value < 0) {
        input.classList.add('invalid');
        input.classList.remove('valid');
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
}

// 获取盈亏样式类
function getProfitLossClass(profitLoss) {
    if (profitLoss > 0) return 'positive';
    if (profitLoss < 0) return 'negative';
    return 'zero';
}

// 格式化盈亏显示
function formatProfitLoss(profitLoss) {
    if (profitLoss > 0) {
        return `+${profitLoss.toFixed(2)}`;
    } else if (profitLoss < 0) {
        return profitLoss.toFixed(2);
    } else {
        return '0.00';
    }
}

// 更新校验状态
function updateVerificationStatus() {
    if (players.length === 0) {
        verificationStatus.className = 'verification-status';
        verificationStatus.querySelector('.status-icon').textContent = '⚪';
        verificationStatus.querySelector('.status-text').textContent = '请添加玩家并输入数据';
        return;
    }

    // 计算总盈亏
    const totalProfitLoss = players.reduce((sum, player) => sum + player.profitLoss, 0);
    
    // 由于浮点数精度问题，使用小的容差值
    const tolerance = 0.01;
    const isBalanced = Math.abs(totalProfitLoss) < tolerance;

    if (isBalanced) {
        verificationStatus.className = 'verification-status success';
        verificationStatus.querySelector('.status-icon').textContent = '✅';
        verificationStatus.querySelector('.status-text').textContent = '校验成功，账目已平！';
    } else {
        verificationStatus.className = 'verification-status error';
        verificationStatus.querySelector('.status-icon').textContent = '❌';
        verificationStatus.querySelector('.status-text').textContent = 
            `校验失败，差额：${formatProfitLoss(totalProfitLoss)}`;
    }
}

// 更新空状态显示
function updateEmptyState() {
    if (players.length === 0) {
        emptyState.classList.remove('hidden');
        playersList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        playersList.classList.remove('hidden');
    }
}

// 清空所有数据
function clearAll() {
    if (players.length === 0) {
        return;
    }

    if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
        players = [];
        playerIdCounter = 0;
        updateUI();
    }
}

// HTML转义函数
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N: 添加玩家
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addPlayer();
    }
    
    // Ctrl/Cmd + R: 清空重置
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        clearAll();
    }
});

// 数据持久化（可选功能）
function saveToLocalStorage() {
    try {
        localStorage.setItem('pokerCalculatorData', JSON.stringify({
            players: players,
            playerIdCounter: playerIdCounter
        }));
    } catch (e) {
        console.warn('无法保存数据到本地存储:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('pokerCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            players = data.players || [];
            playerIdCounter = data.playerIdCounter || 0;
            updateUI();
        }
    } catch (e) {
        console.warn('无法从本地存储加载数据:', e);
    }
}

// 在数据更新时自动保存
const originalUpdateUI = updateUI;
updateUI = function() {
    originalUpdateUI();
    saveToLocalStorage();
};

// 页面加载时尝试恢复数据
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});

// 导出功能（可选）
function exportData() {
    if (players.length === 0) {
        alert('没有数据可以导出！');
        return;
    }

    const data = {
        timestamp: new Date().toISOString(),
        players: players,
        totalProfitLoss: players.reduce((sum, player) => sum + player.profitLoss, 0)
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `poker-settlement-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// 添加导出按钮到控制区域（如果需要的话）
// 可以在HTML中添加导出按钮，然后绑定这个函数