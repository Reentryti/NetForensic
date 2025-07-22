import { use, useEffect, useState } from "react";
import axios from 'axios';

export default function CaptureForm({interfaces, activeSession, onSessionUpdate}){
    const [form, setForm] = useState({
        interface: '',
        filter: ''
    });
    const [capturing, setCapturing] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    
    useEffect(() => {
        if(activeSession && !sessionId){
            setSessionId(activeSession.id);
            setCapturing(true);
        } else if (!activeSession){
            setSessionId(null);
            setCapturing(false);
        }
    },[activeSession] );

    //Filter Validation Function
    const isValidBpfFilter = (filter) => {
        if (!filter) return true;
        const pattern = /^(tcp|udp|ip|icmp|port|host|net)/i;
        return pattern.test(filter.trim());
        };


    //Capture function
    const startCapture = async () => {
        setLoading(true);
        setMsg('');
        if (!isValidBpfFilter(form.filter)) {
            setMsg('Filtre BPF invalide');
            setLoading(false);
            return;
        }
        try{
            const response = await axios.post('/api/capture/', form);
            setSessionId(response.data.session_id || response.data.id);
            setCapturing(true);
            setMsg('Capture demarree');
            if (onSessionUpdate) onSessionUpdate();
        }catch(error){
            console.log("Erreur de demarrage", error);
            setMsg('Erreur lors du demarrage de la capture');
        }finally{
            setLoading(false);
        }
    };

    //Stop capture function
    const stopCapture = async () => {
        console.log("essaie d'arreter la session:", sessionId);
        console.log("Active session", activeSession);

        const idToStop = activeSession?.id || sessionId;
        if(!idToStop){
            setMsg('Session inconnue');
            return;
        }
        setLoading(true);
        setMsg('');
        try{
            await axios.post(`/api/capture/${idToStop}/stop/`);
            setCapturing(false);
            setMsg(null);
            setMsg('Capture arrete');
            if (onSessionUpdate) onSessionUpdate();
        }catch (error){
            console.error("Erreur arret ", error.response?.data || error);
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
        <div className="capture-form p-4 bg-white rounded shadow space-y-4 max-w-md mx-auto">
        <label htmlFor="interface-select" className="block font-semibold">
            Choisir une interface
        </label>
        <select
            id="interface-select"
            className="w-full border rounded p-2"
            required
            disabled={capturing}
            value={form.interface}
            onChange={e => setForm({ ...form, interface: e.target.value })}
        >
            <option value="">-- Sélectionner --</option>
            {interfaces.map(i => (
            <option key={i.name} value={i.name}>
                {i.name} ({i.type})
            </option>
            ))}
        </select>

        <label htmlFor="filter" className="block font-semibold">
            Filtre BPF (optionnel)
        </label>
        <input
            id="filter"
            type="text"
            className="w-full border rounded p-2"
            placeholder="tcp port 80"
            disabled={capturing}
            value={form.filter}
            onChange={e => setForm({ ...form, filter: e.target.value })}
        />

        <button
            onClick={handleClick}
            disabled={loading || (!capturing && !form.interface)}
            className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400' : capturing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
            {loading ? 'Traitement...' : capturing ? 'Arrêter la capture' : 'Démarrer la capture'}
        </button>

        {msg && <p className="text-center text-sm">{msg}</p>}

        {/* {!capturing && sessionId && (
        <div className="text-center mt-4">
            <button
            onClick={() => {
               
                window.location.href = `/rapport/${sessionId}`;
            }}
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
            Voir le rapport de la session
            </button>
        </div>
        )} */}

        </div>
    );
}