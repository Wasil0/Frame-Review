# TODO: rotate ENCRYPTION_KEY periodically and support key-versioning if this becomes a compliance requirement later

import logging
from cryptography.fernet import Fernet
from backend.config.settings import settings

logger = logging.getLogger(__name__)

_fernet_instance = None

def _get_fernet() -> Fernet:
    global _fernet_instance
    if _fernet_instance is None:
        key = settings.ENCRYPTION_KEY
        if isinstance(key, str):
            key = key.encode("utf-8")
        _fernet_instance = Fernet(key)
    return _fernet_instance

def encrypt_field(plaintext) -> str:
    """
    Encrypts plaintext value using Fernet symmetric encryption (AES-128).
    """
    if plaintext is None:
        return None
    val_str = str(plaintext)
    fernet = _get_fernet()
    return fernet.encrypt(val_str.encode("utf-8")).decode("utf-8")

def decrypt_field(ciphertext) -> str:
    """
    Decrypts a Fernet ciphertext back to plaintext.
    If decryption fails (e.g. legacy plain text), returns original string safely.
    """
    if ciphertext is None:
        return None
    try:
        fernet = _get_fernet()
        return fernet.decrypt(str(ciphertext).encode("utf-8")).decode("utf-8")
    except Exception:
        # Fallback if field was already plaintext
        return str(ciphertext)
