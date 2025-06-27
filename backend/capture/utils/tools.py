import subprocess

# Detection interfaces function
def detect_interfaces():
    
    try:
        result = subprocess.run(
            ['ip', 'link', 'show'],
            capture_output=True,
            text=True
        )
        
        interfaces = []
        for line in result.stdout.split('\n'):
            if ':' in line and not 'lo:' in line:
                parts = line.split(':')
                interfaces.append({
                    'name': parts[1].strip(),
                    'type': _guess_interface_type(parts[1].strip())
                })
        return interfaces
        
    except Exception as e:
        raise RuntimeError(f"Erreur de détection: {str(e)}")

def _guess_interface_type(name):
    if name.startswith('eth'): return 'Ethernet'
    if name.startswith('wlan'): return 'WiFi'
    if name.startswith('tun'): return 'VPN'
    return 'Network'

