import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Filter, X, Search } from 'lucide-react'

const FilterPanel = ({ tasks, onFilterChange, isOpen, onToggle }) => {
  const [filters, setFilters] = useState({
    processo: '',
    tipo: '',
    empresa: '',
    entidade: '',
    obra: '',
    searchText: ''
  })

  // Extrair valores únicos para os dropdowns
  const uniqueProcessos = [...new Set(tasks.map(t => t.processo))].filter(Boolean)
  const uniqueTipos = [...new Set(tasks.map(t => t.tipo))].filter(Boolean)
  const uniqueEmpresas = [...new Set(tasks.map(t => t.autoEntreEmpresa))].filter(Boolean)
  const uniqueEntidades = [...new Set(tasks.map(t => t.entidade))].filter(Boolean)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Aplicar filtros
    let filteredTasks = tasks

    if (newFilters.processo) {
      filteredTasks = filteredTasks.filter(task => task.processo === newFilters.processo)
    }

    if (newFilters.tipo) {
      filteredTasks = filteredTasks.filter(task => task.tipo === newFilters.tipo)
    }

    if (newFilters.empresa) {
      filteredTasks = filteredTasks.filter(task => task.autoEntreEmpresa === newFilters.empresa)
    }

    if (newFilters.entidade) {
      filteredTasks = filteredTasks.filter(task => task.entidade === newFilters.entidade)
    }

    if (newFilters.obra) {
      filteredTasks = filteredTasks.filter(task => 
        task.obra.toLowerCase().includes(newFilters.obra.toLowerCase())
      )
    }

    if (newFilters.searchText) {
      const searchLower = newFilters.searchText.toLowerCase()
      filteredTasks = filteredTasks.filter(task =>
        task.obra.toLowerCase().includes(searchLower) ||
        task.entidade.toLowerCase().includes(searchLower) ||
        task.descricao.toLowerCase().includes(searchLower) ||
        task.tipo.toLowerCase().includes(searchLower)
      )
    }

    onFilterChange(filteredTasks, newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      processo: '',
      tipo: '',
      empresa: '',
      entidade: '',
      obra: '',
      searchText: ''
    }
    setFilters(emptyFilters)
    onFilterChange(tasks, emptyFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtros
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pesquisa geral */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Pesquisa Geral</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar em todas as colunas..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro por Processo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={filters.processo} onValueChange={(value) => handleFilterChange('processo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os estados</SelectItem>
                {uniqueProcessos.map(processo => (
                  <SelectItem key={processo} value={processo}>
                    {processo === 'concluido' ? 'Concluído' : 
                     processo === 'pendente' ? 'Pendente' : processo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={filters.tipo} onValueChange={(value) => handleFilterChange('tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {uniqueTipos.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Empresa */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Empresa</label>
            <Select value={filters.empresa} onValueChange={(value) => handleFilterChange('empresa', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as empresas</SelectItem>
                {uniqueEmpresas.map(empresa => (
                  <SelectItem key={empresa} value={empresa}>
                    {empresa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Entidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entidade</label>
            <Select value={filters.entidade} onValueChange={(value) => handleFilterChange('entidade', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as entidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as entidades</SelectItem>
                {uniqueEntidades.map(entidade => (
                  <SelectItem key={entidade} value={entidade}>
                    {entidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Obra */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Obra</label>
            <Input
              placeholder="Código da obra..."
              value={filters.obra}
              onChange={(e) => handleFilterChange('obra', e.target.value)}
            />
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FilterPanel

