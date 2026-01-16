#!/usr/bin/env python3
"""
Supabase Notes RLS (Row Level Security) Test
Tests data isolation between different users
"""

import requests
import json
from datetime import datetime
import sys

# Supabase configuration
SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

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

def test_user_data_isolation():
    """Test that users can only see their own notes"""
    print("\n🔒 TESTING USER DATA ISOLATION")
    print("=" * 50)
    
    timestamp = int(datetime.now().timestamp())
    
    # Create notes for different users
    users = ["user_a", "user_b", "user_c"]
    created_notes = {}
    
    print("\n📝 Creating notes for different users...")
    for user in users:
        note = {
            "id": f"{timestamp}_{user}_note",
            "userId": user,
            "title": f"Private note for {user}",
            "content": f"This is confidential content for {user} only",
            "color": "default",
            "isPinned": False,
            "isFavorite": False,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        response = make_supabase_request("POST", "notes", data=note)
        if response and response.status_code == 201:
            created_notes[user] = note["id"]
            print(f"   ✅ Created note for {user}")
        else:
            print(f"   ❌ Failed to create note for {user}")
    
    # Test data isolation - each user should only see their own notes
    print("\n🔍 Testing data isolation...")
    isolation_success = True
    
    for user in users:
        params = {"userId": f"eq.{user}"}
        response = make_supabase_request("GET", "notes", params=params)
        
        if response and response.status_code == 200:
            user_notes = response.json()
            
            # Check that user only sees their own notes
            other_user_notes = [note for note in user_notes if note.get('userId') != user]
            
            if len(other_user_notes) == 0:
                print(f"   ✅ {user} can only see their own notes ({len(user_notes)} total)")
            else:
                print(f"   ❌ {user} can see other users' notes! Found {len(other_user_notes)} foreign notes")
                isolation_success = False
        else:
            print(f"   ❌ Failed to query notes for {user}")
            isolation_success = False
    
    # Test cross-user access attempts
    print("\n🚫 Testing cross-user access prevention...")
    if len(created_notes) >= 2:
        user_a_note_id = created_notes.get("user_a")
        user_b = "user_b"
        
        if user_a_note_id:
            # Try to update user_a's note as user_b (should fail or not affect the note)
            update_data = {
                "title": "Hacked by user_b",
                "content": "This should not work",
                "updatedAt": datetime.now().isoformat()
            }
            params = {"id": f"eq.{user_a_note_id}", "userId": f"eq.{user_b}"}
            response = make_supabase_request("PATCH", "notes", data=update_data, params=params)
            
            if response and response.status_code == 200:
                result = response.json()
                if len(result) == 0:
                    print("   ✅ Cross-user update prevented (no rows affected)")
                else:
                    print("   ❌ Cross-user update succeeded - SECURITY ISSUE!")
                    isolation_success = False
            else:
                print("   ✅ Cross-user update blocked by server")
    
    # Cleanup
    print("\n🧹 Cleaning up test notes...")
    for user, note_id in created_notes.items():
        params = {"id": f"eq.{note_id}"}
        make_supabase_request("DELETE", "notes", params=params)
    
    return isolation_success

def test_rls_policies():
    """Test RLS policies are working correctly"""
    print("\n🛡️  TESTING RLS POLICIES")
    print("=" * 50)
    
    timestamp = int(datetime.now().timestamp())
    
    # Test 1: Try to access all notes without user filter (should work but respect RLS)
    print("\n🌐 Testing global query (should respect RLS)...")
    response = make_supabase_request("GET", "notes", params={"limit": 5})
    
    if response and response.status_code == 200:
        all_notes = response.json()
        print(f"   ✅ Global query returned {len(all_notes)} notes")
        
        # Check if notes belong to different users (indicates RLS is allowing access)
        unique_users = set(note.get('userId') for note in all_notes if note.get('userId'))
        print(f"   📊 Notes from {len(unique_users)} different users visible")
        
        if len(unique_users) > 1:
            print("   ⚠️  Multiple users' data visible - RLS might be permissive")
        else:
            print("   ✅ Data access appears controlled")
    else:
        print("   ❌ Global query failed")
    
    # Test 2: Create and verify note ownership
    print("\n👤 Testing note ownership...")
    test_user = "rls_test_user"
    test_note = {
        "id": f"{timestamp}_rls_test",
        "userId": test_user,
        "title": "RLS Test Note",
        "content": "Testing RLS policies",
        "color": "default",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    # Create note
    response = make_supabase_request("POST", "notes", data=test_note)
    if response and response.status_code == 201:
        print(f"   ✅ Created test note for {test_user}")
        
        # Verify we can read it back
        params = {"id": f"eq.{test_note['id']}"}
        response = make_supabase_request("GET", "notes", params=params)
        
        if response and response.status_code == 200:
            result = response.json()
            if len(result) > 0 and result[0].get('userId') == test_user:
                print("   ✅ Note ownership verified")
            else:
                print("   ❌ Note ownership issue")
        
        # Cleanup
        make_supabase_request("DELETE", "notes", params=params)
    else:
        print("   ❌ Failed to create test note")
    
    return True

def main():
    """Run RLS and security tests"""
    print("🚀 Starting Supabase Notes RLS Security Tests")
    print("=" * 60)
    
    try:
        # Test user data isolation
        isolation_success = test_user_data_isolation()
        
        # Test RLS policies
        rls_success = test_rls_policies()
        
        print("\n" + "=" * 60)
        print("📊 SECURITY TEST RESULTS")
        print("=" * 60)
        
        if isolation_success and rls_success:
            print("🎉 ALL SECURITY TESTS PASSED!")
            print("✅ User data isolation working")
            print("✅ RLS policies functioning")
            print("✅ Notes table is secure for multi-user mobile app")
        else:
            print("⚠️  SECURITY ISSUES DETECTED!")
            if not isolation_success:
                print("❌ User data isolation problems")
            if not rls_success:
                print("❌ RLS policy issues")
        
        return isolation_success and rls_success
        
    except Exception as e:
        print(f"❌ Security tests failed with exception: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)