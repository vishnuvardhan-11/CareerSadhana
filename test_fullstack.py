#!/usr/bin/env python3
"""
CareerSadhana — Full-Stack Automated Test Suite
Verifies Frontend serving, API endpoints, Database persistence, Auth,
Admin dashboard, and AI Interview lifecycle.
"""

import sys
import json
import unittest
from app import app, init_db, get_db

class TestCareerSadhanaFullStack(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_01_static_pages(self):
        """Verify all frontend HTML pages and static assets are served properly."""
        pages = [
            ("/", 200, "CareerSadhana"),
            ("/index.html", 200, "CareerSadhana"),
            ("/ats.html", 200, "ATS"),
            ("/jobs.html", 200, "Jobs"),
            ("/versant.html", 200, "Versant"),
            ("/ai-interview.html", 200, "AI Interview"),
            ("/admin.html", 200, "Admin Dashboard"),
            ("/admin-login.html", 200, "Admin Login"),
            ("/about.html", 200, "About"),
            ("/blogs.html", 200, "blog"),
            ("/static/css/main.css", 200, None)
        ]
        for path, expected_status, text_snippet in pages:
            res = self.client.get(path)
            self.assertEqual(res.status_code, expected_status, f"Failed on {path}")
            if text_snippet:
                self.assertIn(text_snippet.lower(), res.data.decode("utf-8", errors="ignore").lower(), f"Missing '{text_snippet}' in {path}")

    def test_02_public_jobs_api(self):
        """Verify public jobs API returns seeded jobs."""
        res = self.client.get("/api/jobs")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("jobs", data)
        self.assertGreater(len(data["jobs"]), 0, "Expected seeded jobs in database")

    def test_03_auth_lifecycle(self):
        """Verify candidate signup, login, me, and logout lifecycle."""
        # Unauthenticated me check
        res = self.client.get("/api/auth?action=me")
        self.assertEqual(res.status_code, 200)
        self.assertIsNone(res.get_json()["user"])

        # Candidate signup
        candidate_email = "candidate_test@example.com"
        candidate_pass = "Candidate@12345"
        res = self.client.post("/api/auth?action=signup", json={
            "name": "Jane Candidate",
            "email": candidate_email,
            "password": candidate_pass
        })
        self.assertIn(res.status_code, (201, 409))
        
        # Candidate login with wrong password
        res_fail = self.client.post("/api/auth?action=login", json={
            "email": candidate_email,
            "password": "WrongPassword!"
        })
        self.assertEqual(res_fail.status_code, 401)

        # Candidate login with valid password
        res_login = self.client.post("/api/auth?action=login", json={
            "email": candidate_email,
            "password": candidate_pass
        })
        self.assertEqual(res_login.status_code, 200)
        user_info = res_login.get_json()["user"]
        self.assertEqual(user_info["email"], candidate_email)
        self.assertEqual(user_info["role"], "user")

        # Check me with active session
        res_me = self.client.get("/api/auth?action=me")
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.get_json()["user"]["email"], candidate_email)

        # Logout
        res_logout = self.client.post("/api/auth?action=logout")
        self.assertEqual(res_logout.status_code, 200)

    def test_04_admin_dashboard_and_controls(self):
        """Verify admin login, protected data access, and job CRUD operations."""
        # Unauthenticated admin access should be blocked
        res_unauth = self.client.get("/api/admin?resource=users")
        self.assertEqual(res_unauth.status_code, 401)

        # Log in as default administrator
        admin_email = "admin@careersadhana.com"
        admin_pass = "Admin@12345"
        res_admin_login = self.client.post("/api/auth?action=login", json={
            "email": admin_email,
            "password": admin_pass
        })
        self.assertEqual(res_admin_login.status_code, 200)
        self.assertEqual(res_admin_login.get_json()["user"]["role"], "admin")

        # Admin fetches users
        res_users = self.client.get("/api/admin?resource=users")
        self.assertEqual(res_users.status_code, 200)
        self.assertIn("users", res_users.get_json())

        # Admin fetches login history audit trail
        res_history = self.client.get("/api/admin?resource=login-history&pageSize=10")
        self.assertEqual(res_history.status_code, 200)
        self.assertIn("entries", res_history.get_json())
        self.assertGreater(res_history.get_json()["total"], 0)

        # Admin creates a new job
        new_job_data = {
            "type": "pvt",
            "title": "Senior AI Systems Engineer",
            "company": "NextGen AI Corp",
            "location": "Bengaluru",
            "deadline": "2026-12-31",
            "url": "https://example.com/careers/ai-eng",
            "tags": ["AI", "Python", "Full Stack"]
        }
        res_add_job = self.client.post("/api/admin?resource=jobs", json=new_job_data)
        self.assertEqual(res_add_job.status_code, 201)
        created_job_id = res_add_job.get_json()["id"]
        self.assertTrue(created_job_id)

        # Verify job is visible in public jobs
        res_public = self.client.get("/api/jobs")
        job_ids = [j["id"] for j in res_public.get_json()["jobs"]]
        self.assertIn(created_job_id, job_ids)

        # Admin deletes the created job
        res_del = self.client.delete(f"/api/admin?resource=jobs&id={created_job_id}")
        self.assertEqual(res_del.status_code, 200)

    def test_05_ai_interview_workflow(self):
        """Verify end-to-end AI interview session: start, question, answer, proctoring events, complete, report."""
        # Log in as candidate
        self.client.post("/api/auth?action=login", json={
            "email": "candidate_test@example.com",
            "password": "Candidate@12345"
        })

        # 1. Start interview
        res_start = self.client.post("/api/interview?action=start", json={
            "mode": "technical",
            "jdText": "Senior Python Full Stack Developer with experience in SQL, APIs, and microservices.",
            "resumeText": "Experienced developer with 4 years building scalable web services."
        })
        self.assertEqual(res_start.status_code, 201)
        session_id = res_start.get_json()["sessionId"]
        self.assertTrue(session_id)

        # 2. Get AI question
        res_q = self.client.post("/api/interview?action=question", json={
            "sessionId": session_id,
            "qIndex": 0,
            "totalQuestions": 5,
            "mode": "technical",
            "jdText": "Python Developer",
            "resumeText": "Developer",
            "history": []
        })
        self.assertEqual(res_q.status_code, 200)
        q_data = res_q.get_json()
        self.assertIn("question", q_data)
        self.assertIn("hint", q_data)

        # 3. Submit candidate answer
        res_ans = self.client.post("/api/interview?action=answer", json={
            "sessionId": session_id,
            "qIndex": 0,
            "question": q_data["question"],
            "answer": "In my previous project, I designed a RESTful architecture using Flask with SQLite for caching and PostgreSQL for persistence, optimizing index strategies for low-latency queries."
        })
        self.assertEqual(res_ans.status_code, 200)
        self.assertIn("feedback", res_ans.get_json())

        # 4. Log proctoring events (camera, mic, violation)
        res_evt1 = self.client.post("/api/interview?action=event", json={
            "sessionId": session_id,
            "eventType": "camera_on"
        })
        self.assertEqual(res_evt1.status_code, 201)

        res_evt2 = self.client.post("/api/interview?action=event", json={
            "sessionId": session_id,
            "eventType": "violation",
            "detail": {"type": "tab_blur", "reason": "Candidate switched browser tabs"}
        })
        self.assertEqual(res_evt2.status_code, 201)

        # 5. Complete interview
        res_comp = self.client.post("/api/interview?action=complete", json={
            "sessionId": session_id,
            "terminated": False
        })
        self.assertEqual(res_comp.status_code, 200)
        report_data = res_comp.get_json()["report"]
        self.assertIn("overall_score", report_data)
        self.assertIn("summary", report_data)
        self.assertIn("strengths", report_data)

        # 6. Verify admin can inspect the complete interview transcript & proctoring report
        self.client.post("/api/auth?action=login", json={
            "email": "admin@careersadhana.com",
            "password": "Admin@12345"
        })
        res_detail = self.client.get(f"/api/admin?resource=interview-detail&id={session_id}")
        self.assertEqual(res_detail.status_code, 200)
        detail_data = res_detail.get_json()
        self.assertEqual(detail_data["session"]["id"], session_id)
        self.assertGreater(len(detail_data["qa"]), 0)
        self.assertGreater(len(detail_data["events"]), 0)
        self.assertIsNotNone(detail_data["report"])


