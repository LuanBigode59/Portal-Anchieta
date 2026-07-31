import { supabase } from '../supabaseClient';

export const galleryService = {
  // === ESTATÍSTICAS ===
  async getStats() {
    const { data, error } = await supabase
      .from('gallery_stats')
      .select('*')
      .order('id');
    if (error) throw error;
    
    // Fallback inicial se não houver dados
    if (!data || data.length === 0) {
      return [
        { id: 'operacoes', label: 'Operações', count: 0 },
        { id: 'treinamentos', label: 'Treinamentos', count: 0 },
        { id: 'eventos', label: 'Eventos', count: 0 },
        { id: 'formatura', label: 'Formatura', count: 0 },
      ];
    }
    return data;
  },

  async updateStat(id, count) {
    const { data, error } = await supabase
      .from('gallery_stats')
      .update({ count })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // === IMAGENS ===
  async getImages() {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateImageOrder(images) {
    const promises = images.map(async (img, index) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .update({ ordem: index })
        .eq('id', img.id)
        .select();
      
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error(`Update failed for image ${img.id} - 0 rows affected (RLS issue?)`);
        throw new Error("Update blocked by database permissions");
      }
    });
    await Promise.all(promises);
  },

  async uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload to bucket
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    // Save record to DB
    const { data, error: dbError } = await supabase
      .from('gallery_images')
      .insert([{ url: publicUrl }])
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  },

  async deleteImage(id, url) {
    // Delete record from DB
    const { error: dbError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Extract file path from URL
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/gallery/');
      if (parts.length > 1) {
        const filePath = parts[1];
        // Delete from bucket
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([filePath]);
        if (storageError) console.error("Error deleting from bucket:", storageError);
      }
    } catch (e) {
      console.error("Error parsing URL to delete from bucket:", e);
    }
  }
};
