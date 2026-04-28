// Configuração das categorias e palavras-chave
const categorias = {
    '🥩 Carnes': ['carne', 'frango', 'peixe', 'bife', 'costela', 'linguiça', 'presunto', 'salame', 'peru', 'pato'],
    '🥬 Vegetais': ['alface', 'tomate', 'cenoura', 'brócolis', 'couve', 'espinafre', 'abobrinha', 'berinjela', 'pepino', 'repolho', 'rúcula', 'agrião'],
    '🍎 Frutas': ['maçã', 'banana', 'laranja', 'uva', 'melancia', 'morango', 'abacaxi', 'manga', 'pera', 'kiwi', 'limão', 'abacate'],
    '🥛 Laticínios': ['leite', 'queijo', 'iogurte', 'manteiga', 'creme de leite', 'requeijão', 'coalhada', 'nata'],
    '🥚 Proteínas': ['ovo', 'ovos', 'tofu', 'grão de bico', 'lentilha', 'ervilha', 'soja', 'seitan'],
    '🍞 Padaria': ['pão', 'bolo', 'torta', 'biscoito', 'croissant', 'baguete', 'broa', 'cookies'],
    '🥫 Enlatados': ['milho', 'ervilha', 'atum', 'sardinha', 'palmito', 'azeitona', 'extrato de tomate'],
    '🍝 Massas': ['macarrão', 'espaguete', 'penne', 'lasanha', 'nhoque', 'ravioli'],
    '🧂 Temperos': ['sal', 'açúcar', 'alho', 'cebola', 'pimenta', 'orégano', 'manjericão', 'colorau', 'curry', 'açafrão'],
    '🧴 Higiene': ['sabonete', 'shampoo', 'condicionador', 'pasta de dente', 'fio dental', 'desodorante', 'papel higiênico', 'absorvente'],
    '🧹 Limpeza': ['detergente', 'desinfetante', 'água sanitária', 'sabão em pó', 'amaciante', 'esponja', 'luva', 'pano'],
    '📦 Outros': [] // Categoria padrão
};

// Função para classificar item
function classificarItem(nome) {
    nome = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    for (const [categoria, palavras] of Object.entries(categorias)) {
        for (const palavra of palavras) {
            if (nome.includes(palavra.toLowerCase())) {
                return categoria;
            }
        }
    }
    return '📦 Outros';
}

// Elementos DOM
let lista = JSON.parse(localStorage.getItem('lista') || '[]');

// Feedback sonoro
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Áudio não suportado'));
    }
}

// Feedback vibratório (dispositivos móveis)
function vibrate() {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }
}

