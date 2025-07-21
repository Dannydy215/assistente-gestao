import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, AlertTriangle, AlertCircle, Plus, Search, Filter, Edit, Trash2, Download, Settings, LogOut } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './hooks/useAuth';
import TaskForm from './components/TaskForm';
import FilterPanel from './components/FilterPanel';
import ExportPanel from './components/ExportPanel';
import AuthPanel from './components/AuthPanel';
import { LoginForm } from './components/LoginForm';
import './App.css';

function App() {
  const { user, isAuthenticated, loading: authLoading, error: authError, register, login, logout } = useAuth();
  const { tasks, stats, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, processCommand, loadTasks } = useTasks();
  
  const [chatInput, setChatInput] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [commandFeedback, setCommandFeedback] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [showExport, setShowExport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, loadTasks]);

  useEffect(() => {
    let tempTasks = tasks;

    if (activeFilters.status && activeFilters.status !== 'todos') {
      tempTasks = tempTasks.filter(task => task.processo === activeFilters.status);
    }
    if (activeFilters.company && activeFilters.company !== 'todas') {
      tempTasks = tempTasks.filter(task => task.entidade === activeFilters.company);
    }
    if (activeFilters.type && activeFilters.type !== 'todos') {
      tempTasks = tempTasks.filter(task => task.tipo === activeFilters.type);
    }
    if (activeFilters.work && activeFilters.work !== 'todas') {
      tempTasks = tempTasks.filter(task => task.obra === activeFilters.work);
    }

    setFilteredTasks(tempTasks);
  }, [tasks, activeFilters]);

  const getStatusColor = (processo, dataLimite) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    
    if (processo === 'concluido') return 'bg-green-100 text-green-800 border-green-200';
    if (limite < hoje) return 'bg-red-100 text-red-800 border-red-200';
    if (limite.toDateString() === hoje.toDateString()) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = (processo, dataLimite) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    
    if (processo === 'concluido') return <CheckCircle className="w-4 h-4" />;
    if (limite < hoje) return <AlertCircle className="w-4 h-4" />;
    if (limite.toDateString() === hoje.toDateString()) return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusText = (processo, dataLimite) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    
    if (processo === 'concluido') return 'Concluído';
    if (limite < hoje) return 'Em atraso';
    if (limite.toDateString() === hoje.toDateString()) return 'Pendente (hoje)';
    return 'Pendente';
  };

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setCommandFeedback('A processar comando...');
    const result = await processCommand(chatInput);
    setCommandFeedback(result.message);
    setChatInput('');
    loadTasks();
  };

  const handleTaskSubmit = async (taskData) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      await createTask(taskData);
    }
    setShowTaskForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Tem certeza que deseja eliminar esta tarefa?')) {
      await deleteTask(id);
      loadTasks();
    }
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleExport = async (format, filter) => {
    // Lógica de exportação adaptada para o backend
    alert(`Exportar ${filter} em formato ${format}`);
  };

  const handleAuthSubmit = async (password) => {
    // Lógica de autenticação adaptada para o backend
    alert(`Autenticar com password: ${password}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>A carregar autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={login}
        onRegister={register}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white p-6 shadow-md flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Assistente de Gestão</h1>

        {user && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">Bem-vindo(a),</p>
            <p className="font-semibold text-lg text-gray-800">{user.username}</p>
            <Button variant="link" className="p-0 h-auto text-sm text-blue-600" onClick={logout}>
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        )}

        <nav className="space-y-4 flex-grow">
          <Button className="w-full justify-start" variant="ghost" onClick={() => {
            setShowTaskForm(true);
            setEditingTask(null);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
          </Button>
          <Button className="w-full justify-start" variant="ghost" onClick={() => {
            setShowFilters(!showFilters);
            setShowExport(false);
            setShowAuth(false);
          }}>
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Button className="w-full justify-start" variant="ghost" onClick={() => {
            setShowExport(!showExport);
            setShowFilters(false);
            setShowAuth(false);
          }}>
            <Download className="mr-2 h-4 w-4" /> Exportar Dados
          </Button>
          <Button className="w-full justify-start" variant="ghost" onClick={() => {
            setShowAuth(!showAuth);
            setShowFilters(false);
            setShowExport(false);
          }}>
            <Settings className="mr-2 h-4 w-4" /> Configurações
          </Button>
        </nav>

        {showFilters && (
          <div className="mt-6">
            <FilterPanel onFilterChange={handleFilterChange} activeFilters={activeFilters} tasks={tasks} />
          </div>
        )}

        {showExport && (
          <div className="mt-6">
            <ExportPanel onExport={handleExport} tasks={tasks} />
          </div>
        )}

        {showAuth && (
          <div className="mt-6">
            <AuthPanel onAuth={handleAuthSubmit} />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 space-y-6 overflow-auto">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <Badge className="bg-blue-200 text-blue-800">{stats.total}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Badge className="bg-yellow-200 text-yellow-800">{stats.pendentes + stats.pendenteHoje}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendentes + stats.pendenteHoje}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
              <Badge className="bg-red-200 text-red-800">{stats.emAtraso}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emAtraso}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Badge className="bg-green-200 text-green-800">{stats.concluidos}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.concluidos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <p>A carregar tarefas...</p>
            ) : tasksError ? (
              <p className="text-red-500">Erro ao carregar tarefas: {tasksError}</p>
            ) : filteredTasks.length === 0 ? (
              <p>Nenhuma tarefa encontrada. Crie uma nova tarefa ou ajuste os filtros.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Limite</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Obra</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Contrato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto entre empresa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observações</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(task.dataLimite).toLocaleDateString('pt-PT')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.processo, task.dataLimite)}`}>
                            {getStatusIcon(task.processo, task.dataLimite)}
                            <span className="ml-1">{getStatusText(task.processo, task.dataLimite)}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.obra}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.entidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.codigoContrato || 'Não aplicável'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.descricao}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.autoEntreEmpresa}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.observacoes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="text-blue-600 hover:text-blue-900">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-900 ml-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comandos de Texto */}
        <Card>
          <CardHeader>
            <CardTitle>Comandos de Texto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommandSubmit} className="flex space-x-2">
              <Input 
                type="text" 
                placeholder="Digite um comando..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                className="flex-grow" 
              />
              <Button type="submit">Enviar</Button>
            </form>
            {commandFeedback && <p className="mt-2 text-sm text-gray-600">{commandFeedback}</p>}
          </CardContent>
        </Card>

        {/* Modal de Formulário de Tarefa */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <TaskForm 
              onSubmit={handleTaskSubmit} 
              onCancel={() => { 
                setShowTaskForm(false); 
                setEditingTask(null); 
              }} 
              initialData={editingTask} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

