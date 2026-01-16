#!/usr/bin/env python3
"""
Supabase Notes Table Integration Test
Tests CRUD operations on the 'notes' table for Memor.ia mobile app
"""

import requests
import json
import os
from datetime import datetime
import sys

# Supabase configuration from .env
SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

# Test data
TEST_USER_ID = "test_user_123"
TEST_NOTE_ID = f"{int(datetime.now().timestamp())}_test_note"

def make_supabase_request(method, endpoint, data=None, params=None):
    """Make a request to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=data, params=params)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, params=params)
        
        return response
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def test_table_exists():
    """Test 1: Check if notes table exists by trying to read from it"""
    print("\n🔍 TEST 1: Checking if 'notes' table exists...")
    
    response = make_supabase_request("GET", "notes", params={"limit": 1})
    
    if response is None:
        print("❌ FAILED: Could not connect to Supabase")
        return False
    
    if response.status_code == 200:
        print("✅ SUCCESS: 'notes' table exists and is accessible")
        return True
    elif response.status_code == 404:
        print("❌ FAILED: 'notes' table does not exist")
        print("   Error: relation \"public.notes\" does not exist")
        return False
    elif response.status_code == 401:
        print("❌ FAILED: Authentication error - check API key")
        return False
    elif response.status_code == 403:
        print("❌ FAILED: Permission denied - check RLS policies")
        return False
    else:
        print(f"❌ FAILED: Unexpected status code {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_insert_note():
    """Test 2: Try to insert a test note"""
    print("\n📝 TEST 2: Testing INSERT operation...")
    
    test_note = {
        "id": TEST_NOTE_ID,
        "userId": TEST_USER_ID,
        "title": "Test Note Title",
        "content": "This is a test note content for Supabase integration testing.",
        "color": "blue",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=test_note)
    
    if response is None:
        print("❌ FAILED: Could not connect to Supabase")
        return False
    
    if response.status_code == 201:
        print("✅ SUCCESS: Note inserted successfully")
        result = response.json()
        if isinstance(result, list) and len(result) > 0:
            print(f"   Created note ID: {result[0].get('id')}")
        return True
    elif response.status_code == 409:
        print("⚠️  WARNING: Note with this ID already exists (conflict)")
        return True  # This is OK for testing
    elif response.status_code == 404:
        print("❌ FAILED: 'notes' table does not exist")
        return False
    elif response.status_code == 401:
        print("❌ FAILED: Authentication error")
        return False
    elif response.status_code == 403:
        print("❌ FAILED: Permission denied - check RLS policies")
        return False
    else:
        print(f"❌ FAILED: Insert failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_select_notes():
    """Test 3: Try to read notes from the table"""
    print("\n📖 TEST 3: Testing SELECT operation...")
    
    # Try to get all notes for our test user
    params = {"userId": f"eq.{TEST_USER_ID}"}
    response = make_supabase_request("GET", "notes", params=params)
    
    if response is None:
        print("❌ FAILED: Could not connect to Supabase")
        return False
    
    if response.status_code == 200:
        notes = response.json()
        print(f"✅ SUCCESS: Retrieved {len(notes)} notes for user {TEST_USER_ID}")
        
        # Check if our test note is there
        test_note_found = any(note.get('id') == TEST_NOTE_ID for note in notes)
        if test_note_found:
            print("   ✅ Test note found in results")
        else:
            print("   ⚠️  Test note not found (might not have been inserted)")
        
        return True
    else:
        print(f"❌ FAILED: Select failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_update_note():
    """Test 4: Try to update the test note"""
    print("\n✏️  TEST 4: Testing UPDATE operation...")
    
    update_data = {
        "title": "Updated Test Note Title",
        "content": "This content has been updated via PATCH request.",
        "isFavorite": True,
        "updatedAt": datetime.now().isoformat()
    }
    
    params = {"id": f"eq.{TEST_NOTE_ID}"}
    response = make_supabase_request("PATCH", "notes", data=update_data, params=params)
    
    if response is None:
        print("❌ FAILED: Could not connect to Supabase")
        return False
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS: Note updated successfully")
        if isinstance(result, list) and len(result) > 0:
            updated_note = result[0]
            print(f"   Updated title: {updated_note.get('title')}")
            print(f"   Is favorite: {updated_note.get('isFavorite')}")
        return True
    elif response.status_code == 404:
        print("❌ FAILED: Note not found for update (might not exist)")
        return False
    else:
        print(f"❌ FAILED: Update failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_delete_note():
    """Test 5: Try to delete the test note"""
    print("\n🗑️  TEST 5: Testing DELETE operation...")
    
    params = {"id": f"eq.{TEST_NOTE_ID}"}
    response = make_supabase_request("DELETE", "notes", params=params)
    
    if response is None:
        print("❌ FAILED: Could not connect to Supabase")
        return False
    
    if response.status_code in [200, 204]:
        print("✅ SUCCESS: Note deleted successfully")
        # Check if response contains the deleted record (Supabase returns 200 with data)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                print(f"   Deleted note ID: {result[0].get('id')}")
        return True
    elif response.status_code == 404:
        print("⚠️  WARNING: Note not found for deletion (might not exist)")
        return True  # This is OK for cleanup
    else:
        print(f"❌ FAILED: Delete failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_table_structure():
    """Test 6: Verify table structure by checking column names"""
    print("\n🏗️  TEST 6: Verifying table structure...")
    
    # Try to insert a note with all expected fields to verify structure
    complete_note = {
        "id": f"{TEST_NOTE_ID}_structure_test",
        "userId": TEST_USER_ID,
        "title": "Structure Test",
        "content": "Testing all fields",
        "color": "default",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=complete_note)
    
    if response and response.status_code in [201, 409]:
        print("✅ SUCCESS: All expected columns are present")
        
        # Clean up the structure test note
        params = {"id": f"eq.{TEST_NOTE_ID}_structure_test"}
        make_supabase_request("DELETE", "notes", params=params)
        
        return True
    else:
        print("❌ FAILED: Table structure issues detected")
        if response:
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
        return False

def main():
    """Run all Supabase notes table tests"""
    print("🚀 Starting Supabase Notes Table Integration Tests")
    print("=" * 60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Testing with user ID: {TEST_USER_ID}")
    print(f"Test note ID: {TEST_NOTE_ID}")
    
    tests = [
        ("Table Exists", test_table_exists),
        ("Insert Note", test_insert_note),
        ("Select Notes", test_select_notes),
        ("Update Note", test_update_note),
        ("Delete Note", test_delete_note),
        ("Table Structure", test_table_structure)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ FAILED: {test_name} - Exception: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - Supabase notes table integration is working!")
        return True
    else:
        print("⚠️  SOME TESTS FAILED - Check the issues above")
        
        # Provide specific guidance based on failures
        failed_tests = [name for name, result in results if not result]
        
        if "Table Exists" in failed_tests:
            print("\n🔧 REQUIRED ACTION:")
            print("   The 'notes' table does not exist in Supabase.")
            print("   You need to create it with this SQL:")
            print("""
   CREATE TABLE notes (
     id text PRIMARY KEY,
     userId text NOT NULL,
     title text,
     content text,
     color text DEFAULT 'default',
     isPinned boolean DEFAULT false,
     isFavorite boolean DEFAULT false,
     createdAt timestamp with time zone DEFAULT now(),
     updatedAt timestamp with time zone DEFAULT now()
   );
   
   -- Enable RLS
   ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
   
   -- Create policy to allow all operations (adjust as needed)
   CREATE POLICY "Allow all operations on notes" ON notes
   FOR ALL USING (true);
            """)
        
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)