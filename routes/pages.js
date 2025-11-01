/**
  ROTAS DE PÁGINAS
 * 
 * Este arquivo contém todas as rotas relacionadas às páginas HTML
 * da nossa aplicação. Aqui você pode adicionar novas páginas facilmente.
 */

const express = require('express');
const router = express.Router();

/**
 * PÁGINA INICIAL
 * =============
 * Rota: GET /
 * Descrição: Página principal do aplicativo
 */
router.get('/', (req, res) => {
    console.log('🏠 Acessando página inicial...');

    // Dados para a página
    const pageData = {
        title: 'Aplicativo Híbrido - Aula 1',
        description: 'Bem-vindo ao nosso aplicativo híbrido de gerenciamento de tarefas!',
        currentTime: new Date().toLocaleString('pt-BR'),
        version: '1.0.0'
    };

    // Renderiza a página inicial
    res.render('index', pageData);
});

/**
 * PÁGINA SOBRE
 * ============
 * Rota: GET /sobre
 * Descrição: Página com informações sobre o projeto
 */
router.get('/sobre', (req, res) => {
    console.log('ℹ️ Acessando página sobre...');

    const pageData = {
        title: 'Sobre o Projeto',
        description: 'Informações sobre o aplicativo híbrido',
        features: [
            'Interface moderna e responsiva',
            'Funciona sem banco de dados',
            'API REST completa',
            'Sistema de rotas organizado'
        ],
        technologies: [
            'Node.js',
            'Express.js',
            'MongoDB (opcional)',
            'HTML5/CSS3/JavaScript'
        ]
    };

    res.render('sobre', pageData);
});

/**
 * PÁGINA DE CONTATO
 * =================
 * Rota: GET /contato
 * Descrição: Página de contato
 */
router.get('/contato', (req, res) => {
    console.log('📞 Acessando página de contato...');

    const pageData = {
        title: 'Contato',
        description: 'Entre em contato conosco',
        contactInfo: {
            email: 'professor@exemplo.com',
            telefone: '(21) 99999-9999',
            endereco: 'Universidade de Vassouras'
        }
    };

    res.render('contato', pageData);
});

/**
 * PÁGINA DE TAREFAS
 * =================
 * Rota: GET /tarefas
 * Descrição: Página para gerenciar tarefas
 */
router.get('/tarefas', (req, res) => {
    console.log('📋 Acessando página de tarefas...');

    const pageData = {
        title: 'Gerenciador de Tarefas',
        description: 'Gerencie suas tarefas de forma eficiente',
        tasks: [
            { id: 1, title: 'Configurar ambiente', completed: true },
            { id: 2, title: 'Criar rotas', completed: true },
            { id: 3, title: 'Implementar funcionalidades', completed: false }
        ]
    };

    res.render('tarefas', pageData);
});

/**
 * PÁGINA DE Projetos
 * =================
 * Rota: GET /Projetos
 * Descrição: Página para gerenciar Projetos
 */

router.get('/projetos', (req, res) => {
    console.log('📋 Acessando página de Projetos...');

    const pageData = {
        title: 'Gerenciador de Projetos',
        description: 'Gerencie suas Projetos de forma eficiente',
        tasks: [
            { id: 1, title: 'Configurar ambiente', completed: true },
            { id: 2, title: 'Criar rotas', completed: true },
            { id: 3, title: 'Implementar funcionalidades', completed: false }
        ]
    };

    res.render('projetos', pageData);
});

router.get('/nova-pagina', (req, res) => {
    console.log('￾ Acessando nova página...');
    // Dados para a página
    const pageData = {
        title: 'Nova Página',
        description: 'Descrição da sua nova página',
        // Adicione mais dados conforme necessário
        customData: 'Dados personalizados',
        items: ['Item 1', 'Item 2', 'Item 3']
    };
    // Renderiza a página
    res.render('nova-pagina', pageData);
});

router.get('/produtos', (req, res) => {
    const pageData = {
        title: 'Produtos',
        description: 'Nossos produtos disponíveis',
        produtos: [
            { id: 1, nome: 'Produto A', preco: 99.90, estoque: 10 },
            { id: 2, nome: 'Produto B', preco: 149.90, estoque: 5 },
            { id: 3, nome: 'Produto C', preco: 199.90, estoque: 0 }
        ]
    };
    res.render('produtos', pageData);
});

/**
 * PÁGINA DASHBOARD
 * ================
 * Rota: GET /dashboard
 * Descrição: Dashboard com estatísticas e gráficos das tarefas
 */
router.get('/dashboard', async (req, res) => {
    console.log('📊 Acessando dashboard...');

    try {
        const Task = require('../models/Task');
        
        // Obter estatísticas das tarefas
        const stats = await Task.getStats();
        
        // Obter últimas 5 tarefas
        const ultimasTarefas = await Task.getRecentTasks(5);
        
        // Obter todas as tarefas para o gráfico
        const todasTarefas = await Task.find()
            .select('title completed priority category dueDate createdAt')
            .sort({ createdAt: -1 });

        const pageData = {
            title: 'Dashboard',
            description: 'Visão geral das suas tarefas e estatísticas',
            estatisticas: {
                totalTarefas: stats.total,
                tarefasConcluidas: stats.completed,
                tarefasPendentes: stats.pending,
                percentualConclusao: stats.completionRate
            },
            ultimasTarefas: ultimasTarefas.map(task => ({
                id: task._id,
                titulo: task.title,
                concluida: task.completed,
                data: task.createdAt.toISOString().split('T')[0],
                prioridade: task.priority,
                categoria: task.category
            })),
            tarefas: todasTarefas.map(task => ({
                id: task._id,
                titulo: task.title,
                concluida: task.completed,
                data: task.createdAt.toISOString().split('T')[0],
                prioridade: task.priority,
                categoria: task.category
            }))
        };

        res.render('dashboard', pageData);
    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        
        // Fallback para dados simulados em caso de erro
        const pageData = {
            title: 'Dashboard',
            description: 'Visão geral das suas tarefas e estatísticas',
            estatisticas: {
                totalTarefas: 0,
                tarefasConcluidas: 0,
                tarefasPendentes: 0,
                percentualConclusao: 0
            },
            ultimasTarefas: [],
            tarefas: [],
            error: 'Erro ao carregar dados do banco de dados'
        };

        res.render('dashboard', pageData);
    }
});

/**
 * PÁGINA 404
 * ==========
 * Rota: GET *
 * Descrição: Página para rotas não encontradas
 */
// router.get('*', (req, res) => {
//     console.log(`❌ Página não encontrada: ${req.originalUrl}`);

//     const pageData = {
//         title: 'Página não encontrada',
//         description: 'A página que você procura não existe',
//         requestedUrl: req.originalUrl
//     };

//     res.status(404).render('404', pageData);
// });

module.exports = router;
