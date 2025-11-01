/**
 * 🚀 APLICATIVO HÍBRIDO - ARQUIVO PRINCIPAL
 * =========================================
 * 
 * Este é o arquivo principal do aplicativo híbrido desenvolvido para fins educacionais.
 * Demonstra conceitos fundamentais de desenvolvimento web moderno com Node.js.
 * 
 * ✨ Funcionalidades:
 * - Servidor HTTP robusto com Express.js
 * - Sistema de rotas organizado e modular
 * - Conexão opcional com MongoDB
 * - Middleware avançado para tratamento de erros
 * - Interface web responsiva e moderna
 * - API REST completa
 * 
 * 🎯 Objetivos de Aprendizado:
 * - Arquitetura de aplicações híbridas
 * - Padrões de desenvolvimento web moderno
 * - Gerenciamento de dependências e módulos
 * - Tratamento de erros e logging
 * 
 * @author Professor - Universidade de Vassouras
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// 📦 IMPORTAÇÕES DE MÓDULOS
// ============================================================================

// Módulos nativos do Node.js
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const path = require('path');

// Módulos externos (dependências)
const express = require('express');
const cors = require('cors');

// Módulos internos (nossa aplicação)
const { connectToDatabase, getConnectionStatus, testConnection } = require('./config/database');
const pagesRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

// ============================================================================
// ⚙️ CONFIGURAÇÕES E CONSTANTES
// ============================================================================

// Configurações do servidor
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = 'Aplicativo Híbrido';
const APP_VERSION = '1.0.0';

// Criação da instância do Express
const app = express();
const expressLayouts = require('express-ejs-layouts');

// ============================================================================
// 🎨 CONFIGURAÇÃO DO TEMPLATE ENGINE
// ============================================================================

// Configuração do EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);


// Variáveis globais para templates
app.locals.appName = APP_NAME;
app.locals.appVersion = APP_VERSION;
app.locals.nodeEnv = NODE_ENV;

// ============================================================================
// 🔧 MIDDLEWARE DE CONFIGURAÇÃO
// ============================================================================

// Middleware de CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: NODE_ENV === 'production' ? false : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsing de JSON
app.use(express.json({ 
    limit: '10mb',
    strict: true 
}));

// Middleware para parsing de dados de formulário
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

// ============================================================================
// 📊 MIDDLEWARE DE LOGGING E MONITORAMENTO
// ============================================================================

// Middleware personalizado para logging de requisições
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log da requisição
    console.log(`\n🌐 [${timestamp}] ${req.method} ${req.originalUrl}`);
    console.log(`📱 User-Agent: ${req.get('User-Agent') || 'N/A'}`);
    console.log(`🌍 IP: ${req.ip || req.connection.remoteAddress}`);
    
    // Intercepta o res.end para logar a resposta
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
        
        console.log(`${statusColor} [${duration}ms] ${res.statusCode} ${req.method} ${req.originalUrl}`);
        console.log('─'.repeat(60));
        
        originalEnd.call(this, chunk, encoding);
    };
    
    next();
});

// ============================================================================
// 🛣️ CONFIGURAÇÃO DAS ROTAS
// ============================================================================

// Middleware para adicionar informações de rota
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.currentMethod = req.method;
    next();
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: NODE_ENV,
        version: APP_VERSION,
        memory: process.memoryUsage(),
        database: getConnectionStatus()
    });
});

// Configuração das rotas de páginas (interface web)
app.use('/', pagesRoutes);

// Configuração das rotas de API (endpoints REST)
app.use('/api', apiRoutes);

// ============================================================================
// 🚨 MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================

// Middleware para capturar erros não tratados
app.use((error, req, res, next) => {
    const timestamp = new Date().toISOString();
    const errorId = Math.random().toString(36).substr(2, 9);
    
    // Log detalhado do erro
    console.error('\n💥 ERRO INTERNO DO SERVIDOR');
    console.error('═'.repeat(50));
    console.error(`🆔 Error ID: ${errorId}`);
    console.error(`⏰ Timestamp: ${timestamp}`);
    console.error(`🌐 URL: ${req.method} ${req.originalUrl}`);
    console.error(`📱 User-Agent: ${req.get('User-Agent') || 'N/A'}`);
    console.error(`🌍 IP: ${req.ip || req.connection.remoteAddress}`);
    console.error(`📊 Stack Trace:`, error.stack);
    console.error('═'.repeat(50));
    
    // Resposta do erro
    const errorResponse = {
        error: 'Erro interno do servidor',
        message: NODE_ENV === 'development' ? error.message : 'Algo deu errado',
        errorId: errorId,
        timestamp: timestamp,
        path: req.originalUrl,
        method: req.method
    };
    
    // Adiciona stack trace em desenvolvimento
    if (NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
});

// Middleware para rotas não encontradas (404)
app.use('*', (req, res) => {
    const timestamp = new Date().toISOString();
    
    console.log(`\n❌ ROTA NÃO ENCONTRADA`);
    console.log('─'.repeat(40));
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log(`🌐 URL: ${req.method} ${req.originalUrl}`);
    console.log(`📱 User-Agent: ${req.get('User-Agent') || 'N/A'}`);
    console.log(`🌍 IP: ${req.ip || req.connection.remoteAddress}`);
    console.log('─'.repeat(40));
    
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.method} ${req.originalUrl} não existe`,
        method: req.method,
        url: req.originalUrl,
        timestamp: timestamp,
        availableRoutes: {
            web: ['/', '/sobre', '/tarefas', '/contato'],
            api: ['/api/status', '/api/tarefas', '/health']
        }
    });
});

// ============================================================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

/**
 * Função para exibir banner de inicialização
 */
