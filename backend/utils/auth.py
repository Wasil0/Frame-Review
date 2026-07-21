import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException, status, Depends
from typing import Optional
from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict
from backend.config.settings import settings
from backend.models.user import User

# Initialize JWKS Client with in-memory caching (1 hour TTL)
JWKS_URL = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(
    JWKS_URL,
    cache_keys=True,
    max_cached_keys=16,
    cache_jwk_set=True,
    lifespan=3600
)

class AuthUser(BaseModel):
    user_id: str
    email: Optional[str] = None
    user_metadata: dict = {}

class UserContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    user: User
    active_agency_id: PydanticObjectId
    role: str

async def get_auth_user(authorization: Optional[str] = Header(None)) -> AuthUser:
    """
    Dependency that reads Authorization: Bearer <token> header,
    verifies the signature using Supabase's JWKS (ES256/RS256), and returns verified user info.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header."
        )

    token = authorization
    if authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        expected_issuer = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            issuer=expected_issuer,
            options={"verify_exp": True, "verify_iss": True, "verify_aud": False}
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed: missing 'sub' claim."
            )

        return AuthUser(
            user_id=user_id,
            email=payload.get("email"),
            user_metadata=payload.get("user_metadata", {})
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired."
        )
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token issuer does not match Supabase project URL."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )

async def get_current_user(auth_user: AuthUser = Depends(get_auth_user)) -> User:
    """
    Dependency that retrieves the current user's MongoDB profile.
    """
    user = await User.get(auth_user.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User MongoDB profile not found. Call /api/users/sync first."
        )
    return user

async def get_agency_id(x_agency_id: Optional[str] = Header(None, alias="X-Agency-ID")) -> Optional[PydanticObjectId]:
    """
    Extracts the optional X-Agency-ID header.
    """
    if not x_agency_id:
        return None
    try:
        return PydanticObjectId(x_agency_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-Agency-ID header format. Must be a valid 24-character hex string."
        )

async def get_user_context(
    agency_id: Optional[PydanticObjectId] = Depends(get_agency_id),
    user: User = Depends(get_current_user)
) -> UserContext:
    """
    Returns UserContext for agency-scoped routes.
    """
    active_id = user.agency_id or agency_id
    if not active_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active agency context required."
        )
    return UserContext(
        user=user,
        active_agency_id=active_id,
        role=user.role or "Owner"
    )
