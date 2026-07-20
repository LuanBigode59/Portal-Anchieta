import { supabase } from '../supabaseClient';

export const courseService = {
  async getCourses() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActiveCourses() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('status', true)
      .order('nome');
    if (error) throw error;
    return data || [];
  },

  async getCourseById(id) {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('cursos')
      .insert([courseData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCourse(id, updates) {
    const { data, error } = await supabase
      .from('cursos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCourse(id) {
    const { error } = await supabase.from('cursos').delete().eq('id', id);
    if (error) throw error;
  },

  // ========== MÓDULOS ==========

  async getModulesByCourse(cursoId) {
    const { data, error } = await supabase
      .from('modulos')
      .select('*')
      .eq('curso_id', cursoId)
      .order('ordem', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createModule(moduleData) {
    const { data, error } = await supabase
      .from('modulos')
      .insert([moduleData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateModule(id, updates) {
    const { data, error } = await supabase
      .from('modulos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteModule(id) {
    const { error } = await supabase.from('modulos').delete().eq('id', id);
    if (error) throw error;
  },

  // ========== STORAGE ==========

  async uploadFile(file, folder) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('course_files')
      .upload(filePath, file, { upsert: false });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('course_files')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  async deleteFileByUrl(url) {
    if (!url || !url.includes('course_files')) return;
    try {
      const parts = url.split('course_files/');
      if (parts.length > 1) {
        const filePath = parts[1];
        await supabase.storage.from('course_files').remove([filePath]);
      }
    } catch (e) {
      console.error('Error deleting file:', e);
    }
  },
};
