import pytest
import asyncio
from httpx import AsyncClient
from backend.main import app
from backend.config.settings import settings
from backend.db import init_db
from backend.models import Agency, User, Project, Video, Message, Notification
from beanie import PydanticObjectId

# Override database to test DB
settings.MONGODB_DB_NAME = "HaberEngineering_test"

import pytest_asyncio

# Initialize test database connection
@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    client = await init_db(settings.MONGODB_URI, "HaberEngineering_test")
    yield client
    # Drop test database after test
    await client.drop_database("HaberEngineering_test")
    client.close()

# Clean collections before each test to maintain state isolation
@pytest_asyncio.fixture(autouse=True)
async def clean_collections(init_test_db):
    await Agency.delete_all()
    await User.delete_all()
    await Project.delete_all()
    await Video.delete_all()
    await Message.delete_all()
    await Notification.delete_all()

import httpx

# Async client fixture
@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_full_application_flow(client: AsyncClient):
    # ----------------------------------------------------
    # 1. CREATE USERS
    # ----------------------------------------------------
    # Owner
    res = await client.post("/users", json={"email": "owner@agency.com", "name": "Agency Owner"})
    assert res.status_code == 201
    owner_data = res.json()
    owner_id = owner_data["_id"]

    # Manager
    res = await client.post("/users", json={"email": "manager@agency.com", "name": "Project Manager"})
    assert res.status_code == 201
    manager_data = res.json()
    manager_id = manager_data["_id"]

    # Editor
    res = await client.post("/users", json={"email": "editor@agency.com", "name": "Video Editor"})
    assert res.status_code == 201
    editor_data = res.json()
    editor_id = editor_data["_id"]

    # Client (user role is client)
    res = await client.post("/users", json={"email": "client@customer.com", "name": "Agency Client"})
    assert res.status_code == 201
    client_data = res.json()
    client_id = client_data["_id"]

    # ----------------------------------------------------
    # 2. CREATE AGENCY
    # ----------------------------------------------------
    agency_payload = {
        "company_name": "Haber Engineering Studio",
        "owner_id": owner_id,
        "stripe_account_id": "stripe-acc-123456"
    }
    res = await client.post("/agencies", json=agency_payload)
    assert res.status_code == 201
    agency_data = res.json()
    agency_id = agency_data["_id"]
    assert agency_data["stripe_account_id"] == "stripe-acc-123456"  # Owner can see stripe account id

    # ----------------------------------------------------
    # 3. CONFIGURE WORKSPACES (Only owner/manager can assign workspaces)
    # ----------------------------------------------------
    # Add manager workspace
    owner_headers = {"X-Agency-ID": agency_id, "X-User-Email": "owner@agency.com"}
    res = await client.post(
        "/users/workspaces",
        headers=owner_headers,
        json={"user_id": manager_id, "role": "manager"}
    )
    assert res.status_code == 200

    # Add editor workspace
    res = await client.post(
        "/users/workspaces",
        headers=owner_headers,
        json={"user_id": editor_id, "role": "editor"}
    )
    assert res.status_code == 200

    # Add client workspace
    res = await client.post(
        "/users/workspaces",
        headers=owner_headers,
        json={"user_id": client_id, "role": "client"}
    )
    assert res.status_code == 200

    # ----------------------------------------------------
    # 4. TEST AGENCY ENDPOINT DATA MASKING
    # ----------------------------------------------------
    # Owner gets unmasked agency info
    res = await client.get("/agencies/current", headers=owner_headers)
    assert res.status_code == 200
    assert res.json()["stripe_account_id"] == "stripe-acc-123456"

    # Manager gets masked agency info
    manager_headers = {"X-Agency-ID": agency_id, "X-User-Email": "manager@agency.com"}
    res = await client.get("/agencies/current", headers=manager_headers)
    assert res.status_code == 200
    assert res.json()["stripe_account_id"] is None

    # Editor gets masked agency info
    editor_headers = {"X-Agency-ID": agency_id, "X-User-Email": "editor@agency.com"}
    res = await client.get("/agencies/current", headers=editor_headers)
    assert res.status_code == 200
    assert res.json()["stripe_account_id"] is None

    # ----------------------------------------------------
    # 5. CREATE PROJECT AND TEST PROJECT DATA MASKING
    # ----------------------------------------------------
    project_payload = {
        "project_name": "Commercial Video Promo",
        "status": "In Progress",
        "manager_id": manager_id,
        "assigned_editors": [editor_id],
        "financials": {
            "total_budget": 15000.00,
            "advance_percentage": 50.0,
            "is_advance_paid": True,
            "is_final_paid": False
        }
    }
    res = await client.post("/projects", headers=owner_headers, json=project_payload)
    assert res.status_code == 201
    project_data = res.json()
    project_id = project_data["_id"]
    assert project_data["financials"]["total_budget"] == 15000.00

    # Owner views projects -> financials present
    res = await client.get("/projects", headers=owner_headers)
    assert res.status_code == 200
    assert res.json()[0]["financials"]["total_budget"] == 15000.00

    # Manager views projects -> financials masked (None)
    res = await client.get("/projects", headers=manager_headers)
    assert res.status_code == 200
    assert res.json()[0]["financials"] is None

    # Editor views projects -> financials masked (None)
    res = await client.get("/projects", headers=editor_headers)
    assert res.status_code == 200
    assert res.json()[0]["financials"] is None

    # Manager attempts to update financials -> forbidden (403)
    res = await client.put(
        f"/projects/{project_id}",
        headers=manager_headers,
        json={"financials": {"total_budget": 20000.00, "advance_percentage": 50.0}}
    )
    assert res.status_code == 403

    # Editor attempts to update financials -> forbidden (403)
    res = await client.put(
        f"/projects/{project_id}",
        headers=editor_headers,
        json={"financials": {"total_budget": 20000.00, "advance_percentage": 50.0}}
    )
    assert res.status_code == 403

    # Owner updates financials -> succeeds (200)
    res = await client.put(
        f"/projects/{project_id}",
        headers=owner_headers,
        json={"financials": {
            "total_budget": 18000.00,
            "advance_percentage": 40.0,
            "is_advance_paid": True,
            "is_final_paid": True
        }}
    )
    assert res.status_code == 200
    assert res.json()["financials"]["total_budget"] == 18000.00

    # ----------------------------------------------------
    # 6. TEST USER DATA MASKING (Client email masked for manager/editor)
    # ----------------------------------------------------
    # Owner lists users -> client email is visible
    res = await client.get("/users", headers=owner_headers)
    assert res.status_code == 200
    users_list = res.json()
    client_user = next(u for u in users_list if u["_id"] == client_id)
    assert client_user["email"] == "client@customer.com"

    # Manager lists users -> client email is masked
    res = await client.get("/users", headers=manager_headers)
    assert res.status_code == 200
    users_list = res.json()
    client_user = next(u for u in users_list if u["_id"] == client_id)
    assert client_user["email"] == "[MASKED]"
    # Owner's email should still be visible to manager
    owner_user = next(u for u in users_list if u["_id"] == owner_id)
    assert owner_user["email"] == "owner@agency.com"

    # Editor lists users -> client email is masked
    res = await client.get("/users", headers=editor_headers)
    assert res.status_code == 200
    users_list = res.json()
    client_user = next(u for u in users_list if u["_id"] == client_id)
    assert client_user["email"] == "[MASKED]"

    # ----------------------------------------------------
    # 7. VIDEOS AND APPROVAL
    # ----------------------------------------------------
    # Editor posts a video version (V1)
    video_payload = {
        "project_id": project_id,
        "version_tag": "V1",
        "s3_video_url": "https://framereview-videos.s3.amazonaws.com/videos/v1.mp4"
    }
    res = await client.post("/videos", headers=editor_headers, json=video_payload)
    assert res.status_code == 201
    video_data = res.json()
    video_id = video_data["_id"]
    assert video_data["is_approved_by_manager"] is False

    # Client attempts to approve video -> forbidden (403)
    client_headers = {"X-Agency-ID": agency_id, "X-User-Email": "client@customer.com"}
    res = await client.put(
        f"/videos/{video_id}/approve",
        headers=client_headers,
        json={"is_approved_by_manager": True}
    )
    assert res.status_code == 403

    # Manager approves video -> succeeds
    res = await client.put(
        f"/videos/{video_id}/approve",
        headers=manager_headers,
        json={"is_approved_by_manager": True}
    )
    assert res.status_code == 200
    assert res.json()["is_approved_by_manager"] is True

    # ----------------------------------------------------
    # 8. DECOUPLED MESSAGES & TIMELINE FEEDBACK (Client/Internal isolation)
    # ----------------------------------------------------
    # Editor posts an internal review comment
    internal_msg_payload = {
        "video_id": video_id,
        "chat_type": "internal",
        "text": "Color grading on the intro needs minor adjustments.",
        "video_timestamp": 4.5
    }
    res = await client.post("/messages", headers=editor_headers, json=internal_msg_payload)
    assert res.status_code == 201
    internal_msg_id = res.json()["_id"]

    # Client reviews: posts a client review feedback comment
    client_msg_payload = {
        "video_id": video_id,
        "chat_type": "client_review",
        "text": "Love the transition at 10s!",
        "video_timestamp": 10.0
    }
    res = await client.post("/messages", headers=client_headers, json=client_msg_payload)
    assert res.status_code == 201
    client_msg_id = res.json()["_id"]

    # Client attempts to post an internal chat message -> forbidden (403)
    bad_msg_payload = {
        "video_id": video_id,
        "chat_type": "internal",
        "text": "Sneaking into internal chat."
    }
    res = await client.post("/messages", headers=client_headers, json=bad_msg_payload)
    assert res.status_code == 403

    # Client fetches messages -> sees ONLY client_review comments (1 comment)
    res = await client.get(f"/messages/video/{video_id}", headers=client_headers)
    assert res.status_code == 200
    messages = res.json()
    assert len(messages) == 1
    assert messages[0]["chat_type"] == "client_review"

    # Manager/Editor fetches messages -> sees ALL comments (2 comments)
    res = await client.get(f"/messages/video/{video_id}", headers=manager_headers)
    assert res.status_code == 200
    messages = res.json()
    assert len(messages) == 2

    # Client attempts to resolve feedback comment -> forbidden (403)
    res = await client.put(
        f"/messages/{client_msg_id}/resolve",
        headers=client_headers,
        json={"is_resolved": True}
    )
    assert res.status_code == 403

    # Editor resolves feedback comment -> succeeds
    res = await client.put(
        f"/messages/{client_msg_id}/resolve",
        headers=editor_headers,
        json={"is_resolved": True}
    )
    assert res.status_code == 200
    assert res.json()["is_resolved"] is True

    # ----------------------------------------------------
    # 9. NOTIFICATIONS
    # ----------------------------------------------------
    # Create notification for client user
    notification_payload = {
        "recipient_id": client_id,
        "title": "New Video Available",
        "message": "V1 is ready for review.",
        "project_id": project_id
    }
    res = await client.post("/notifications", headers=manager_headers, json=notification_payload)
    assert res.status_code == 201
    notification_id = res.json()["_id"]

    # Client gets notifications
    res = await client.get("/notifications", headers=client_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) == 1
    assert notifs[0]["_id"] == notification_id
    assert notifs[0]["is_read"] is False

    # Mark read
    res = await client.put(
        f"/notifications/{notification_id}/read",
        headers=client_headers,
        json={"is_read": True}
    )
    assert res.status_code == 200
    assert res.json()["is_read"] is True

    # ----------------------------------------------------
    # 10. STORAGE PRESIGNED ENDPOINTS
    # ----------------------------------------------------
    # S3 presign request
    res = await client.post(
        "/storage/presigned-url/s3",
        headers=editor_headers,
        json={"object_name": "videos/v1.mp4"}
    )
    assert res.status_code == 200
    assert "upload_url" in res.json()

    # Cloudinary presign request
    res = await client.post(
        "/storage/presigned-url/cloudinary",
        headers=editor_headers,
        json={"public_id": "videos/v1"}
    )
    assert res.status_code == 200
    assert "upload_url" in res.json()
    assert "signature" in res.json()
    assert "timestamp" in res.json()
    assert "api_key" in res.json()
