from fastapi.testclient import TestClient
from app.main import app
from app.services.db_service import db

client = TestClient(app)

def test_avatar_lifecycle():
    # 1. New user requesting presigned upload url
    test_uid = "emp-test-avatar-user"
    presigned_payload = {
        "employeeId": test_uid,
        "fileName": "profile_photo.png",
        "fileType": "image/png",
        "fileSize": 1024 * 500  # 500 KB
    }
    res = client.post("/api/profile/avatar/presigned-url", json=presigned_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert "uploadUrl" in data
    assert "fileUrl" in data
    assert "s3Key" in data
    assert "employees/emp-test-avatar-user/profile/avatar/" in data["s3Key"]

    # 2. Confirm avatar upload
    confirm_payload = {
        "employeeId": test_uid,
        "s3Key": data["s3Key"],
        "photoUrl": data["fileUrl"]
    }
    res_confirm = client.post("/api/profile/avatar/confirm", json=confirm_payload)
    assert res_confirm.status_code == 200, res_confirm.text
    confirm_data = res_confirm.json()
    assert confirm_data["profilePhotoUrl"] == data["fileUrl"]
    assert confirm_data["profilePhotoKey"] == data["s3Key"]

    # Verify user object in db
    emp = db.get_employee(test_uid)
    assert emp is not None
    assert emp.profilePhotoUrl == data["fileUrl"]

    # 3. Delete avatar
    res_del = client.delete(f"/api/profile/avatar/{test_uid}")
    assert res_del.status_code == 200, res_del.text
    del_data = res_del.json()
    assert del_data["profilePhotoUrl"] is None

    emp_after = db.get_employee(test_uid)
    assert emp_after.profilePhotoUrl is None
    assert emp_after.profilePhotoKey is None
    print("Avatar lifecycle tests passed successfully!")

if __name__ == "__main__":
    test_avatar_lifecycle()
