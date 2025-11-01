/**
 * AULA 1 - CONFIGURAÇÃO DO BANCO DE DADOS
 * 
 * Este arquivo contém a configuração básica para conexão com MongoDB
 * usando o Mongoose ODM. É o primeiro passo para conectar nossa
 * aplicação com o banco de dados.
 */

// Importação do Mongoose - ODM para MongoDB
const mongoose = require('mongoose');

// Importação do dotenv para variáveis de ambiente
require('dotenv').config();

/**
 * CONFIGURAÇÕES DE CONEXÃO
 * ========================
 * 
 * Estas configurações definem como nossa aplicação se conecta ao MongoDB:
 * - URL de conexão
 * - Opções de conexão
 * - Tratamento de erros
 */

// URL de conexão com MongoDB
// Em desenvolvimento, usamos MongoDB local
// Em produção, usamos variável de ambiente
const MONGODB_URI = process.env.MONGODB_URI;

// Opções de conexão do Mongoose (versão atualizada)
const connectionOptions = {
    maxPoolSize: 10,              // Máximo de conexões no pool
    serverSelectionTimeoutMS: 5000, // Timeout para seleção de servidor
    socketTimeoutMS: 45000,       // Timeout para operações de socket
    bufferCommands: false         // Desabilita buffering de comandos
};

/**
 * FUNÇÃO DE CONEXÃO COM MONGODB
 * =============================
 * 
 * Esta função estabelece a conexão com o banco de dados MongoDB
 * e configura os event listeners para monitorar o status da conexão.
 */
const connectToDatabase = async () => {
    try {
        console.log('🔄 Tentando conectar ao MongoDB...');
        console.log(`📊 URL: ${MONGODB_URI}`);
        
        // Estabelece conexão com MongoDB
        await mongoose.connect(MONGODB_URI, connectionOptions);
        
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log(`🗄️  Banco de dados: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        console.log(`🔌 Porta: ${mongoose.connection.port}`);
        
    } catch (error) {
        console.warn('⚠️  MongoDB não disponível:', error.message);
        console.warn('💡 O aplicativo continuará funcionando sem banco de dados');
        console.warn('🔧 Para usar o banco de dados, instale e inicie o MongoDB');
        
        // Não encerra o processo, apenas continua sem banco
        return false;
    }
};

/**
 * EVENT LISTENERS PARA MONITORAMENTO DA CONEXÃO
 * =============================================
 * 
 * Estes listeners monitoram o status da conexão e executam ações
 * específicas quando eventos ocorrem.
 */

// Evento disparado quando a conexão é estabelecida
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose conectado ao MongoDB');
});

// Evento disparado quando há erro na conexão
mongoose.connection.on('error', (error) => {
    console.error('💥 Erro na conexão Mongoose:', error);
});

// Evento disparado quando a conexão é desconectada
mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose desconectado do MongoDB');
});

// Evento disparado quando a aplicação é encerrada
process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido sinal de interrupção (Ctrl+C)');
    console.log('🔌 Fechando conexão com MongoDB...');
    
    try {
        await mongoose.connection.close();
        console.log('✅ Conexão com MongoDB fechada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao fechar conexão:', error);
        process.exit(1);
    }
});

// Evento disparado quando a aplicação é terminada
process.on('SIGTERM', async () => {
    console.log('\n🛑 Recebido sinal de término');
    await mongoose.connection.close();
    process.exit(0);
});

/**
 * FUNÇÃO PARA VERIFICAR STATUS DA CONEXÃO
 * ======================================
 * 
 * Esta função retorna informações sobre o status atual da conexão.
 */
const getConnectionStatus = () => {
    const states = {
        0: 'Desconectado',
        1: 'Conectado',
        2: 'Conectando',
        3: 'Desconectando'
    };
    
    return {
        status: states[mongoose.connection.readyState],
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
    };
};

/**
 * FUNÇÃO PARA TESTAR A CONEXÃO
 * ============================
 * 
 * Esta função executa uma operação simples para testar se a conexão
 * está funcionando corretamente.
 */
const testConnection = async () => {
    try {
        // Verifica se há conexão ativa
        if (mongoose.connection.readyState !== 1) {
            return false;
        }
        
        // Executa um ping simples no banco
        await mongoose.connection.db.admin().ping();
        console.log('🏓 Ping no MongoDB executado com sucesso!');
        return true;
    } catch (error) {
        console.warn('⚠️  MongoDB não disponível para ping:', error.message);
        return false;
    }
};

// Exporta as funções para uso em outros arquivos
module.exports = {
    connectToDatabase,
    getConnectionStatus,
    testConnection,
    mongoose
};
