import { supabase } from '../supabaseClient';

export const chatService = {
  async getMessages(channel) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('canal', channel)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(msgData) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([msgData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMessage(id, content) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content, edited: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMessage(id) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ content: 'Mensagem apagada pelo usuário.', deleted: true })
      .eq('id', id);
    if (error) throw error;
  },

  async pinMessage(id, pinnedStatus) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ pinned: pinnedStatus })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- PRESENCE & ACTIVITY TRACKING ---
  async setOnlineStatus(userId, online, currentChannel = null) {
    await supabase
      .from('profiles')
      .update({ 
        online, 
        typing_channel: currentChannel,
        last_activity: new Date().toISOString() 
      })
      .eq('id', userId);
  },

  async setTypingStatus(userId, channel) {
    await supabase
      .from('profiles')
      .update({ typing_channel: channel })
      .eq('id', userId);
  },

  async getActiveUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, cargo, patente, online, typing_channel, last_activity, companhia, status')
      .order('nome');
    if (error) throw error;
    return data || [];
  }
};
