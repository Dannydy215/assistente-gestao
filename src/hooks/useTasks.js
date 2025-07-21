import { useState, useEffect } from 'react'

const API_BASE_URL = 'https://5000-iexvrgi29lm247wn99les-e7684047.manusvm.computer/api' // URL do backend Flask local

export const useTasks = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Carregar tarefas do servidor
  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Importante para enviar cookies de sessão
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      } else if (response.status === 401) {
        setError('Não autenticado')
        setTasks([])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar tarefas')
      }
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err)
      setError('Erro de rede ou servidor')
    } finally {
      setLoading(false)
    }
  }

  // Carregar tarefas quando o componente é montado
  useEffect(() => {
    loadTasks()
  }, [])

  // Calcular estatísticas
  const stats = {
    total: tasks.length,
    pendentes: tasks.filter(t => t.processo === 'pendente').length,
    emAtraso: tasks.filter(t => t.processo === 'em-atraso').length,
    concluidos: tasks.filter(t => t.processo === 'concluido').length,
    pendenteHoje: tasks.filter(t => t.processo === 'pendente-hoje').length
  }

  // Função para criar tarefa
  const createTask = async (taskData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
        credentials: 'include'
      })
      
      if (response.ok) {
        const newTask = await response.json()
        setTasks(prevTasks => [...prevTasks, newTask])
        return newTask
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar tarefa')
        throw new Error(errorData.error || 'Erro ao criar tarefa')
      }
    } catch (err) {
      console.error('Erro ao criar tarefa:', err)
      setError(err.message || 'Erro ao criar tarefa')
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
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
        credentials: 'include'
      })
      
      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === id ? updatedTask : task)
        )
        return updatedTask
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao atualizar tarefa')
        throw new Error(errorData.error || 'Erro ao atualizar tarefa')
      }
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err)
      setError(err.message || 'Erro ao atualizar tarefa')
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
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao eliminar tarefa')
        throw new Error(errorData.error || 'Erro ao eliminar tarefa')
      }
    } catch (err) {
      console.error('Erro ao eliminar tarefa:', err)
      setError(err.message || 'Erro ao eliminar tarefa')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Função para processar comandos
  const processCommand = async (command) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/command/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Se foi criada uma nova tarefa, adicionar à lista
        if (data.task) {
          setTasks(prevTasks => {
            // Verificar se a tarefa já existe (para evitar duplicatas)
            const exists = prevTasks.some(t => t.id === data.task.id)
            if (!exists) {
              return [...prevTasks, data.task]
            }
            // Se existe, atualizar
            return prevTasks.map(t => t.id === data.task.id ? data.task : t)
          })
        }
        
        // Se foram retornadas múltiplas tarefas (ex: comando "mostrar pendentes")
        if (data.tasks) {
          // Não substituir todas as tarefas, apenas retornar as encontradas
          return { success: true, message: data.message, tasks: data.tasks }
        }
        
        return { success: true, message: data.message }
      } else {
        setError(data.message || 'Erro ao processar comando')
        return { success: false, message: data.message || 'Erro ao processar comando' }
      }
    } catch (err) {
      console.error('Erro ao processar comando:', err)
      setError('Erro de rede ou servidor')
      return { success: false, message: 'Erro de rede ou servidor' }
    } finally {
      setLoading(false)
    }
  }

  // Função para sincronizar tarefas
  const syncTasks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tasks: tasks,
          lastSync: localStorage.getItem('lastSync')
        }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
        localStorage.setItem('lastSync', data.syncTime)
        return { success: true, message: 'Sincronização concluída' }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro na sincronização')
        return { success: false, message: errorData.error || 'Erro na sincronização' }
      }
    } catch (err) {
      console.error('Erro na sincronização:', err)
      setError('Erro de rede ou servidor')
      return { success: false, message: 'Erro de rede ou servidor' }
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
      task.tipo.toLowerCase().includes(lowerQuery) ||
      (task.codigoContrato && task.codigoContrato.toLowerCase().includes(lowerQuery))
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
    processCommand,
    syncTasks,
    searchTasks,
    loadTasks
  }
}

