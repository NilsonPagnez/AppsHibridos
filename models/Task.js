/**
 * MODELO DE TAREFA
 * ================
 * 
 * Este arquivo define o schema e modelo para tarefas no MongoDB
 * usando Mongoose ODM.
 */

const mongoose = require('mongoose');

/**
 * SCHEMA DA TAREFA
 * ================
 * 
 * Define a estrutura dos dados de uma tarefa no banco de dados.
 * Inclui validações, tipos de dados e configurações específicas.
 */
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título da tarefa é obrigatório'],
        trim: true,
        maxlength: [100, 'O título não pode ter mais de 100 caracteres'],
        minlength: [1, 'O título deve ter pelo menos 1 caractere']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'A descrição não pode ter mais de 500 caracteres'],
        default: ''
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: 'Prioridade deve ser: low, medium ou high'
        },
        default: 'medium'
    },
    category: {
        type: String,
        enum: {
            values: ['work', 'personal', 'study', 'health', 'other'],
            message: 'Categoria deve ser: work, personal, study, health ou other'
        },
        default: 'work'
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function(value) {
                // Se não há data de vencimento, é válido
                if (!value) return true;
                // Se há data, deve ser no futuro
                return value > new Date();
            },
            message: 'A data de vencimento deve ser no futuro'
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Configurações adicionais do schema
    timestamps: true, // Adiciona automaticamente createdAt e updatedAt
    versionKey: false, // Remove o campo __v
    toJSON: { virtuals: true }, // Inclui campos virtuais no JSON
    toObject: { virtuals: true }
});

/**
 * ÍNDICES DO BANCO DE DADOS
 * =========================
 * 
 * Índices melhoram a performance das consultas.
 */
taskSchema.index({ title: 'text', description: 'text' }); // Índice de texto para busca
taskSchema.index({ completed: 1 }); // Índice para filtrar por status
taskSchema.index({ priority: 1 }); // Índice para filtrar por prioridade
taskSchema.index({ category: 1 }); // Índice para filtrar por categoria
taskSchema.index({ dueDate: 1 }); // Índice para ordenar por data de vencimento
taskSchema.index({ createdAt: -1 }); // Índice para ordenar por data de criação

/**
 * CAMPOS VIRTUAIS
 * ===============
 * 
 * Campos calculados que não são armazenados no banco de dados.
 */
taskSchema.virtual('isOverdue').get(function() {
    if (!this.dueDate || this.completed) return false;
    return this.dueDate < new Date();
});

taskSchema.virtual('priorityText').get(function() {
    const priorities = {
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    };
    return priorities[this.priority] || this.priority;
});

taskSchema.virtual('categoryText').get(function() {
    const categories = {
        'work': 'Trabalho',
        'personal': 'Pessoal',
        'study': 'Estudos',
        'health': 'Saúde',
        'other': 'Outros'
    };
    return categories[this.category] || this.category;
});

/**
 * MIDDLEWARE PRE-SAVE
 * ===================
 * 
 * Executa antes de salvar o documento no banco de dados.
 */
taskSchema.pre('save', function(next) {
    // Atualiza o campo updatedAt
    this.updatedAt = new Date();
    
    // Se a tarefa foi marcada como concluída, define completedAt
    if (this.isModified('completed') && this.completed && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    // Se a tarefa foi desmarcada como concluída, remove completedAt
    if (this.isModified('completed') && !this.completed) {
        this.completedAt = null;
    }
    
    next();
});

/**
 * MÉTODOS DE INSTÂNCIA
 * ====================
 * 
 * Métodos que podem ser chamados em instâncias específicas do modelo.
 */
taskSchema.methods.toggleComplete = function() {
    this.completed = !this.completed;
    return this.save();
};

taskSchema.methods.updatePriority = function(newPriority) {
    this.priority = newPriority;
    return this.save();
};

/**
 * MÉTODOS ESTÁTICOS
 * =================
 * 
 * Métodos que podem ser chamados diretamente no modelo.
 */
taskSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: { $sum: { $cond: ['$completed', 1, 0] } },
                pending: { $sum: { $cond: ['$completed', 0, 1] } }
            }
        }
    ]);
    
    if (stats.length === 0) {
        return {
            total: 0,
            completed: 0,
            pending: 0,
            completionRate: 0
        };
    }
    
    const result = stats[0];
    result.completionRate = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;
    
    return result;
};

taskSchema.statics.getRecentTasks = async function(limit = 5) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title completed priority category dueDate createdAt');
};

taskSchema.statics.searchTasks = async function(query, filters = {}) {
    const searchQuery = {};
    
    // Busca por texto
    if (query) {
        searchQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    
    // Filtros adicionais
    if (filters.status) {
        if (filters.status === 'completed') {
            searchQuery.completed = true;
        } else if (filters.status === 'pending') {
            searchQuery.completed = false;
        }
    }
    
    if (filters.priority) {
        searchQuery.priority = filters.priority;
    }
    
    if (filters.category) {
        searchQuery.category = filters.category;
    }
    
    return this.find(searchQuery)
        .sort({ createdAt: -1 })
        .select('title description priority category dueDate completed createdAt updatedAt');
};

/**
 * EXPORTAÇÃO DO MODELO
 * ====================
 * 
 * Cria e exporta o modelo Task para uso em outros arquivos.
 */
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
