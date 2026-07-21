from motor.motor_asyncio import AsyncIOMotorClient

# Monkeypatch Motor Client to bypass Beanie v2 telemetry compatibility issue with Motor v3+
if not hasattr(AsyncIOMotorClient, "append_metadata"):
    AsyncIOMotorClient.append_metadata = lambda self, *args, **kwargs: None

from beanie import init_beanie
from backend.models import Agency, User, Project, Invoice, Video, Message, Notification

async def init_db(connection_string: str, database_name: str):
    """
    Initializes the MongoDB connection using Motor and sets up Beanie ODM Document models.
    """
    client = AsyncIOMotorClient(connection_string)
    database = client[database_name]
    
    await init_beanie(
        database=database,
        document_models=[
            Agency,
            User,
            Project,
            Invoice,
            Video,
            Message,
            Notification,
        ]
    )
    return client
