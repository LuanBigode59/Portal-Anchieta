import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ranks } from '../data/ranks';

const AuthContext = createContext(null);

export const RANKS = [
  { id: 'tenente_coronel', level: 15, name: 'Tenente-Coronel PM', insignia: '*** |' },
  { id: 'major', level: 14, name: 'Major PM', insignia: '*** |' },
  { id: 'capitao', level: 13, name: 'Capitão PM', insignia: '☆☆☆ |' },
  { id: 'primeiro_tenente', level: 12, name: '1° Tenente PM', insignia: '** |' },
  { id: 'segundo_tenente', level: 11, name: '2° Tenente PM', insignia: '* |' },
  { id: 'aspirante', level: 10, name: 'Aspirante a Oficial PM', insignia: '✩ |' },
  { id: 'aluno_oficial', level: 9, name: 'Aluno-Oficial PM', insignia: '' },
  { id: 'subtenente', level: 8, name: 'Subtenente PM', insignia: 'A❘' },
  { id: 'primeiro_sargento', level: 7, name: '1° Sargento PM', insignia: '>>>>> |' },
  { id: 'segundo_sargento', level: 6, name: '2° Sargento PM', insignia: '>>>> |' },
  { id: 'terceiro_sargento', level: 5, name: '3° Sargento PM', insignia: '>>> |' },
  { id: 'aluno_sargento', level: 4, name: 'Aluno-Sargento PM', insignia: '>>> |' },
  { id: 'cabo', level: 3, name: 'Cabo PM', insignia: '>> |' },
  { id: 'soldado_primeira', level: 2, name: 'Soldado 1a Classe PM', insignia: '> |' },
  { id: 'soldado_segunda', level: 1, name: 'Soldado 2a Classe PM', insignia: '> |' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, throwOnBlocked = false) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Block exonerated users from accessing the system
        if (data.status === 'Exonerado') {
          await supabase.auth.signOut();
          setUser(null);
          if (throwOnBlocked) {
            throw new Error('CONTA BLOQUEADA — Militar exonerado do Batalhão. Procure o Comando para reintegração.');
          }
          return;
        }
        setUser({ ...data, auth_id: userId });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUser(null);
      if (throwOnBlocked) throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (cpf, senha) => {
    const email = `${cpf}@provaschoque.com.br`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw new Error("Credenciais inválidas.");
    await fetchProfile(data.user.id, true);
  };

  const register = async (cpf, senha, nome) => {
    const email = `${cpf}@provaschoque.com.br`;
    
    // Check if user exists
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('cpf')
      .eq('cpf', cpf);
      
    if (existingProfiles && existingProfiles.length > 0) {
      throw new Error("Matrícula (ID) já cadastrada no sistema.");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    
    if (error) {
      console.error("Supabase signUp error:", error);
      let msg = error.message;
      if (msg === '{}' || !msg) {
        msg = "Erro interno do servidor: " + JSON.stringify(error) + " | Status: " + error.status + " | Name: " + error.name;
      }
      throw new Error(msg);
    }

    if (data.user) {
      // Create profile for new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            nome,
            cpf,
            cargo: 'soldado_segunda',
            patente: 'soldado_segunda',
            companhia: 'Aguardando Designação',
            discord: '',
            horas_servico: '0h',
            status: 'Ativo',
            ativo: true,
            cursos: [],
            advertencias: [],
            elogios: [],
            promocoes: [],
            condecoracoes: [],
            historico: [
               { data: new Date().toISOString(), tipo: 'Ingresso', descricao: 'Alistamento via Portal Oficial.' }
            ]
          }
        ]);
        
      if (profileError) throw new Error("Erro ao criar ficha militar: " + profileError.message);
      
      await fetchProfile(data.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Permission logic
  const userRankLevel = RANKS.find(r => r.id === user?.cargo)?.level || 0;

  const isAdmin = userRankLevel >= 14; 
  const isOfficer = userRankLevel >= 10; 
  const isNCO = userRankLevel >= 3 && userRankLevel < 10; 
  const isSoldado = userRankLevel >= 1 && userRankLevel <= 2;
  const isInstrutor = false; 

  const hasPermission = (roles) => {
    if (!user) return false;
    return roles.includes(user.cargo);
  };

  const hasMinLevel = (level) => {
    return userRankLevel >= level;
  };

  const isCommandLevel = isAdmin || user?.cargo === 'capitao';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin, isInstrutor, isOfficer, isNCO, isSoldado,
      hasPermission, hasMinLevel, isCommandLevel, userRankLevel
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
