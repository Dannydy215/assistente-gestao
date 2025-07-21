import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { X } from 'lucide-react'

const TaskForm = ({ task = null, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    dataLimite: task?.dataLimite || '',
    processo: task?.processo || 'pendente',
    tipo: task?.tipo || '',
    obra: task?.obra || '',
    entidade: task?.entidade || '',
    descricao: task?.descricao || '',
    autoEntreEmpresa: task?.autoEntreEmpresa || 'Não aplicável',
    observacoes: task?.observacoes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataLimite">Data Limite *</Label>
              <Input
                id="dataLimite"
                type="date"
                value={formData.dataLimite}
                onChange={(e) => handleChange('dataLimite', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                  <SelectItem value="Aditamento">Aditamento</SelectItem>
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="obra">Obra *</Label>
              <Input
                id="obra"
                value={formData.obra}
                onChange={(e) => handleChange('obra', e.target.value)}
                placeholder="Ex: VIC_0725"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="entidade">Entidade *</Label>
              <Input
                id="entidade"
                value={formData.entidade}
                onChange={(e) => handleChange('entidade', e.target.value)}
                placeholder="Ex: Confrasilvas"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autoEntreEmpresa">Auto Entre Empresa</Label>
            <Select 
              value={formData.autoEntreEmpresa} 
              onValueChange={(value) => handleChange('autoEntreEmpresa', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Não aplicável">Não aplicável</SelectItem>
                <SelectItem value="VIC C">VIC C</SelectItem>
                <SelectItem value="HPR">HPR</SelectItem>
                <SelectItem value="HPII">HPII</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais"
            />
          </div>

          {task && (
            <div className="space-y-2">
              <Label htmlFor="processo">Estado</Label>
              <Select 
                value={formData.processo} 
                onValueChange={(value) => handleChange('processo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'A guardar...' : (task ? 'Atualizar' : 'Criar Tarefa')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default TaskForm

