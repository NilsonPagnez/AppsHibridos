/**
 * AULA 1 - ROTAS DE API
 * 
 * Este arquivo contém todas as rotas relacionadas à API REST
 * da nossa aplicação. Aqui você pode adicionar novos endpoints.
 */

const express = require('express');
const router = express.Router();

/**
 * STATUS DA API
 * =============
 * Rota: GET /api/status
 * Descrição: Retorna informações sobre o status da API
 */
router.get('/status', (req, res) => {
    console.log('📊 Verificando status da API...');

    const status = {
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform,
        port: process.env.PORT || 3000
    };

    res.json(status);
});

router.get('/produtos', (req, res) => {
    const produtos = [
        { id: 1, nome: 'Produto A', preco: 99.90, estoque: 10 },
        { id: 2, nome: 'Produto B', preco: 149.90, estoque: 5 },
        { id: 3, nome: 'Produto C', preco: 199.90, estoque: 0 }
    ];
    res.json({
        success: true,
        data: produtos,
        total: produtos.length,
        timestamp: new Date().toISOString()
    });
    6
});

router.get('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const produto = produtos.find(p => p.id == id);
    if (produto) {
        res.json({
            success: true,
            data: produto,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Produto não encontrado',
            timestamp: new Date().toISOString()
        });
    }
});

/**
* NOVA API
* ========
* Rota: GET /api/nova-api
* Descrição: Sua nova API
*/
router.get('/nova-api', (req, res) => {
    console.log('Acessando nova API...');
    const responseData = {
        success: true,
        message: 'Nova API funcionando!',
        data: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            customData: 'Dados personalizados da API'
        }
    };
    res.json(responseData);
});

/**
* API COM PARÂMETROS
* ==================
* Rota: GET /api/nova-api/:id
* Descrição: API com parâmetro de ID
*/
router.get('/nova-api/:id', (req, res) => {
    const { id } = req.params;
    console.log(`￾ Acessando nova API com ID: ${id}`);
    3
    res.json({
        success: true,
        message: `API chamada com ID: ${id}`,
        id: id,
        timestamp: new Date().toISOString()
    });
})

