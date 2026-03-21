import unittest as ut
from accounts import login, register

class TestAccounts(ut.TestCase):
    def test_register(self):
        result = register("test", "password")
        self.assertEqual(result, "Registration successful")

    def test_register_existing_email(self):
        register("test", "password")
        result = register("test", "password")
        self.assertEqual(result, "E-Mail already exists, please login instead")

    def test_login_success(self):
        register("test", "password")
        result = login("test", "password")
        self.assertEqual(result, "Login successful")

    def test_login_invalid_credentials(self):
        result = login("test", "wrongpassword")
        self.assertEqual(result, "Invalid email or password")

#TestAccounts().test_register()
TestAccounts().test_register_existing_email()
TestAccounts().test_login_success()
TestAccounts().test_login_invalid_credentials()