import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import MainLayout from './components/layout/MainLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Hierarchy from './pages/public/Hierarchy';
import Gallery from './pages/public/Gallery';
import Recruitment from './pages/public/Recruitment';
import Login from './pages/auth/Login';
import VerifyCertificate from './pages/public/VerifyCertificate';

// Military Pages
import Dashboard from './pages/military/Dashboard';
import MyProfile from './pages/military/MyProfile';
import Courses from './pages/military/Courses';
import CourseDetails from './pages/military/CourseDetails';
import Exams from './pages/military/Exams';
import ExamViewer from './pages/military/ExamViewer';
import Schedule from './pages/military/Schedule';
import Operations from './pages/military/Operations';
import Reports from './pages/military/Reports';
import BoletimPromocao from './pages/military/BoletimPromocao';
import Bulletins from './pages/military/Bulletins';
import Medals from './pages/military/Medals';
import Ranking from './pages/military/Ranking';
import Statistics from './pages/military/Statistics';
import Chat from './pages/military/Chat';
import Config from './pages/military/Config';
import MyCertificates from './pages/military/MyCertificates';
import Copom from './pages/military/Copom';
import PontoEletronico from './pages/military/PontoEletronico';
import EmServico from './pages/military/EmServico';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePromotions from './pages/admin/ManagePromotions';
import ManageWarnings from './pages/admin/ManageWarnings';
import ManageCourses from './pages/admin/ManageCourses';
import ManageExams from './pages/admin/ManageExams';
import ExamResults from './pages/admin/ExamResults';
import ManageOperations from './pages/admin/ManageOperations';
import MilitarProfile from './pages/admin/MilitarProfile';
import AddMilitar from './pages/admin/AddMilitar';
import EditMilitar from './pages/admin/EditMilitar';
import ManageSignatures from './pages/admin/ManageSignatures';
import ManageExonerated from './pages/admin/ManageExonerated';
import ManageMedals from './pages/admin/ManageMedals';

// Corregedoria Pages
import CorregedoriaLayout from './components/layout/CorregedoriaLayout';
import CorregedoriaPanel from './pages/admin/corregedoria/CorregedoriaPanel';
import ProcessosCorregedoria from './pages/admin/corregedoria/Processos';
import ProcessoDetails from './pages/admin/corregedoria/ProcessoDetails';

// Error Pages
import NotFound from './pages/errors/NotFound';
import AccessDenied from './pages/errors/AccessDenied';
import Maintenance from './pages/errors/Maintenance';

import AudioPlayer from './components/shared/AudioPlayer';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AudioPlayer />
        <Routes>
          {/* Public Area */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/hierarquia" element={<Hierarchy />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/recrutamento" element={<Recruitment />} />
            <Route path="/verificar-certificado" element={<VerifyCertificate />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Standalone Error Pages */}
          <Route path="/acesso-negado" element={<AccessDenied />} />
          <Route path="/manutencao" element={<Maintenance />} />

          {/* Protected Military Area */}
          <Route path="/militar" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ficha" element={<MyProfile />} />
            <Route path="cursos" element={<Courses />} />
            <Route path="cursos/:id" element={<CourseDetails />} />
            <Route path="provas" element={<Exams />} />
            <Route path="provas/:id" element={<ExamViewer />} />
            <Route path="escalas" element={<Schedule />} />
            <Route path="operacoes" element={<Operations />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="boletim" element={<BoletimPromocao />} />
            <Route path="boletins" element={<Bulletins />} />
            <Route path="mural" element={<Bulletins />} />
            <Route path="medalhas" element={<Medals />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="estatisticas" element={<Statistics />} />
            <Route path="copom" element={<Copom />} />
            <Route path="chat" element={<Chat />} />
            <Route path="configuracoes" element={<Config />} />
            <Route path="certificados" element={<MyCertificates />} />
            <Route path="ponto" element={<PontoEletronico />} />
            <Route path="em-servico" element={<EmServico />} />
          </Route>

          {/* Protected Command Area */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['tenente_coronel', 'major', 'capitao']}>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminPanel />} />
            <Route path="policiais" element={<ManageUsers />} />
            <Route path="policiais/novo" element={<AddMilitar />} />
            <Route path="policiais/:id" element={<MilitarProfile />} />
            <Route path="policiais/:id/editar" element={<EditMilitar />} />
            <Route path="promocoes" element={<ManagePromotions />} />
            <Route path="advertencias" element={<ManageWarnings />} />
            <Route path="cursos" element={<ManageCourses />} />
            <Route path="provas" element={<ManageExams />} />
            <Route path="resultados-provas" element={<ExamResults />} />
            <Route path="operacoes" element={<ManageOperations />} />
            <Route path="assinaturas" element={<ManageSignatures />} />
            <Route path="exonerados" element={<ManageExonerated />} />
            <Route path="medalhas" element={<ManageMedals />} />
          </Route>

          {/* Protected Corregedoria Area */}
          <Route path="/corregedoria" element={
            <ProtectedRoute roles={['coronel', 'tenente_coronel', 'major']}>
              <CorregedoriaLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CorregedoriaPanel />} />
            <Route path="processos" element={<ProcessosCorregedoria />} />
            <Route path="processos/:id" element={<ProcessoDetails />} />
            <Route path="denuncias" element={<ProcessosCorregedoria />} />
            <Route path="investigacoes" element={<ProcessosCorregedoria />} />
            <Route path="advertencias" element={<ProcessosCorregedoria />} />
            <Route path="exoneracoes" element={<ProcessosCorregedoria />} />
            <Route path="arquivados" element={<ProcessosCorregedoria />} />
          </Route>

          {/* 404 - Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
