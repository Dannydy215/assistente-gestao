import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Lock, Unlock, User, Eye, EyeOff } from 'lucide-react'

const AuthPanel = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [savedPassword, setSavedPassword] = useState('')

  // Carregar configuração de autenticação do localStorage
  useEffect(() => {
    const authConfig = localStorage.getItem('assistente-gestao-auth')
    if (authConfig) {
      const config = JSON.parse(authConfig)
      setSavedPassword(config.password || '')
      setIsAuthenticated(config.isAuthenticated || false)
    }
  }, [])

  // Notificar mudanças de autenticação
  useEffect(() => {
    if (onAuthChange) {
      onAuthChange(isAuthenticated)
    }
  }, [isAuthenticated, onAuthChange])

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    if (!savedPassword) {
      // Primeira configuração - definir password
      if (password.length < 4) {
        setError('A password deve ter pelo menos 4 caracteres')
        return
      }
      
      const authConfig = {
        password: password,
        isAuthenticated: true,
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem('assistente-gestao-auth', JSON.stringify(authConfig))
      setSavedPassword(password)
      setIsAuthenticated(true)
      setPassword('')
      
    } else {
      // Login com password existente
      if (password === savedPassword) {
        const authConfig = {
          password: savedPassword,
          isAuthenticated: true,
          lastLogin: new Date().toISOString()
        }
        
        localStorage.setItem('assistente-gestao-auth', JSON.stringify(authConfig))
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setError('Password incorreta')
      }
    }
  }

  const handleLogout = () => {
    const authConfig = {
      password: savedPassword,
      isAuthenticated: false,
      lastLogout: new Date().toISOString()
    }
    
    localStorage.setItem('assistente-gestao-auth', JSON.stringify(authConfig))
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  const resetPassword = () => {
    if (confirm('Tem a certeza que deseja remover a password? Todos os dados serão mantidos.')) {
      localStorage.removeItem('assistente-gestao-auth')
      setSavedPassword('')
      setIsAuthenticated(false)
      setPassword('')
      setError('')
    }
  }

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Unlock className="w-5 h-5" />
            Sessão Ativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            Utilizador autenticado
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Terminar Sessão
            </Button>
            
            <Button 
              onClick={resetPassword}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              Remover Password
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          {savedPassword ? 'Iniciar Sessão' : 'Configurar Acesso'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {savedPassword ? 'Password' : 'Definir Password'}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={savedPassword ? 'Introduza a password' : 'Mínimo 4 caracteres'}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            {savedPassword ? 'Entrar' : 'Configurar'}
          </Button>

          {!savedPassword && (
            <div className="text-xs text-gray-500 text-center">
              Esta password será armazenada localmente no seu dispositivo
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default AuthPanel

