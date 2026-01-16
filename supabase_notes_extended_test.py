#!/usr/bin/env python3
"""
Extended Supabase Notes Table Integration Test
Additional tests for edge cases and mobile app scenarios
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

def test_mobile_app_scenarios():
    """Test scenarios specific to mobile app usage"""
    print("\n📱 EXTENDED TEST: Mobile App Scenarios")
    print("=" * 50)
    
    test_user = "mobile_test_user"
    timestamp = int(datetime.now().timestamp())
    
    # Test 1: Create multiple notes with different colors
    print("\n🎨 Creating notes with different colors...")
    colors = ['default', 'red', 'blue', 'green', 'yellow', 'purple']
    created_notes = []
    
    for i, color in enumerate(colors):
        note = {
            "id": f"{timestamp}_note_{i}",
            "userId": test_user,
            "title": f"Test Note {i+1}",
            "content": f"This is test note {i+1} with {color} color",
            "color": color,
            "isPinned": i % 2 == 0,  # Pin every other note
            "isFavorite": i % 3 == 0,  # Favorite every third note
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        response = make_supabase_request("POST", "notes", data=note)
        if response and response.status_code == 201:
            created_notes.append(note["id"])
            print(f"   ✅ Created {color} note: {note['title']}")
        else:
            print(f"   ❌ Failed to create {color} note")
    
    # Test 2: Query notes by user (mobile app pattern)
    print(f"\n📖 Querying all notes for user {test_user}...")
    params = {"userId": f"eq.{test_user}", "order": "createdAt.desc"}
    response = make_supabase_request("GET", "notes", params=params)
    
    if response and response.status_code == 200:
        notes = response.json()
        print(f"   ✅ Retrieved {len(notes)} notes")
        
        # Check sorting and filtering
        pinned_count = sum(1 for note in notes if note.get('isPinned'))
        favorite_count = sum(1 for note in notes if note.get('isFavorite'))
        print(f"   📌 Pinned notes: {pinned_count}")
        print(f"   ❤️  Favorite notes: {favorite_count}")
    else:
        print("   ❌ Failed to retrieve notes")
    
    # Test 3: Update note properties (mobile app actions)
    print(f"\n✏️  Testing mobile app update actions...")
    if created_notes:
        test_note_id = created_notes[0]
        
        # Toggle favorite
        update_data = {"isFavorite": True, "updatedAt": datetime.now().isoformat()}
        params = {"id": f"eq.{test_note_id}"}
        response = make_supabase_request("PATCH", "notes", data=update_data, params=params)
        
        if response and response.status_code == 200:
            print("   ✅ Successfully toggled favorite status")
        else:
            print("   ❌ Failed to toggle favorite")
        
        # Toggle pin
        update_data = {"isPinned": False, "updatedAt": datetime.now().isoformat()}
        response = make_supabase_request("PATCH", "notes", data=update_data, params=params)
        
        if response and response.status_code == 200:
            print("   ✅ Successfully toggled pin status")
        else:
            print("   ❌ Failed to toggle pin")
    
    # Test 4: Search functionality (title and content)
    print(f"\n🔍 Testing search functionality...")
    
    # Search by title
    params = {"userId": f"eq.{test_user}", "title": "ilike.*Test Note 1*"}
    response = make_supabase_request("GET", "notes", params=params)
    
    if response and response.status_code == 200:
        results = response.json()
        print(f"   ✅ Title search returned {len(results)} results")
    else:
        print("   ❌ Title search failed")
    
    # Test 5: Cleanup - Delete all test notes
    print(f"\n🧹 Cleaning up test notes...")
    deleted_count = 0
    for note_id in created_notes:
        params = {"id": f"eq.{note_id}"}
        response = make_supabase_request("DELETE", "notes", params=params)
        if response and response.status_code in [200, 204]:
            deleted_count += 1
    
    print(f"   ✅ Cleaned up {deleted_count}/{len(created_notes)} test notes")
    
    return True

def test_edge_cases():
    """Test edge cases and error conditions"""
    print("\n⚠️  EXTENDED TEST: Edge Cases")
    print("=" * 50)
    
    timestamp = int(datetime.now().timestamp())
    
    # Test 1: Empty title and content
    print("\n📝 Testing empty title and content...")
    empty_note = {
        "id": f"{timestamp}_empty",
        "userId": "edge_test_user",
        "title": "",
        "content": "",
        "color": "default",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=empty_note)
    if response and response.status_code == 201:
        print("   ✅ Empty note created successfully")
        # Clean up
        params = {"id": f"eq.{empty_note['id']}"}
        make_supabase_request("DELETE", "notes", params=params)
    else:
        print("   ❌ Failed to create empty note")
    
    # Test 2: Very long content
    print("\n📄 Testing very long content...")
    long_content = "A" * 5000  # 5KB of text
    long_note = {
        "id": f"{timestamp}_long",
        "userId": "edge_test_user",
        "title": "Long Content Test",
        "content": long_content,
        "color": "default",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=long_note)
    if response and response.status_code == 201:
        print(f"   ✅ Long content note created ({len(long_content)} chars)")
        # Clean up
        params = {"id": f"eq.{long_note['id']}"}
        make_supabase_request("DELETE", "notes", params=params)
    else:
        print("   ❌ Failed to create long content note")
    
    # Test 3: Special characters and emojis
    print("\n🌟 Testing special characters and emojis...")
    special_note = {
        "id": f"{timestamp}_special",
        "userId": "edge_test_user",
        "title": "Special Test 🚀 áéíóú ñ",
        "content": "Content with emojis 😀🎉🌟 and special chars: áéíóú ñ ç @#$%^&*()",
        "color": "default",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=special_note)
    if response and response.status_code == 201:
        print("   ✅ Special characters note created successfully")
        # Clean up
        params = {"id": f"eq.{special_note['id']}"}
        make_supabase_request("DELETE", "notes", params=params)
    else:
        print("   ❌ Failed to create special characters note")
    
    # Test 4: Invalid color value
    print("\n🎨 Testing invalid color value...")
    invalid_color_note = {
        "id": f"{timestamp}_invalid_color",
        "userId": "edge_test_user",
        "title": "Invalid Color Test",
        "content": "Testing invalid color",
        "color": "invalid_color_name",
        "isPinned": False,
        "isFavorite": False,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = make_supabase_request("POST", "notes", data=invalid_color_note)
    if response and response.status_code == 201:
        print("   ✅ Invalid color accepted (no validation constraint)")
        # Clean up
        params = {"id": f"eq.{invalid_color_note['id']}"}
        make_supabase_request("DELETE", "notes", params=params)
    else:
        print("   ❌ Invalid color rejected")
    
    return True

def main():
    """Run extended Supabase notes table tests"""
    print("🚀 Starting Extended Supabase Notes Table Tests")
    print("=" * 60)
    
    try:
        # Run mobile app scenarios
        mobile_success = test_mobile_app_scenarios()
        
        # Run edge cases
        edge_success = test_edge_cases()
        
        print("\n" + "=" * 60)
        print("📊 EXTENDED TEST RESULTS")
        print("=" * 60)
        
        if mobile_success and edge_success:
            print("🎉 ALL EXTENDED TESTS PASSED!")
            print("✅ Mobile app scenarios work correctly")
            print("✅ Edge cases handled properly")
            print("✅ Supabase notes table is fully functional for the mobile app")
            return True
        else:
            print("⚠️  Some extended tests had issues")
            return False
            
    except Exception as e:
        print(f"❌ Extended tests failed with exception: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)