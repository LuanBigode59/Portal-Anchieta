import { supabase } from '../supabaseClient';

export const proctorService = {
  // === INSTRUCTOR / ADMIN METHODS ===

  async getSessions() {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .select('*, provas(titulo), cursos(nome)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch instructor names separately since PostgREST can't resolve the FK
    const instructorIds = [...new Set(data.map(s => s.instructor_id).filter(Boolean))];
    let instructorMap = {};
    if (instructorIds.length > 0) {
      const { data: instructors } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', instructorIds);
      if (instructors) {
        instructors.forEach(i => { instructorMap[i.id] = i; });
      }
    }
    return data.map(s => ({ ...s, instructor: instructorMap[s.instructor_id] || null }));
  },

  async getSessionById(id) {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .select('*, provas(titulo), cursos(nome)')
      .eq('id', id)
      .single();
    if (error) throw error;
    // Fetch instructor name separately
    if (data && data.instructor_id) {
      const { data: instructor } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('id', data.instructor_id)
        .single();
      data.instructor = instructor || null;
    }
    return data;
  },

  async createSession(sessionData) {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .insert([sessionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSessionStatus(id, status) {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSession(id) {
    // Manually delete dependencies in case cascade delete is not configured
    await supabase.from('proctor_events').delete().eq('session_id', id);
    await supabase.from('proctor_participants').delete().eq('session_id', id);
    
    const { error } = await supabase
      .from('proctor_sessions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getParticipants(sessionId) {
    const { data, error } = await supabase
      .from('proctor_participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('requested_at', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch student profiles separately
    const studentIds = [...new Set(data.map(p => p.student_id).filter(Boolean))];
    let studentMap = {};
    if (studentIds.length > 0) {
      const { data: students } = await supabase
        .from('profiles')
        .select('id, nome, patente')
        .in('id', studentIds);
      if (students) {
        students.forEach(s => { studentMap[s.id] = s; });
      }
    }
    return data.map(p => ({ ...p, student: studentMap[p.student_id] || null }));
  },

  async updateParticipantStatus(participantId, status, rejectionReason = null) {
    const updates = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) updates.approved_by = userData.user.id;
    } else if (status === 'rejected') {
      updates.rejected_at = new Date().toISOString();
      updates.rejection_reason = rejectionReason;
    }

    const { data, error } = await supabase
      .from('proctor_participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async getEvents(sessionId) {
    const { data, error } = await supabase
      .from('proctor_events')
      .select('*, proctor_participants(student_id)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // === STUDENT METHODS ===

  async getActiveSessionForExam(examId) {
    // Student checks if there's an open session for their exam
    const { data, error } = await supabase
      .from('proctor_sessions')
      .select('*')
      .eq('exam_id', examId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  },

  async getMyParticipation(sessionId, studentId) {
    const { data, error } = await supabase
      .from('proctor_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async requestEntry(sessionId, studentId) {
    const { data, error } = await supabase
      .from('proctor_participants')
      .insert([{
        session_id: sessionId,
        student_id: studentId,
        status: 'waiting_devices',
        requested_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMyStatus(participantId, status) {
    const { data, error } = await supabase
      .from('proctor_participants')
      .update({ status })
      .eq('id', participantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logEvent(sessionId, participantId, eventType, severity = 'info', metadata = {}) {
    const { error } = await supabase
      .from('proctor_events')
      .insert([{
        session_id: sessionId,
        participant_id: participantId,
        event_type: eventType,
        severity,
        metadata
      }]);
    if (error) console.error("Error logging proctor event:", error);
  },
  
  // === TOKENS ===
  
  async getLivekitToken(roomName, identity, isInstructor = false) {
    const { data: { session } } = await supabase.auth.getSession();
    
    // In local development, you might point this to localhost if using netlify dev
    // For now we'll use a relative path that works with Netlify redirects/functions
    const response = await fetch('/.netlify/functions/generate-livekit-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ roomName, identity, isInstructor })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get LiveKit token');
    return data.token;
  },
  
  async getExamToken(participantId) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch('/.netlify/functions/generate-exam-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({ participant_id: participantId })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to get Exam token');
    return data.examToken;
  }
};
