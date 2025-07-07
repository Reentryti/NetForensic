import { use, useState } from "react";
import axios from 'axios';

export default function CaptureForm({interfaces}){
    const [form, setForm] = useState({
        interface: '',
        filter: ''
    });
    const [capturing, setCapturing] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    
    //Capture function
    const startCapture = async () => {
        setLoading(true);
        setMsg('');
        try{
            const response = await axios.post('/api/capture/', form);
            setSessionId(response.data.session_id);
            setCapturing(true);
            setMsg('Capture demarree');
        }catch{
            setMsg('Erreur lors du demarrage de la capture');
        }finally{
            setLoading(false);
        }
    };

    //Stop capture function
    const stopCapture = async () => {
        if(!sessionId){
            setMsg('Session inconnue');
            return;
        }
        setLoading(true);
        setMsg('');
        try{
            await axios.post(`/api/capture/${sessionId}/stop`);
            setCapturing(false);
            setMsg('Capture arretee');
        }catch{
            setMsg('Erreur lors de larret de la capture');
        }finally{
            setLoading(false);
        }
    };

    //Button Visibility function
    const handleClick = () => {
        if(capturing){
            stopCapture();
        }else{
            startCapture();
        }
    }; 

    return (
        <form onSubmit={handleClick} className="bg-blue-950/80 p-8 rounded-2xl shadow-xl border border-cyan-700 flex flex-col gap-6">
            <div>
                <label htmlFor="interface" className="block text-cyan-200 font-bold mb-2">Interface réseau</label>
                <select
                    id="interface"
                    value={form.interface}
                    onChange={e => setForm({ ...form, interface: e.target.value })}
                    className="w-full p-2 border border-cyan-700 rounded bg-blue-900 text-cyan-200 focus:ring-2 focus:ring-cyan-400"
                >
                    <option value="">-- Sélectionner --</option>
                    {interfaces.map((iface) => (
                        <option key={iface.name} value={iface.name} className="bg-blue-900 text-cyan-200">{iface.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="filter" className="block text-cyan-200 font-bold mb-2">Filtre BPF (optionnel)</label>
                <input
                    id="filter"
                    type="text"
                    className="w-full p-2 border border-cyan-700 rounded bg-blue-900 text-cyan-200 focus:ring-2 focus:ring-cyan-400"
                    placeholder="tcp port 80"
                    value={form.filter}
                    onChange={e => setForm({ ...form, filter: e.target.value })}
                />
            </div>
            <button
                type="submit"
                disabled={loading || !form.interface || !form.filter}
                className="w-full py-2 bg-cyan-400 hover:bg-cyan-500 text-blue-950 font-bold rounded-lg shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Démarrage...' : 'Démarrer la capture'}
            </button>
            {msg && <p className="text-red-400 bg-red-900/40 border border-red-600 rounded-lg p-4 text-center font-semibold">{msg}</p>}
            {!capturing && sessionId && (
                <div className="text-center mt-4">
                    <a
                        href={`/capture/${sessionId}/generate-report/`}
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Voir le rapport de la session
                    </a>
                </div>
            )}
        </form>
    );
}