/**
* API POST
* ========
* Rota: POST /api/nova-api
* Descrição: API para receber dados
*/
router.post('/nova-api', (req, res) => {
    console.log('Recebendo dados via POST...');
    console.log('Dados recebidos:', req.body);
    res.json({
        success: true,
        message: 'Dados recebidos com sucesso!',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

/**
 * STATUS DO BANCO DE DADOS
 * ========================
 * Rota: GET /api/database
 * Descrição: Retorna informações sobre o banco de dados
 */
router.get('/database', async (req, res) => {
    console.log('🗄️ Verificando status do banco de dados...');

    try {
        const { getConnectionStatus, testConnection } = require('../config/database');
        const connectionStatus = getConnectionStatus();
        const isConnected = await testConnection();

        const databaseStatus = {
            connection: connectionStatus,
            isConnected: isConnected,
            timestamp: new Date().toISOString()
        };

        res.json(databaseStatus);
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao verificar banco de dados',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * TESTE POST
 * ==========
 * Rota: POST /api/test
 * Descrição: Testa requisições POST
 */
router.post('/test', (req, res) => {
    console.log('🧪 Teste POST recebido...');
    console.log('Dados recebidos:', req.body);

    res.json({
        message: 'Teste POST executado com sucesso!',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

/**
 * LISTAR TAREFAS
 * ==============
 * Rota: GET /api/tarefas
 * Descrição: Retorna lista de tarefas com filtros e busca
 */
router.get('/tarefas', async (req, res) => {
    console.log('📋 Listando tarefas...');

    try {
        const Task = require('../models/Task');
        const { search, status, priority, category, page = 1, limit = 10 } = req.query;
        
        // Filtros para busca
        const filters = {};
        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (category) filters.category = category;
        
        // Busca por texto
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filtros de status
        if (status === 'completed') {
            query.completed = true;
        } else if (status === 'pending') {
            query.completed = false;
        }
        
        // Filtros adicionais
        if (priority) query.priority = priority;
        if (category) query.category = category;
        
        // Paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const tasks = await Task.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Task.countDocuments(query);
        
        res.json({
            success: true,
            data: tasks,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao listar tarefas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * CRIAR TAREFA
 * ============
 * Rota: POST /api/tarefas
 * Descrição: Cria uma nova tarefa
 */
router.post('/tarefas', async (req, res) => {
    console.log('➕ Criando nova tarefa...');
    console.log('Dados recebidos:', req.body);

    try {
        const Task = require('../models/Task');
        const { title, description, priority, category, dueDate } = req.body;

        // Validação básica
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Título é obrigatório',
                timestamp: new Date().toISOString()
            });
        }

        // Criar nova tarefa
        const novaTarefa = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            priority: priority || 'medium',
            category: category || 'work',
            dueDate: dueDate || null
        });

        await novaTarefa.save();

        res.status(201).json({
            success: true,
            message: 'Tarefa criada com sucesso!',
            data: novaTarefa,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao criar tarefa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * ATUALIZAR TAREFA
 * ================
 * Rota: PUT /api/tarefas/:id
 * Descrição: Atualiza uma tarefa existente
 */
router.put('/tarefas/:id', async (req, res) => {
    console.log(`🔄 Atualizando tarefa ${req.params.id}...`);
    console.log('Dados recebidos:', req.body);

    try {
        const Task = require('../models/Task');
        const { id } = req.params;
        const { title, description, priority, category, dueDate, completed } = req.body;

        // Verificar se a tarefa existe
        const tarefa = await Task.findById(id);
        if (!tarefa) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada',
                timestamp: new Date().toISOString()
            });
        }

        // Atualizar campos
        if (title !== undefined) tarefa.title = title.trim();
        if (description !== undefined) tarefa.description = description.trim();
        if (priority !== undefined) tarefa.priority = priority;
        if (category !== undefined) tarefa.category = category;
        if (dueDate !== undefined) tarefa.dueDate = dueDate || null;
        if (completed !== undefined) tarefa.completed = completed;

        await tarefa.save();

        res.json({
            success: true,
            message: `Tarefa ${id} atualizada com sucesso!`,
            data: tarefa,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar tarefa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * DELETAR TAREFA
 * ==============
 * Rota: DELETE /api/tarefas/:id
 * Descrição: Deleta uma tarefa
 */
router.delete('/tarefas/:id', async (req, res) => {
    console.log(`🗑️ Deletando tarefa ${req.params.id}...`);

    try {
        const Task = require('../models/Task');
        const { id } = req.params;

        // Verificar se a tarefa existe
        const tarefa = await Task.findById(id);
        if (!tarefa) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada',
                timestamp: new Date().toISOString()
            });
        }

        await Task.findByIdAndDelete(id);

        res.json({
            success: true,
            message: `Tarefa ${id} deletada com sucesso!`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao deletar tarefa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * OBTER TAREFA POR ID
 * ===================
 * Rota: GET /api/tarefas/:id
 * Descrição: Retorna uma tarefa específica
 */
router.get('/tarefas/:id', async (req, res) => {
    console.log(`📋 Obtendo tarefa ${req.params.id}...`);

    try {
        const Task = require('../models/Task');
        const { id } = req.params;

        const tarefa = await Task.findById(id);
        if (!tarefa) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada',
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            data: tarefa,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao obter tarefa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * PROJETOS
 * ========
 * CRUD completo para gerenciamento de projetos
 */

// LISTAR PROJETOS
router.get('/projetos', async (req, res) => {
    console.log('📁 Listando projetos...');
    try {
        const Project = require('../models/Project');
        const Task = require('../models/Task');
        const { search } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const projects = await Project.find(query).populate('tasks').sort({ createdAt: -1 });

        res.json({
            success: true,
            data: projects,
            total: projects.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao listar projetos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao listar projetos',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// OBTER PROJETO POR ID
router.get('/projetos/:id', async (req, res) => {
    console.log(`📂 Obtendo projeto ${req.params.id}...`);
    try {
        const Project = require('../models/Project');
        const { id } = req.params;

        const projeto = await Project.findById(id).populate('tasks');
        if (!projeto) {
            return res.status(404).json({
                success: false,
                error: 'Projeto não encontrado',
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            data: projeto,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao obter projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter projeto',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// CRIAR PROJETO
router.post('/projetos', async (req, res) => {
    console.log('➕ Criando novo projeto...');
    console.log('Dados recebidos:', req.body);

    try {
        const Project = require('../models/Project');
        const { name, description, tasks } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'O nome do projeto é obrigatório',
                timestamp: new Date().toISOString()
            });
        }

        const novoProjeto = new Project({
            name: name.trim(),
            description: description ? description.trim() : '',
            tasks: tasks || []
        });

        await novoProjeto.save();

        res.status(201).json({
            success: true,
            message: 'Projeto criado com sucesso!',
            data: novoProjeto,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao criar projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao criar projeto',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ATUALIZAR PROJETO
router.put('/projetos/:id', async (req, res) => {
    console.log(`🔄 Atualizando projeto ${req.params.id}...`);
    try {
        const Project = require('../models/Project');
        const { id } = req.params;
        const { name, description, tasks } = req.body;

        const projeto = await Project.findById(id);
        if (!projeto) {
            return res.status(404).json({
                success: false,
                error: 'Projeto não encontrado',
                timestamp: new Date().toISOString()
            });
        }

        if (name !== undefined) projeto.name = name.trim();
        if (description !== undefined) projeto.description = description.trim();
        if (tasks !== undefined) projeto.tasks = tasks;

        await projeto.save();

        res.json({
            success: true,
            message: 'Projeto atualizado com sucesso!',
            data: projeto,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao atualizar projeto',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// DELETAR PROJETO
router.delete('/projetos/:id', async (req, res) => {
    console.log(`🗑️ Deletando projeto ${req.params.id}...`);
    try {
        const Project = require('../models/Project');
        const { id } = req.params;

        const projeto = await Project.findById(id);
        if (!projeto) {
            return res.status(404).json({
                success: false,
                error: 'Projeto não encontrado',
                timestamp: new Date().toISOString()
            });
        }

        await Project.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Projeto deletado com sucesso!',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao deletar projeto:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao deletar projeto',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ESTATÍSTICAS DOS PROJETOS
router.get('/projetos/stats', async (req, res) => {
    console.log('📊 Obtendo estatísticas dos projetos...');
    try {
        const Project = require('../models/Project');
        const stats = await Project.getStats();

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno ao obter estatísticas dos projetos',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});


/**
 * ALTERNAR STATUS DA TAREFA
 * =========================
 * Rota: PATCH /api/tarefas/:id/toggle
 * Descrição: Alterna o status de conclusão da tarefa
 */
router.patch('/tarefas/:id/toggle', async (req, res) => {
    console.log(`🔄 Alternando status da tarefa ${req.params.id}...`);

    try {
        const Task = require('../models/Task');
        const { id } = req.params;

        const tarefa = await Task.findById(id);
        if (!tarefa) {
            return res.status(404).json({
                success: false,
                error: 'Tarefa não encontrada',
                timestamp: new Date().toISOString()
            });
        }

        await tarefa.toggleComplete();

        res.json({
            success: true,
            message: `Status da tarefa ${id} alterado com sucesso!`,
            data: tarefa,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao alternar status da tarefa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * ESTATÍSTICAS DAS TAREFAS
 * ========================
 * Rota: GET /api/tarefas/stats
 * Descrição: Retorna estatísticas das tarefas
 */
router.get('/tarefas/stats', async (req, res) => {
    console.log('📊 Obtendo estatísticas das tarefas...');

    try {
        const Task = require('../models/Task');
        
        const stats = await Task.getStats();
        const recentTasks = await Task.getRecentTasks(5);

        res.json({
            success: true,
            data: {
                stats: stats,
                recentTasks: recentTasks
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * BUSCAR TAREFAS
 * ==============
 * Rota: GET /api/tarefas/search
 * Descrição: Busca tarefas por texto com filtros
 */
router.get('/tarefas/search', async (req, res) => {
    console.log('🔍 Buscando tarefas...');

    try {
        const Task = require('../models/Task');
        const { q, status, priority, category } = req.query;

        const tasks = await Task.searchTasks(q, { status, priority, category });

        res.json({
            success: true,
            data: tasks,
            total: tasks.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao buscar tarefas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * LIMPAR TAREFAS CONCLUÍDAS
 * ==========================
 * Rota: DELETE /api/tarefas/completed
 * Descrição: Remove todas as tarefas concluídas
 */
router.delete('/tarefas/completed', async (req, res) => {
    console.log('🗑️ Limpando tarefas concluídas...');

    try {
        const Task = require('../models/Task');
        
        const result = await Task.deleteMany({ completed: true });
        
        res.json({
            success: true,
            message: `${result.deletedCount} tarefas concluídas foram removidas!`,
            deletedCount: result.deletedCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Erro ao limpar tarefas concluídas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;