// Toast notification
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.background = isError ? '#e74c3c' : 'var(--cor-preto)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Renderizar lista por categorias
function renderizarLista() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    // Agrupar itens por categoria
    const itensPorCategoria = {};
    
    lista.forEach(item => {
        const categoria = classificarItem(item.nome);
        if (!itensPorCategoria[categoria]) itensPorCategoria[categoria] = [];
        itensPorCategoria[categoria].push(item);
    });
    
    // Ordenar categorias
    const categoriasOrdenadas = Object.keys(categorias).filter(cat => itensPorCategoria[cat]?.length > 0);
    
    if (categoriasOrdenadas.length === 0 && lista.length === 0) {
        container.innerHTML = `
            <div class="category-section">
                <div class="empty-category">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Sua lista está vazia</p>
                    <small>Adicione itens acima ✨</small>
                </div>
            </div>
        `;
        atualizarStats();
        return;
    }
    
    // Renderizar HTML
    container.innerHTML = categoriasOrdenadas.map(categoria => {
        const itens = itensPorCategoria[categoria] || [];
        if (itens.length === 0) return '';
        
        const naoComprados = itens.filter(i => !i.comprado);
        const comprados = itens.filter(i => i.comprado);
        const itensOrdenados = [...naoComprados, ...comprados];
        
        return `
            <div class="category-section" data-categoria="${categoria}">
                <div class="category-header" onclick="toggleCategoria('${categoria}')">
                    <h3>
                        <i class="fas fa-folder-open"></i>
                        ${categoria}
                        <span class="category-count">${itens.length}</span>
                    </h3>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="category-items" id="cat-${categoria.replace(/[^a-zA-Z0-9]/g, '')}">
                    ${itensOrdenados.map(item => `
                        <div class="item" data-id="${item.id}">
                            <div class="item-left">
                                <input type="checkbox" class="item-checkbox" ${item.comprado ? 'checked' : ''} onchange="toggleItem(${item.id})">
                                <span class="item-text ${item.comprado ? 'comprado' : ''}">${escapeHtml(item.nome)}</span>
                            </div>
                            <div class="item-actions">
                                <button class="edit-btn" onclick="editarItem(${item.id})" aria-label="Editar">
                                    <i class="fas fa-pen"></i>
                                </button>
                                <button class="delete-btn" onclick="deletarItem(${item.id})" aria-label="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Restaurar estados recolhidos
    restaurarEstadosCategorias();
    atualizarStats();
}

// Salvar estado das categorias
function salvarEstadoCategoria(categoria, collapsed) {
    const estados = JSON.parse(localStorage.getItem('categorias_colapsadas') || '{}');
    estados[categoria] = collapsed;
    localStorage.setItem('categorias_colapsadas', JSON.stringify(estados));
}

function restaurarEstadosCategorias() {
    const estados = JSON.parse(localStorage.getItem('categorias_colapsadas') || '{}');
    Object.entries(estados).forEach(([categoria, collapsed]) => {
        const element = document.getElementById(`cat-${categoria.replace(/[^a-zA-Z0-9]/g, '')}`);
        if (element && collapsed) {
            element.classList.add('collapsed');
            const header = element.closest('.category-section')?.querySelector('.toggle-icon');
            if (header) header.style.transform = 'rotate(-90deg)';
        }
    });
}

window.toggleCategoria = function(categoria) {
    const element = document.getElementById(`cat-${categoria.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (element) {
        element.classList.toggle('collapsed');
        const icon = element.closest('.category-section')?.querySelector('.toggle-icon');
        if (icon) {
            const isCollapsed = element.classList.contains('collapsed');
            icon.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
            salvarEstadoCategoria(categoria, isCollapsed);
        }
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function atualizarStats() {
    const total = lista.length;
    const comprados = lista.filter(i => i.comprado).length;
    const categoriasAtivas = new Set(lista.map(i => classificarItem(i.nome))).size;
    
    document.getElementById('totalItens').textContent = total;
    document.getElementById('totalComprados').textContent = comprados;
    document.getElementById('totalCategorias').textContent = categoriasAtivas;
}

// Adicionar item
function adicionarItem(nomeCustom = null) {
    const input = document.getElementById('itemInput');
    const nome = nomeCustom || input.value.trim();
    
    if (!nome) {
        showToast('Digite um item!', true);
        vibrate();
        playSound('errorSound');
        return;
    }
    
    const novoItem = {
        id: Date.now(),
        nome: nome,
        comprado: false,
        data: new Date().toISOString()
    };
    
    lista.push(novoItem);
    localStorage.setItem('lista', JSON.stringify(lista));
    renderizarLista();
    
    if (!nomeCustom) input.value = '';
    
    showToast(`✓ "${nome}" adicionado!`);
    playSound('addSound');
    vibrate();
    
    // Foco no input
    input.focus();
}

// Alternar comprado
window.toggleItem = function(id) {
    const item = lista.find(i => i.id === id);
    if (item) {
        item.comprado = !item.comprado;
        localStorage.setItem('lista', JSON.stringify(lista));
        renderizarLista();
        playSound('checkSound');
        vibrate();
        showToast(item.comprado ? `✓ "${item.nome}" comprado!` : `↺ "${item.nome}" não comprado`);
    }
};

// Deletar item
window.deletarItem = function(id) {
    const item = lista.find(i => i.id === id);
    if (confirm(`Remover "${item?.nome}" da lista?`)) {
        lista = lista.filter(i => i.id !== id);
        localStorage.setItem('lista', JSON.stringify(lista));
        renderizarLista();
        playSound('deleteSound');
        vibrate();
        showToast(`🗑 "${item?.nome}" removido`);
    }
};

// Editar item
window.editarItem = function(id) {
    const item = lista.find(i => i.id === id);
    const novoNome = prompt('Editar item:', item?.nome);
    if (novoNome && novoNome.trim()) {
        item.nome = novoNome.trim();
        localStorage.setItem('lista', JSON.stringify(lista));
        renderizarLista();
        showToast(`✏ Item editado para "${novoNome}"`);
        playSound('addSound');
    }
};

// Limpar comprados
function limparComprados() {
    const comprados = lista.filter(i => i.comprado);
    if (comprados.length === 0) {
        showToast('Nenhum item comprado para limpar', true);
        return;
    }
    
    if (confirm(`Remover ${comprados.length} item(ns) comprado(s)?`)) {
        lista = lista.filter(i => !i.comprado);
        localStorage.setItem('lista', JSON.stringify(lista));
        renderizarLista();
        playSound('deleteSound');
        showToast(`🧹 ${comprados.length} item(ns) comprado(s) removido(s)`);
    }
}

// Logout
function logout() {
    if (confirm('Sair da sua conta?')) {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
    }
}

// Sugestões
function setupSuggestions() {
    document.querySelectorAll('.suggestion-badge').forEach(badge => {
        badge.addEventListener('click', () => {
            adicionarItem(badge.textContent.replace(/[🥩🐔🍅🧀🥛]/g, '').trim());
        });
    });
}

// Modo escuro
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    }
    
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            document.querySelector('#themeToggle i').className = 'fas fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            document.querySelector('#themeToggle i').className = 'fas fa-sun';
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderizarLista();
    setupSuggestions();
    initTheme();
    
    document.getElementById('addBtn')?.addEventListener('click', () => adicionarItem());
    document.getElementById('itemInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarItem();
    });
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('clearPurchasedBtn')?.addEventListener('click', limparComprados);
});