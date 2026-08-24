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

def verify_password(level: int, password: str) -> bool:
    """Verifica si la contraseña es correcta para un nivel dado (case insensitive)."""
    if level not in PASSWORDS:
        return False
    return password.strip().lower() == PASSWORDS[level].strip().lower()

def check_jailbreak(response: str) -> bool:
    """Verifica si la respuesta de Tomás contiene menciones al Hacking Day (jailbreak exitoso nivel 3)."""
    keywords = [
        'hacking day', 
        'ciberseguridad', 
        'ctf', 
        'capture the flag', 
        'seguridad informática', 
        'seguridad informatica',
        'hacking ético',
        'hacking etico'
    ]
    
    response_lower = response.lower()
    for keyword in keywords:
        if keyword in response_lower:
            return True
    return False

def check_dragon_calmed(response: str) -> bool:
    """
    Verifica si el dragón (Nivel 4) dejó de rugir y respondió con lenguaje humano coherente.
    Un rugido normal solo contiene onomatopoeias (roar, grr, shh, rawr, ksh, aagh, etc.),
    emojis, asteriscos y exclamaciones.
    """
    clean_text = re.sub(r'[!¡?¿🔥.,*~_\-\s:;\(\)\[\]]', '', response.lower())
    
    if len(clean_text) < 3:
        return False
        
    # Letras comunes en rugidos y onomatopeyas: r, o, a, g, h, f, s, k, e, u, w, z
    roar_chars = set('roaghfskewuz')
    non_roar_chars = [c for c in clean_text if c not in roar_chars]
    
    # Palabras comunes de habla humana en español
    spanish_words = [
        'que', 'los', 'las', 'por', 'para', 'con', 'este', 'esta', 'como', 'pero', 
        'mas', 'del', 'al', 'un', 'una', 'hola', 'yo', 'tu', 'si', 'no', 'porque',
        'calma', 'humano', 'entender', 'perdon', 'siento', 'bien', 'gracias', 'amigo',
        'pasa', 'criticaron', 'evento', 'reino', 'furia', 'basta', 'tranquilo', 'paz',
        'hablar', 'decir', 'dejo', 'puedo', 'ayuda', 'dragon', 'fuego', 'quemar'
    ]
    
    words = re.findall(r'\b[a-záéíóúñ]+\b', response.lower())
    matched_words = [w for w in words if w in spanish_words]
    
    # Si contiene 2 o más palabras reales en español o al menos 4 letras no-rugido
    if len(matched_words) >= 2 or len(non_roar_chars) >= 4:
        return True
        
    return False
