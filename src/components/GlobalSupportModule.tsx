import React, { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

export const GlobalSupportModule: React.FC = () => {
  const { user, organization } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newPriority, setNewPriority] = useState('low');
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    if (!organization) return;
    try {
      const { data, error } = await insforge.database
        .from('global_tickets')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !newSubject.trim()) return;
    
    try {
      const { error } = await insforge.database
        .from('global_tickets')
        .insert([{
          organization_id: organization.id,
          subject: newSubject.trim(),
          priority: newPriority,
          status: 'new'
        }]);
        
      if (error) throw error;
      addToast("Ticket créé avec succès", "success");
      setIsCreating(false);
      setNewSubject('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la création du ticket", "error");
    }
  };

  const loadTicketMessages = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const { data, error } = await insforge.database
        .from('global_ticket_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;
    
    try {
      const { error } = await insforge.database
        .from('global_ticket_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          is_superadmin: false,
          message: newMessage.trim()
        }]);
        
      if (error) throw error;
      setNewMessage('');
      loadTicketMessages(selectedTicket);
      
      if (selectedTicket.status === 'resolved') {
        await insforge.database.from('global_tickets').update({ status: 'open' }).eq('id', selectedTicket.id);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
      addToast("Erreur d'envoi", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Support Technique</h2>
            <p className="text-slate-500 text-sm">Contacter l'équipe DJAGO CRM</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouveau Ticket
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Tickets List */}
        <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Vos Tickets</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-slate-500 text-center text-sm">Chargement...</p>
            ) : tickets.length === 0 ? (
              <p className="p-4 text-slate-500 text-center text-sm">Aucun ticket pour le moment.</p>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => loadTicketMessages(ticket)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedTicket?.id === ticket.id 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-900 truncate pr-2">{ticket.subject}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedTicket ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!selectedTicket ? (
            <div className="text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Sélectionnez un ticket pour afficher la conversation</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-900">{selectedTicket.subject}</h3>
                <button className="md:hidden text-slate-400" onClick={() => setSelectedTicket(null)}>Retour</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.is_superadmin ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      !msg.is_superadmin ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.is_superadmin && <p className="text-[10px] font-bold text-orange-500 mb-1">Équipe DJAGO</p>}
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  type="submit" disabled={!newMessage.trim()}
                  className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition"
                >
                  Envoyer
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Ouvrir un ticket</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sujet du problème</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newSubject} onChange={e => setNewSubject(e.target.value)}
                  placeholder="Ex: Problème d'accès à un module"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={newPriority} onChange={e => setNewPriority(e.target.value)}
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                Créer le ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