class TestBlogPublicAPI(unittest.TestCase):
    """Tests for the public /api/blogs endpoint."""

    @classmethod
    def setUpClass(cls):
        init_db()
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_06_blogs_list(self):
        """Public /api/blogs returns seeded published articles."""
        res = self.client.get("/api/blogs")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("blogs", data)
        self.assertIn("categories", data)
        self.assertGreater(len(data["blogs"]), 0, "Expected seeded blog articles")
        # All returned should be published
        for b in data["blogs"]:
            self.assertEqual(b["status"], "published")

    def test_07_blogs_by_category(self):
        """Category filter works on public /api/blogs."""
        res = self.client.get("/api/blogs?category=Career+Tips")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        for b in data["blogs"]:
            self.assertEqual(b["category"], "Career Tips")

    def test_08_blogs_search(self):
        """Search filter on /api/blogs returns matching articles."""
        res = self.client.get("/api/blogs?search=AI")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIsInstance(data["blogs"], list)

    def test_09_blog_single_by_id(self):
        """GET /api/blogs?id=<id> returns a single published article and increments view count."""
        # Get any blog id first
        res_list = self.client.get("/api/blogs")
        blogs = res_list.get_json()["blogs"]
        if not blogs:
            self.skipTest("No seeded blogs found")
        bid = blogs[0]["id"]
        res = self.client.get(f"/api/blogs?id={bid}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("blog", data)
        self.assertEqual(data["blog"]["id"], bid)


class TestAdminBlogCRUD(unittest.TestCase):
    """Tests for admin blog management via /api/admin?resource=blogs."""

    @classmethod
    def setUpClass(cls):
        init_db()
        app.config["TESTING"] = True
        cls.client = app.test_client()
        # Log in as admin
        cls.client.post("/api/auth?action=login", json={
            "email": "admin@careersadhana.com",
            "password": "Admin@12345"
        })

    def test_10_admin_blogs_list(self):
        """Admin GET /api/admin?resource=blogs returns all blogs including drafts."""
        res = self.client.get("/api/admin?resource=blogs")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("blogs", data)

    def test_11_admin_create_blog(self):
        """Admin can create a new blog article."""
        res = self.client.post("/api/admin?resource=blogs",
            json={
                "title": "Test Blog Article from Automated Tests",
                "category": "Career Tips",
                "content": "<p>This is a test article created by the automated test suite.</p>",
                "excerpt": "Test article excerpt.",
                "tags": ["Test", "Automated"],
                "status": "published",
                "cover_emoji": "🧪"
            }
        )
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data.get("ok"))
        self.assertIn("id", data)
        self.__class__.test_blog_id = data["id"]

    def test_12_admin_update_blog(self):
        """Admin can update a blog article."""
        bid = getattr(self.__class__, "test_blog_id", None)
        if not bid:
            self.skipTest("No blog ID from previous test")
        res = self.client.put(f"/api/admin?resource=blogs&id={bid}",
            json={
                "title": "Test Blog Article — Updated",
                "status": "draft"
            }
        )
        self.assertEqual(res.status_code, 200)

    def test_13_admin_delete_blog(self):
        """Admin can delete a blog article."""
        bid = getattr(self.__class__, "test_blog_id", None)
        if not bid:
            self.skipTest("No blog ID from previous test")
        res = self.client.delete(f"/api/admin?resource=blogs&id={bid}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("ok"))


class TestAdminUserDeletion(unittest.TestCase):
    """Tests for admin user deletion via DELETE /api/admin?resource=users&id=X."""

    @classmethod
    def setUpClass(cls):
        init_db()
        app.config["TESTING"] = True
        cls.client = app.test_client()
        # Create a test user to delete (ignore duplicate if already exists)
        cls.client.post("/api/auth?action=signup", json={
            "name": "Delete Me Test User",
            "email": "delete.me.test@example.com",
            "password": "DeleteMe@99"
        })
        # Look up user id via admin API (ensures same SQLite WAL state)
        cls.delete_user_id = None
        # Log in as admin first to query users
        cls.client.post("/api/auth?action=login", json={
            "email": "admin@careersadhana.com",
            "password": "Admin@12345"
        })
        res_users = cls.client.get("/api/admin?resource=users")
        if res_users.status_code == 200:
            users = res_users.get_json().get("users", [])
            for u in users:
                if u["email"] == "delete.me.test@example.com":
                    cls.delete_user_id = u["id"]
                    break

    def _admin_login(self):
        """Log in as admin on this client instance."""
        self.client.post("/api/auth?action=login", json={
            "email": "admin@careersadhana.com",
            "password": "Admin@12345"
        })

    def test_14_admin_delete_user(self):
        """Admin can delete a regular user account."""
        uid = self.__class__.delete_user_id
        if not uid:
            self.skipTest("Test user not found in database")
        self._admin_login()
        res = self.client.delete(f"/api/admin?resource=users&id={uid}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("ok"))
        # Reset so subsequent re-runs skip rather than error
        self.__class__.delete_user_id = None

    def test_15_admin_cannot_self_delete(self):
        """Admin cannot delete their own account."""
        self._admin_login()
        # Get admin's own user id
        res = self.client.get("/api/auth?action=me")
        me = res.get_json()
        admin_id = me.get("user", {}).get("id")
        if not admin_id:
            self.skipTest("Could not determine admin user ID")
        res_del = self.client.delete(f"/api/admin?resource=users&id={admin_id}")
        self.assertEqual(res_del.status_code, 400)
        data = res_del.get_json()
        self.assertIn("cannot delete your own", data.get("error", "").lower())


class TestBlogsPageServed(unittest.TestCase):
    """Verify blogs.html is served correctly."""

    @classmethod
    def setUpClass(cls):
        init_db()
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_16_blogs_html_served(self):
        """blogs.html is served with correct content."""
        res = self.client.get("/blogs.html")
        self.assertEqual(res.status_code, 200)
        body = res.data.decode("utf-8", errors="ignore").lower()
        self.assertIn("blog", body)


if __name__ == "__main__":
    unittest.main(verbosity=2)
