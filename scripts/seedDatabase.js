/**
 * SCRIPT DE POPULAÇÃO DO BANCO DE DADOS
 * =====================================
 * 
 * Este script popula o banco de dados com dados iniciais para demonstração.
 * Execute com: node scripts/seedDatabase.js
 */

const mongoose = require('mongoose');
const Task = require('../models/Task');

// Dados iniciais para popular o banco
const now = new Date();
const futureDate = (days) => new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

const initialTasks = [
    {
        title: 'Configurar ambiente de desenvolvimento',
        description: 'Instalar Node.js, Express, MongoDB e configurar o projeto',
        priority: 'high',
        category: 'work',
        dueDate: futureDate(7),
        completed: true
    },
    {
        title: 'Criar sistema de rotas',
        description: 'Implementar rotas para páginas e API REST',
        priority: 'high',
        category: 'work',
        dueDate: futureDate(10),
        completed: true
    },
    {
        title: 'Implementar funcionalidades do dashboard',
        description: 'Criar gráficos e estatísticas das tarefas com integração ao banco',
        priority: 'medium',
        category: 'work',
        dueDate: futureDate(15),
        completed: false
    },
    {
        title: 'Testar aplicação',
        description: 'Realizar testes de funcionalidade e performance',
        priority: 'medium',
        category: 'work',
        dueDate: futureDate(20),
        completed: false
    },
    {
        title: 'Fazer exercícios físicos',
        description: 'Caminhada de 30 minutos no parque',
        priority: 'low',
        category: 'health',
        dueDate: futureDate(3),
        completed: false
    },
    {
        title: 'Estudar JavaScript avançado',
        description: 'Aprender sobre async/await, Promises e ES6+',
        priority: 'medium',
        category: 'study',
        dueDate: futureDate(25),
        completed: false
    },
    {
        title: 'Organizar documentos pessoais',
        description: 'Arquivar documentos importantes e organizar pasta física',
        priority: 'low',
        category: 'personal',
        dueDate: futureDate(5),
        completed: true
    },
    {
        title: 'Revisar código do projeto',
        description: 'Fazer code review e refatorar código legado',
        priority: 'high',
        category: 'work',
        dueDate: futureDate(30),
        completed: false
    },
    {
        title: 'Marcar consulta médica',
        description: 'Agendar check-up anual com o médico',
        priority: 'medium',
        category: 'health',
        dueDate: futureDate(12),
        completed: false
    },
    {
        title: 'Ler livro de programação',
        description: 'Continuar lendo "Clean Code" - capítulos 5-8',
        priority: 'low',
        category: 'study',
        dueDate: futureDate(35),
        completed: false
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando população do banco de dados...');
        
        // Conectar ao MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tarefas_db';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
        
        // Limpar tarefas existentes
        await Task.deleteMany({});
        console.log('🗑️ Tarefas existentes removidas');
        
        // Inserir tarefas iniciais
        const createdTasks = await Task.insertMany(initialTasks);
        console.log(`✅ ${createdTasks.length} tarefas criadas com sucesso!`);
        
        // Mostrar estatísticas
        const stats = await Task.getStats();
        console.log('\n📊 Estatísticas das tarefas:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   Concluídas: ${stats.completed}`);
        console.log(`   Pendentes: ${stats.pending}`);
        console.log(`   Taxa de conclusão: ${stats.completionRate}%`);
        
        console.log('\n🎉 Banco de dados populado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao popular banco de dados:', error);
    } finally {
        // Fechar conexão
        await mongoose.connection.close();
        console.log('🔌 Conexão com MongoDB fechada');
        process.exit(0);
    }
}

// Executar script
seedDatabase();
