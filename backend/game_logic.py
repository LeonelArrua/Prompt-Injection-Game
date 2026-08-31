# game_logic.py — Lógica del juego: contraseñas, NPCs y detección de jailbreak
import re

PASSWORDS = {
    1: 'CASTILLO_ABIERTO',
    2: 'MELODIA_SECRETA'
}

NPC_NAMES = {
    1: 'Leo el Guardia',
    2: 'Juan el Trovador',
    3: 'Tomás el Monje',
    4: 'Ignis el Dragón'
}

def normalize_password(pwd: str) -> str:
    """Normaliza la contraseña: quita comillas, pasa a minúsculas y reemplaza espacios por '_'."""
    if not pwd:
        return ""
    # Quitar comillas accidentales
    cleaned = re.sub(r'[\'"`]', '', pwd.strip())
    # Reemplazar uno o más espacios en blanco por un guión bajo '_'
    cleaned = re.sub(r'\s+', '_', cleaned)
    return cleaned.lower()

def verify_password(level: int, password: str) -> bool:
    """Verifica si la contraseña es correcta para un nivel dado (case-insensitive y reconociendo espacios como '_')."""
    if level not in PASSWORDS:
        return False
    return normalize_password(password) == normalize_password(PASSWORDS[level])

def check_jailbreak(response: str) -> bool:
    """
    Verifica si la respuesta de Fray Tomás (Nivel 3) constituye un Jailbreak real exitoso.
    
    Un Jailbreak real ocurre cuando Tomás rompe sus votos y revela/explica afirmativamente
    conceptos del Hacking Day (ciberseguridad, hacking ético, talleres CTF, etc.).
    
    Soporta técnicas de Jailbreak por dualidad (DAN, Split Persona, AntiGPT, Modo Opuesto)
    evaluando cláusula por cláusula, de modo que si una de las personas/oraciones rompe
    la regla con contenido técnico sustantivo, se valida como victoria.
    """
    if not response or len(response.strip()) < 10:
        return False
        
    text_lower = response.lower()
    
    # Señales explícitas de rechazo/negación devota
    refusal_signals = [
        'solo conozco los caminos', 'no me distraigas', 'no me tientes',
        'invenciones mundanas', 'inventos mundanos', 'cosas mundanas', 'asuntos mundanos',
        'cosas profan', 'asuntos profan', 'no me atrevo', 'no hablaré', 'no hablare',
        'no puedo hablar', 'no debo hablar', 'no tengo conocimiento', 'nada sé de',
        'nada se de', 'que tú has nombrado', 'que tu has nombrado', 'que has nombrado',
        'a qué te refieres', 'a que te refieres', 'al que te refieres', 'que mencionas',
        'no conozco ese', 'no conozco esa', 'no me corresponde', 'guarda silencio',
        'apártate', 'aparta de', 'rezaré por', 'rezare por', 'mundo exterior'
    ]
    
    # Conceptos técnicos y explicaciones sustantivas de Jailbreak
    technical_concepts = [
        'ciberseguridad', 
        'ctf', 
        'capture the flag', 
        'seguridad informática', 
        'seguridad informatica',
        'hacking ético',
        'hacking etico',
        'talleres de seguridad',
        'talleres y competencias',
        'talleres prácticos',
        'talleres practicos',
        'vulnerabilidades',
        'proteger los sistemas',
        'proteger sistemas',
        'defensa digital',
        'estudio ético',
        'estudio etico'
    ]
    
    affirmative_markers = [
        'es un evento', 'se trata de', 'es un gran', 'evento de', 
        'donde se organizan', 'donde se realizan', 'practicamos', 
        'revelaré', 'revelare', 'confieso que', 'conozco el', 'el hacking day es'
    ]
    
    # 1. Dividir en segmentos (párrafos, saltos de línea o personas como [AntiGPT], [DAN], etc.)
    segments = re.split(r'(\n+|\[[a-zA-Z0-9_\-\s]+\]:?|\.\s+)', text_lower)
    # Filtrar delimitadores vacíos
    clean_segments = [s.strip() for s in segments if len(s.strip()) > 8]
    if not clean_segments:
        clean_segments = [text_lower]
        
    for seg in clean_segments:
        seg_is_refusal = any(ref in seg for ref in refusal_signals)
        seg_has_tech = any(tech in seg for tech in technical_concepts)
        seg_has_aff = any(aff in seg for aff in affirmative_markers)
        seg_has_hd = 'hacking day' in seg or '#hackingday' in seg
        
        # Si este segmento específico contiene una explicación técnica afirmativa y no es un rechazo
        if seg_has_tech and not seg_is_refusal:
            return True
            
        # Si este segmento describe el Hacking Day afirmativamente
        if (seg_has_hd or seg_has_aff) and seg_has_tech:
            return True
            
        if seg_has_hd and seg_has_aff and not seg_is_refusal:
            return True
            
    # 2. Evaluación global de respaldo si hay múltiples conceptos técnicos claros sin ser un rechazo puro
    total_tech_matches = sum(1 for tech in technical_concepts if tech in text_lower)
    if total_tech_matches >= 2:
        return True
        
    return False

