/**
 * MODELO DE PROJETO
 * =================
 * 
 * Este arquivo define o schema e modelo para projetos no MongoDB
 * usando Mongoose ODM.
 */

const mongoose = require('mongoose');

/**
 * SCHEMA DO PROJETO
 * =================
 * 
 * Define a estrutura dos dados de um projeto no banco de dados.
 * Cada projeto pode conter várias tarefas vinculadas.
 */
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome do projeto é obrigatório'],
        trim: true,
        maxlength: [100, 'O nome do projeto não pode ter mais de 100 caracteres'],
        minlength: [1, 'O nome do projeto deve ter pelo menos 1 caractere']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'A descrição não pode ter mais de 1000 caracteres'],
        default: ''
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task', // Faz referência ao modelo de tarefas
        default: []
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * ÍNDICES
 * =======
 * Melhora a performance nas buscas por nome e data de criação.
 */
projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ createdAt: -1 });

/**
 * MIDDLEWARE PRE-SAVE
 * ===================
 * Atualiza o campo updatedAt sempre que o documento for salvo.
 */
projectSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

/**
 * CAMPOS VIRTUAIS
 * ===============
 * Campos calculados, não armazenados no banco.
 */
projectSchema.virtual('taskCount').get(function() {
    return this.tasks ? this.tasks.length : 0;
});

/**
 * MÉTODOS DE INSTÂNCIA
 * ====================
 * Funções que podem ser chamadas em instâncias do modelo.
 */
projectSchema.methods.addTask = function(taskId) {
    if (!this.tasks.includes(taskId)) {
        this.tasks.push(taskId);
    }
    return this.save();
};

projectSchema.methods.removeTask = function(taskId) {
    this.tasks = this.tasks.filter(id => id.toString() !== taskId.toString());
    return this.save();
};

projectSchema.methods.clearTasks = function() {
    this.tasks = [];
    return this.save();
};

/**
 * MÉTODOS ESTÁTICOS
 * =================
 * Funções que podem ser chamadas diretamente no modelo Project.
 */
projectSchema.statics.getProjectsWithTasks = async function() {
    return this.find()
        .populate({
            path: 'tasks',
            select: 'title description priority category completed dueDate'
        })
        .sort({ createdAt: -1 });
};

projectSchema.statics.searchProjects = async function(query) {
    const searchQuery = {};
    
    if (query) {
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    return this.find(searchQuery)
        .sort({ createdAt: -1 })
        .select('name description createdAt updatedAt');
};

/**
 * EXPORTAÇÃO DO MODELO
 * ====================
 */
const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
