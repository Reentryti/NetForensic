# Fonction pour parser le log de Zeek format supporté
def parse_ascii_log(file_path):
    entries = []
    header = []

    with open(file_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                if line.startswith("#fields"):
                    header = line.split('\t')[1:]
                continue
            if header:
                values = line.split('\t')
                if len(values) == len(header):
                    entry = dict(zip(header, values))
                    entries.append(entry)
    return entries