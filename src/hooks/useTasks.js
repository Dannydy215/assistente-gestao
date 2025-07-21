import { useState } from 'react'

// Função para gerar ID único
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// Armazenamento local temporário
const getLocalTasks = () => {
  try {
    const stored = localStorage.getItem('assistente-gestao-tasks')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocalTasks = (tasks) => {
  try {
    localStorage.setItem('assistente-gestao-tasks', JSON.stringify(tasks))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

export const useTasks = () => {
  const [tasks, setTasks] = useState(getLocalTasks())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Calcular estatísticas
  const stats = {
    total: tasks.length,
    pendentes: tasks.filter(t => t.processo !== 'concluido').length,
    emAtraso: tasks.filter(t => {
      if (t.processo === 'concluido') return false
      const hoje = new Date()
      const limite = new Date(t.dataLimite)
      return limite < hoje
    }).length,
    concluidos: tasks.filter(t => t.processo === 'concluido').length
  }

  // Função para criar tarefa
  const createTask = async (taskData) => {
    setLoading(true)
    setError(null)
    
    try {
      const newTask = {
        id: generateId(),
        ...taskData,
        processo: 'pendente',
        codigoContrato: taskData.codigoContrato || 'Não aplicável',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      setLocalTasks(updatedTasks)
      
      return newTask
    } catch (err) {
      setError('Erro ao criar tarefa')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Função para atualizar tarefa
  const updateTask = async (id, taskData) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedTasks = tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
      )
      
      setTasks(updatedTasks)
      setLocalTasks(updatedTasks)
      
      return updatedTasks.find(t => t.id === id)
    } catch (err) {
      setError('Erro ao atualizar tarefa')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Função para eliminar tarefa
  const deleteTask = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedTasks = tasks.filter(task => task.id !== id)
      setTasks(updatedTasks)
      setLocalTasks(updatedTasks)
    } catch (err) {
      setError('Erro ao eliminar tarefa')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Função para pesquisar tarefas
  const searchTasks = (query) => {
    if (!query) return tasks
    
    const lowerQuery = query.toLowerCase()
    return tasks.filter(task => 
      task.obra.toLowerCase().includes(lowerQuery) ||
      task.entidade.toLowerCase().includes(lowerQuery) ||
      task.descricao.toLowerCase().includes(lowerQuery) ||
      task.tipo.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    tasks,
    stats,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    searchTasks
  }
}

