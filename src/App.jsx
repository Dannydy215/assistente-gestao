import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, CheckCircle, Clock, AlertTriangle, AlertCircle, Plus, Search, Filter, Edit, Trash2, Download, Settings } from 'lucide-react'
import { useTasks } from './hooks/useTasks.js'
import TaskForm from './components/TaskForm.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import { CommandParser } from './utils/commandParser.js'
import './App.css'

function App() {
  const { tasks, stats, loading, error, createTask, updateTask, deleteTask, searchTasks } = useTasks()
  const [chatInput, setChatInput] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [commandParser] = useState(() => new CommandParser())
  const [commandFeedback, setCommandFeedback] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [activeFilters, setActiveFilters] = useState({})
  const [showExport, setShowExport] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Permitir acesso por defeito

  const getStatusColor = (processo, dataLimite) => {
    const hoje = new Date()
    const limite = new Date(dataLimite)
    
    if (processo === 'concluido') return 'bg-green-100 text-green-800 border-green-200'
    if (limite < hoje) return 'bg-red-100 text-red-800 border-red-200'
    if (limite.toDateString() === hoje.toDateString()) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getStatusIcon = (processo, dataLimite) => {
    const hoje = new Date()
    const limite = new Date(dataLimite)
    
    if (processo === 'concluido') return <CheckCircle className="w-4 h-4" />
    if (limite < hoje) return <AlertCircle className="w-4 h-4" />
    if (limite.toDateString() === hoje.toDateString()) return <AlertTriangle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  const getStatusText = (processo, dataLimite) => {
    const hoje = new Date()
    const limite = new Date(dataLimite)
    
    if (processo === 'concluido') return 'Concluído'
    if (limite < hoje) return 'Em atraso'
    if (limite.toDateString() === hoje.toDateString()) return 'Pendente (hoje)'
    return 'Pendente'
  }

  const handleFilterChange = (filtered, filters) => {
    setFilteredTasks(filtered)
    setActiveFilters(filters)
  }

  // Atualizar filteredTasks quando tasks mudam
  useEffect(() => {
    if (Object.keys(activeFilters).length === 0) {
      setFilteredTasks(tasks)
    } else {
      // Reaplicar filtros
      handleFilterChange(tasks, activeFilters)
    }
  }, [tasks])

  const handleExport = (format, count) => {
    setCommandFeedback(`✅ ${count} tarefas exportadas em formato ${format.toUpperCase()}!`)
    setTimeout(() => setCommandFeedback(''), 3000)
  }

  const handleAuthChange = (authenticated) => {
    setIsAuthenticated(authenticated)
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    setCommandFeedback('')
    const result = commandParser.parseCommand(chatInput)

    if (!result.success) {
      setCommandFeedback(`❌ ${result.error}`)
      return
    }

    try {
      switch (result.action) {
        case 'createAuto':
          await createTask({
            dataLimite: result.data.dataLimite,
            tipo: result.data.tipo,
            obra: result.data.obra,
            entidade: result.data.entidade,
            descricao: result.data.descricao,
            autoEntreEmpresa: result.data.empresa || 'Não aplicável',
            observacoes: `Criado via comando: "${result.originalCommand}"`
          })
          setCommandFeedback('✅ Auto criado com sucesso!')
          break

        case 'createContract':
          await createTask({
            dataLimite: result.data.dataLimite,
            tipo: result.data.tipo,
            obra: `CONT_${Date.now()}`,
            entidade: result.data.entidade,
            descricao: result.data.descricao,
            autoEntreEmpresa: 'Não aplicável',
            observacoes: `Criado via comando: "${result.originalCommand}"`
          })
          setCommandFeedback('✅ Contrato criado com sucesso!')
          break

        case 'rescheduleTask':
          const taskToReschedule = tasks.find(t => 
            t.obra.toLowerCase().includes(result.data.obra.toLowerCase())
          )
          if (taskToReschedule) {
            await updateTask(taskToReschedule.id, {
              ...taskToReschedule,
              dataLimite: result.data.novaData
            })
            setCommandFeedback('✅ Tarefa reagendada com sucesso!')
          } else {
            setCommandFeedback('❌ Tarefa não encontrada')
          }
          break

        case 'markCompleted':
          const taskToComplete = tasks.find(t => 
            t.obra.toLowerCase().includes(result.data.obra.toLowerCase())
          )
          if (taskToComplete) {
            await updateTask(taskToComplete.id, {
              ...taskToComplete,
              processo: 'concluido'
            })
            setCommandFeedback('✅ Tarefa marcada como concluída!')
          } else {
            setCommandFeedback('❌ Tarefa não encontrada')
          }
          break

        case 'showWeeklyPending':
          // Implementar filtro de tarefas pendentes da semana
          setCommandFeedback('📋 Mostrando tarefas pendentes da semana')
          break

        default:
          setCommandFeedback('❌ Ação não implementada')
      }

      setChatInput('')
    } catch (error) {
      setCommandFeedback(`❌ Erro ao executar comando: ${error.message}`)
    }
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
      } else {
        await createTask(taskData)
      }
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Erro ao guardar tarefa:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Tem certeza que deseja eliminar esta tarefa?')) {
      try {
        await deleteTask(taskId)
      } catch (error) {
        console.error('Erro ao eliminar tarefa:', error)
      }
    }
  }

  const handleCancelForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  if (showTaskForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <TaskForm
          task={editingTask}
          onSubmit={handleTaskSubmit}
          onCancel={handleCancelForm}
          loading={loading}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Assistente de Gestão
            </h1>
            <p className="text-gray-600 mt-1">Contratos, Autos e Tarefas</p>
          </div>
          <div className="flex gap-3">
            <FilterPanel 
              tasks={tasks}
              onFilterChange={handleFilterChange}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAuth(!showAuth)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Button>
            <Button onClick={handleNewTask} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Painel Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.pendentes}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Em Atraso</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.emAtraso}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Concluídos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.concluidos}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Tarefas */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">A carregar...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>                        <tr className="bg-gray-50">
                          <th className="text-left p-3 font-medium text-gray-600">Data Limite</th>
                          <th className="text-left p-3 font-medium text-gray-600">Processo</th>
                          <th className="text-left p-3 font-medium text-gray-600">Tipo</th>
                          <th className="text-left p-3 font-medium text-gray-600">Obra</th>
                          <th className="text-left p-3 font-medium text-gray-600">Entidade</th>
                          <th className="text-left p-3 font-medium text-gray-600">Código Contrato</th>
                          <th className="text-left p-3 font-medium text-gray-600">Descrição</th>
                          <th className="text-left p-3 font-medium text-gray-600">Auto Entre Empresa</th>
                          <th className="text-left p-3 font-medium text-gray-600">Observações</th>
                          <th className="text-left p-3 font-medium text-gray-600">Ações</th>
                        </tr>                      </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                          {Object.keys(activeFilters).some(key => activeFilters[key]) 
                            ? 'Nenhuma tarefa encontrada com os filtros aplicados.'
                            : 'Nenhuma tarefa encontrada. Clique em "Nova Tarefa" para começar.'
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                            <tr key={task.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{new Date(task.dataLimite).toLocaleDateString('pt-PT')}</td>
                              <td className="p-3">
                                <Badge className={`${getStatusColor(task.processo, task.dataLimite)} flex items-center gap-1 w-fit`}>
                                  {getStatusIcon(task.processo, task.dataLimite)}
                                  {getStatusText(task.processo, task.dataLimite)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge variant="outline">{task.tipo}</Badge>
                              </td>
                              <td className="p-3 font-medium">{task.obra}</td>
                              <td className="p-3">{task.entidade}</td>
                              <td className="p-3 font-mono text-sm text-blue-600">{task.codigoContrato || 'Não aplicável'}</td>
                              <td className="p-3">{task.descricao}</td>
                              <td className="p-3">
                                <span className={task.autoEntreEmpresa === 'Não aplicável' ? 'text-gray-500' : 'text-blue-600 font-medium'}>
                                  {task.autoEntreEmpresa}
                                </span>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {task.observacoes || '-'}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingTask(task)
                                      setShowTaskForm(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Painel de Chat */}
          <div className="lg:col-span-1 space-y-4">
              {/* Painel de Comandos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Comandos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleChatSubmit} className="space-y-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ex: Criar auto para segunda-feira..."
                      className="w-full"
                    />
                    <Button type="submit" className="w-full">
                      Executar Comando
                    </Button>
                  </form>

                  {commandFeedback && (
                    <div className={`p-3 rounded-lg text-sm ${
                      commandFeedback.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {commandFeedback}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Exemplos de comandos:</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      {commandParser.getExamples().map((example, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          "{example}"
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Painel de Exportação */}
              {showExport && (
                <ExportPanel 
                  tasks={tasks}
                  onExport={handleExport}
                />
              )}

              {/* Painel de Autenticação */}
              {showAuth && (
                <AuthPanel 
                  onAuthChange={handleAuthChange}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

