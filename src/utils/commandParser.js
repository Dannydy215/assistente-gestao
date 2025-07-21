// Parser de comandos de texto para o assistente de gestão
export class CommandParser {
  constructor() {
    this.patterns = [
      {
        pattern: /(?:fazer|criar)\s+auto\s+à\s+(.+?),?\s+na\s+(.+?),?\s+obra\s+(.+?)\s+para\s+(.+?),?\s+contrato\s+(.+)/i,
        action: 'createAuto',
        extract: (match) => ({
          dataLimite: this.parseDate(match[4]),
          tipo: 'Auto',
          empresa: match[2],
          entidade: match[1],
          obra: match[3],
          codigoContrato: match[5],
          autoEntreEmpresa: match[2],
          descricao: `Auto de medição para ${match[1]} - ${match[3]}`
        })
      },
      {
        pattern: /(?:fazer|criar)\s+auto\s+à\s+(.+?),?\s+na\s+(.+?),?\s+obra\s+(.+?)\s+para\s+(.+)/i,
        action: 'createAuto',
        extract: (match) => ({
          dataLimite: this.parseDate(match[4]),
          tipo: 'Auto',
          empresa: match[2],
          entidade: match[1],
          obra: match[3],
          codigoContrato: 'Não aplicável',
          autoEntreEmpresa: match[2],
          descricao: `Auto de medição para ${match[1]} - ${match[3]}`
        })
      },
      {
        pattern: /criar\s+auto\s+para\s+(.+?)\s+na\s+(.+?)\s+à\s+(.+?),?\s*código\s+(.+)/i,
        action: 'createAuto',
        extract: (match) => ({
          dataLimite: this.parseDate(match[1]),
          tipo: 'Auto',
          empresa: match[2],
          entidade: match[3],
          obra: 'Obra não especificada',
          codigoContrato: match[4],
          autoEntreEmpresa: match[2],
          descricao: `Auto de medição para ${match[3]}`
        })
      },
      {
        pattern: /auto\s+(.+?)\s+reagenda\s+para\s+(.+)/i,
        action: 'rescheduleTask',
        extract: (match) => ({
          codigoContrato: match[1],
          novaData: this.parseDate(match[2])
        })
      },
      {
        pattern: /mostrar\s+pendentes\s+para\s+esta\s+semana/i,
        action: 'showWeeklyPending',
        extract: () => ({
          periodo: 'semana'
        })
      },
      {
        pattern: /criar\s+contrato\s+(.+?)\s+para\s+(.+?)\s+em\s+(.+)/i,
        action: 'createContract',
        extract: (match) => ({
          tipo: 'Contrato',
          descricao: match[1],
          entidade: match[2],
          obra: 'Contrato geral',
          codigoContrato: 'Não aplicável',
          autoEntreEmpresa: 'Não aplicável',
          dataLimite: this.parseDate(match[3])
        })
      },
      {
        pattern: /marcar\s+(.+?)\s+como\s+concluído/i,
        action: 'markCompleted',
        extract: (match) => ({
          codigoContrato: match[1],
          processo: 'concluido'
        })
      }
    ]
  }

  parseDate(dateString) {
    const today = new Date()
    const dateStr = dateString.toLowerCase().trim()

    // Padrões de data em português
    if (dateStr.includes('segunda')) {
      return this.getNextWeekday(1) // Segunda-feira
    } else if (dateStr.includes('terça')) {
      return this.getNextWeekday(2) // Terça-feira
    } else if (dateStr.includes('quarta')) {
      return this.getNextWeekday(3) // Quarta-feira
    } else if (dateStr.includes('quinta')) {
      return this.getNextWeekday(4) // Quinta-feira
    } else if (dateStr.includes('sexta')) {
      return this.getNextWeekday(5) // Sexta-feira
    } else if (dateStr.includes('sábado')) {
      return this.getNextWeekday(6) // Sábado
    } else if (dateStr.includes('domingo')) {
      return this.getNextWeekday(0) // Domingo
    } else if (dateStr.includes('amanhã')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    } else if (dateStr.includes('hoje')) {
      return today.toISOString().split('T')[0]
    } else if (dateStr.includes('próxima semana')) {
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      return nextWeek.toISOString().split('T')[0]
    }

    // Tentar formatos de data específicos
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // dd/mm/yyyy
      /(\d{4})-(\d{1,2})-(\d{1,2})/,   // yyyy-mm-dd
      /(\d{1,2})-(\d{1,2})-(\d{4})/    // dd-mm-yyyy
    ]

    for (const pattern of datePatterns) {
      const match = dateStr.match(pattern)
      if (match) {
        if (pattern.source.includes('\\d{4}-')) {
          // yyyy-mm-dd
          return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
        } else {
          // dd/mm/yyyy ou dd-mm-yyyy
          return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
        }
      }
    }

    // Se não conseguir interpretar, retorna data de hoje + 1 dia
    const fallback = new Date(today)
    fallback.setDate(today.getDate() + 1)
    return fallback.toISOString().split('T')[0]
  }

  getNextWeekday(targetDay) {
    const today = new Date()
    const currentDay = today.getDay()
    let daysUntilTarget = targetDay - currentDay

    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7 // Próxima semana
    }

    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget)
    return targetDate.toISOString().split('T')[0]
  }

  parseCommand(commandText) {
    const cleanCommand = commandText.trim()
    
    if (!cleanCommand) {
      return { success: false, error: 'Comando vazio' }
    }

    for (const { pattern, action, extract } of this.patterns) {
      const match = cleanCommand.match(pattern)
      if (match) {
        try {
          const data = extract(match)
          return {
            success: true,
            action,
            data,
            originalCommand: cleanCommand
          }
        } catch (error) {
          return {
            success: false,
            error: `Erro ao processar comando: ${error.message}`
          }
        }
      }
    }

    return {
      success: false,
      error: 'Comando não reconhecido. Tente um dos exemplos disponíveis.'
    }
  }

  getExamples() {
    return [
      'Fazer auto à Confrasilvas, na VIC C, obra Club House para Terça, contrato VIC_0725',
      'Criar auto para segunda-feira na VIC C à Confrasilvas, código VIC_0725',
      'Auto VIC_0725 reagenda para próxima quinta',
      'Mostrar pendentes para esta semana',
      'Criar contrato renovação anual para Construtora Silva em 15/02/2025',
      'Marcar VIC_0725 como concluído'
    ]
  }

  getSuggestions(partialCommand) {
    const partial = partialCommand.toLowerCase()
    const suggestions = []

    if (partial.includes('criar') || partial.includes('fazer')) {
      suggestions.push('Fazer auto à [entidade], na [empresa], obra [nome obra] para [dia], contrato [código]')
      suggestions.push('Criar contrato [descrição] para [entidade] em [data]')
    }

    if (partial.includes('reagenda') || partial.includes('alterar')) {
      suggestions.push('Auto [código contrato] reagenda para [nova data]')
    }

    if (partial.includes('mostrar') || partial.includes('listar')) {
      suggestions.push('Mostrar pendentes para esta semana')
    }

    if (partial.includes('marcar') || partial.includes('concluir')) {
      suggestions.push('Marcar [código contrato] como concluído')
    }

    return suggestions.length > 0 ? suggestions : this.getExamples()
  }
}

