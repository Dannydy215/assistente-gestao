import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Download, FileText, FileSpreadsheet, Database } from 'lucide-react'

const ExportPanel = ({ tasks, onExport }) => {
  const [exportFormat, setExportFormat] = useState('json')
  const [exportFilter, setExportFilter] = useState('all')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Filtrar tarefas baseado na seleção
      let filteredTasks = tasks
      
      if (exportFilter === 'pending') {
        filteredTasks = tasks.filter(t => t.processo !== 'concluido')
      } else if (exportFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.processo === 'concluido')
      } else if (exportFilter === 'overdue') {
        filteredTasks = tasks.filter(t => {
          const hoje = new Date()
          const limite = new Date(t.dataLimite)
          return limite < hoje && t.processo !== 'concluido'
        })
      }

      // Preparar dados para exportação
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalTasks: filteredTasks.length,
        filter: exportFilter,
        format: exportFormat,
        tasks: filteredTasks.map(task => ({
          ...task,
          dataLimiteFormatted: new Date(task.dataLimite).toLocaleDateString('pt-PT'),
          createdAtFormatted: new Date(task.createdAt).toLocaleDateString('pt-PT'),
          updatedAtFormatted: new Date(task.updatedAt).toLocaleDateString('pt-PT')
        }))
      }

      if (exportFormat === 'json') {
        downloadJSON(exportData)
      } else if (exportFormat === 'csv') {
        downloadCSV(filteredTasks)
      } else if (exportFormat === 'backup') {
        downloadBackup(exportData)
      }

      if (onExport) {
        onExport(exportFormat, filteredTasks.length)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tarefas-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (tasks) => {
    const headers = [
      'Data Limite',
      'Processo',
      'Tipo',
      'Obra',
      'Entidade',
      'Código Contrato',
      'Descrição',
      'Auto Entre Empresa',
      'Observações',
      'Criado em',
      'Atualizado em'
    ]

    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        new Date(task.dataLimite).toLocaleDateString('pt-PT'),
        task.processo,
        task.tipo,
        `"${task.obra}"`,
        `"${task.entidade}"`,
        `"${task.codigoContrato || 'Não aplicável'}"`,
        `"${task.descricao}"`,
        `"${task.autoEntreEmpresa}"`,
        `"${task.observacoes || ''}"`,
        new Date(task.createdAt).toLocaleDateString('pt-PT'),
        new Date(task.updatedAt).toLocaleDateString('pt-PT')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tarefas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadBackup = (data) => {
    const backupData = {
      ...data,
      version: '1.0',
      appName: 'Assistente de Gestão',
      backupType: 'full'
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-assistente-gestao-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getFormatIcon = (format) => {
    switch (format) {
      case 'json': return <Database className="w-4 h-4" />
      case 'csv': return <FileSpreadsheet className="w-4 h-4" />
      case 'backup': return <FileText className="w-4 h-4" />
      default: return <Download className="w-4 h-4" />
    }
  }

  const getFilteredCount = () => {
    if (exportFilter === 'pending') {
      return tasks.filter(t => t.processo !== 'concluido').length
    } else if (exportFilter === 'completed') {
      return tasks.filter(t => t.processo === 'concluido').length
    } else if (exportFilter === 'overdue') {
      const hoje = new Date()
      return tasks.filter(t => {
        const limite = new Date(t.dataLimite)
        return limite < hoje && t.processo !== 'concluido'
      }).length
    }
    return tasks.length
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção do formato */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Formato de Exportação</label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  JSON (Dados estruturados)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV (Excel/Sheets)
                </div>
              </SelectItem>
              <SelectItem value="backup">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Backup Completo
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de dados */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dados a Exportar</label>
          <Select value={exportFilter} onValueChange={setExportFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as tarefas ({tasks.length})</SelectItem>
              <SelectItem value="pending">Apenas pendentes ({tasks.filter(t => t.processo !== 'concluido').length})</SelectItem>
              <SelectItem value="completed">Apenas concluídas ({tasks.filter(t => t.processo === 'concluido').length})</SelectItem>
              <SelectItem value="overdue">Apenas em atraso ({tasks.filter(t => {
                const hoje = new Date()
                const limite = new Date(t.dataLimite)
                return limite < hoje && t.processo !== 'concluido'
              }).length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Informações da exportação */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex justify-between">
            <span>Tarefas a exportar:</span>
            <span className="font-medium">{getFilteredCount()}</span>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <span className="font-medium">{new Date().toLocaleDateString('pt-PT')}</span>
          </div>
        </div>

        {/* Botão de exportação */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || tasks.length === 0}
          className="w-full flex items-center gap-2"
        >
          {getFormatIcon(exportFormat)}
          {isExporting ? 'A exportar...' : 'Exportar Dados'}
        </Button>

        {tasks.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            Nenhuma tarefa disponível para exportar
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default ExportPanel