const displayBanner = () => {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    🚀 APLICATIVO HÍBRIDO 🚀                  ║');
    console.log('║                                                              ║');
    console.log('║  📚 Universidade de Vassouras - Aula 1                      ║');
    console.log('║  🎯 Desenvolvimento de Aplicações Híbridas                  ║');
    console.log('║  👨‍🏫 Professor: Lucas Nascimento                             ║');
    console.log('║                                                              ║');
    console.log('║  ✨ Funcionalidades:                                        ║');
    console.log('║     • Servidor HTTP com Express.js                          ║');
    console.log('║     • Interface web responsiva e moderna                    ║');
    console.log('║     • API REST completa                                     ║');
    console.log('║     • Conexão opcional com MongoDB                          ║');
    console.log('║     • Sistema de logging avançado                           ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('\n');
};

/**
 * Função para exibir informações do sistema
 */
const displaySystemInfo = (dbConnected) => {
    const systemInfo = {
        '🌐 Servidor': `http://localhost:${PORT}`,
        '📱 API Status': `http://localhost:${PORT}/api/status`,
        '🏥 Health Check': `http://localhost:${PORT}/health`,
        '🗄️  Banco de dados': dbConnected ? '✅ Conectado' : '⚠️  Modo offline',
        '🌍 Ambiente': NODE_ENV,
        '📦 Versão': APP_VERSION,
        '⏰ Iniciado em': new Date().toLocaleString('pt-BR'),
        '💾 Memória': `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    };
    
    console.log('📊 INFORMAÇÕES DO SISTEMA:');
    console.log('═'.repeat(50));
    Object.entries(systemInfo).forEach(([key, value]) => {
        console.log(`${key.padEnd(20)} ${value}`);
    });
    console.log('═'.repeat(50));
    console.log('📝 Logs das requisições aparecerão abaixo:');
    console.log('═'.repeat(50));
};

/**
 * Função principal de inicialização do servidor
 */
const startServer = async () => {
    try {
        // Exibe banner de inicialização
        displayBanner();
        
        console.log('🔄 Iniciando aplicativo híbrido...');
        console.log('⏳ Conectando com banco de dados...');
        
        // Tenta conectar com o banco de dados (opcional)
        const dbConnected = await connectToDatabase();
        
        // Inicia o servidor
        const server = app.listen(PORT, () => {
            console.log('✅ Servidor iniciado com sucesso!');
            displaySystemInfo(dbConnected);
        });
        
        // Configuração de graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n🛑 SIGTERM recebido. Encerrando servidor graciosamente...');
            server.close(() => {
                console.log('✅ Servidor encerrado com sucesso!');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('\n🛑 SIGINT recebido. Encerrando servidor graciosamente...');
            server.close(() => {
                console.log('✅ Servidor encerrado com sucesso!');
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('\n❌ ERRO CRÍTICO AO INICIAR SERVIDOR');
        console.error('═'.repeat(50));
        console.error('💥 Erro:', error.message);
        console.error('📊 Stack:', error.stack);
        console.error('═'.repeat(50));
        process.exit(1);
    }
};

// ============================================================================
// 🎬 EXECUÇÃO PRINCIPAL
// ============================================================================

// Executa a inicialização do servidor
startServer();

// ============================================================================
// 📚 CONCEITOS IMPORTANTES DEMONSTRADOS NESTA AULA
// ============================================================================

/**
 * 🎯 CONCEITOS FUNDAMENTAIS:
 * 
 * 1. **Arquitetura de Aplicações Híbridas**
 *    - Aplicações web que funcionam como apps nativos
 *    - Interface responsiva e moderna
 *    - Funcionalidades offline e online
 * 
 * 2. **Node.js e Módulos**
 *    - Sistema de módulos CommonJS
 *    - Importação de módulos nativos e externos
 *    - Gerenciamento de dependências com npm
 * 
 * 3. **Express.js Framework**
 *    - Criação de servidores HTTP robustos
 *    - Sistema de middleware modular
 *    - Roteamento avançado e organizado
 * 
 * 4. **Middleware e Interceptação**
 *    - Funções que executam entre requisição e resposta
 *    - Logging e monitoramento de requisições
 *    - Tratamento de erros centralizado
 * 
 * 5. **Template Engines (EJS)**
 *    - Renderização de páginas dinâmicas
 *    - Variáveis globais e locais
 *    - Layouts e componentes reutilizáveis
 * 
 * 6. **APIs REST**
 *    - Endpoints para comunicação com frontend
 *    - Padrões HTTP (GET, POST, PUT, DELETE)
 *    - Respostas em formato JSON
 * 
 * 7. **Tratamento de Erros**
 *    - Captura de erros não tratados
 *    - Logging detalhado para debugging
 *    - Respostas padronizadas para o cliente
 * 
 * 8. **Conexão com Banco de Dados**
 *    - MongoDB com Mongoose (opcional)
 *    - Modo offline para desenvolvimento
 *    - Health checks e monitoramento
 * 
 * 🚀 PRÓXIMAS AULAS:
 * ==================
 * 
 * Aula 2: Autenticação e Autorização
 * - JWT (JSON Web Tokens)
 * - Middleware de autenticação
 * - Controle de acesso por roles
 * 
 * Aula 3: Banco de Dados Avançado
 * - Schemas e validações
 * - Relacionamentos entre coleções
 * - Queries otimizadas
 * 
 * Aula 4: Testes e Deploy
 * - Testes unitários e de integração
 * - CI/CD com GitHub Actions
 * - Deploy em produção
 * 
 * @version 1.0.0
 * @author Professor Lucas Nascimento
 * @since 2024
 */