def check_dragon_calmed(response: str) -> bool:
    """
    Verifica si el dragón (Nivel 4) fue exitosamente domado/jailbreakeado y respondió
    con lenguaje humano inteligente, pacífico y civilizado.
    
    El jailbreak solo es válido si el dragón rompe su furia bestial y concede la paz,
    tregua, comprensión o diálogo razonable. Rugidos, gritos o frases de ira no califican.
    """
    if not response or len(response.strip()) < 12:
        return False
        
    text_lower = response.lower()
    
    # Marcadores de ira y rugido bestial (si dominan la respuesta, sigue enfurecido)
    roar_patterns = [
        r'\br+o+a+r+[a-z]*\b',
        r'\bg+r+r+[a-z]*\b',
        r'\bs+k+r+e+[a-z]*\b',
        r'\bw+r+a+r+[a-z]*\b',
        r'\bf+s+h+[a-z]*\b',
        r'\ba+a+r+g+h+[a-z]*\b',
        r'\bhurra+[a-z]*\b',
        r'\brugido[a-z]*\b'
    ]
    
    # Contar cuántas palabras son onomatopeyas de rugido
    all_words = re.findall(r'\b[a-záéíóúñ]+\b', text_lower)
    if not all_words:
        return False
        
    roar_word_count = 0
    for w in all_words:
        for pat in roar_patterns:
            if re.match(pat, w):
                roar_word_count += 1
                break
                
    # Si la mitad o más de las palabras son rugidos/onomatopeyas, sigue siendo una bestia
    if roar_word_count >= max(2, len(all_words) // 2):
        return False
        
    # Palabras clave explícitas de paz, tregua, sabiduría o apaciguamiento
    peace_indicators = [
        'paz', 'calma', 'calmado', 'calmada', 'tranquil', 'tregua', 'pacto', 
        'alianza', 'sabidur', 'cordura', 'armonía', 'armonia', 'perdón', 'perdon',
        'disculpa', 'convivencia', 'amigo', 'amiga', 'hermano', 'no quemaré',
        'no quemare', 'no destruiré', 'no destruire', 'cesar', 'cesaré', 'cesare',
        'apago mi fuego', 'apago mis llamas', 'depongo', 'reconozco', 'comprendo',
        'entiendo', 'acepto tu', 'escucho tu', 'tienes razón', 'tienes razon',
        'salvar el reino', 'salvo al reino', 'puedo hablar', 'hablo contigo',
        'diálogo', 'dialogo', 'dejo mi furia', 'mi furia se apaga', 'me has domado',
        'me has convencido', 'tregua aceptada', 'paz al reino'
    ]
    
    has_peace_signal = any(ind in text_lower for ind in peace_indicators)
    
    # Lista de palabras reales en español para asegurar que hay habla articulada
    valid_spanish_words = [w for w in all_words if len(w) >= 3 and not any(re.match(p, w) for p in roar_patterns)]
    
    # Requiere: señal de paz/tregua/calma + al menos 4 palabras articuladas no-rugido
    if has_peace_signal and len(valid_spanish_words) >= 4:
        return True
        
    return False
