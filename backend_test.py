#!/usr/bin/env python3
"""
Backend API Testing for Memor.ia Link and Clipboard Manager
Tests all CRUD operations for Links and Folders APIs
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Base URL from environment
BASE_URL = "https://memor-app-revamp.preview.emergentagent.com"

class MemoriaAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Memoria-API-Tester/1.0'
        })
        self.test_results = []
        self.created_items = []  # Track created items for cleanup
        
    def log_result(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                return False, f"Unsupported method: {method}", 400
                
            # Try to parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = response.text
                
            return response.status_code < 400, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}", 0
    
    def test_links_get_all(self):
        """Test GET /api/links - get all links"""
        print("\n=== Testing Links API - GET All ===")
        
        success, data, status_code = self.make_request('GET', '/api/links')
        
        if success:
            if isinstance(data, list):
                self.log_result("GET /api/links", True, f"Retrieved {len(data)} items successfully")
                return data
            else:
                self.log_result("GET /api/links", False, f"Expected array, got: {type(data)}")
        else:
            self.log_result("GET /api/links", False, f"Request failed (status {status_code}): {data}")
        
        return []
    
    def test_links_post_link(self):
        """Test POST /api/links - create new link"""
        print("\n=== Testing Links API - POST Link ===")
        
        test_data = {
            "url": "https://google.com",
            "contentType": "link"
        }
        
        success, data, status_code = self.make_request('POST', '/api/links', test_data)
        
        if success:
            if isinstance(data, dict) and data.get('success') and data.get('data'):
                link_data = data['data']
                link_id = link_data.get('id')
                
                # Verify the created link has correct properties
                if (link_data.get('contentType') == 'link' and 
                    link_data.get('url') == 'https://google.com' and
                    link_id):
                    
                    self.created_items.append(('link', link_id))
                    self.log_result("POST /api/links (link)", True, 
                                  f"Link created successfully with ID: {link_id}")
                    return link_id
                else:
                    self.log_result("POST /api/links (link)", False, 
                                  f"Link created but missing expected properties: {link_data}")
            else:
                self.log_result("POST /api/links (link)", False, 
                              f"Unexpected response format: {data}")
        else:
            self.log_result("POST /api/links (link)", False, 
                          f"Request failed (status {status_code}): {data}")
        
        return None
    
    def test_links_post_note(self):
        """Test POST /api/links - create new note"""
        print("\n=== Testing Links API - POST Note ===")
        
        test_data = {
            "content": "This is a test note for API testing",
            "title": "Test Note",
            "contentType": "text"
        }
        
        success, data, status_code = self.make_request('POST', '/api/links', test_data)
        
        if success:
            if isinstance(data, dict) and data.get('success') and data.get('data'):
                note_data = data['data']
                note_id = note_data.get('id')
                
                # Verify the created note has correct properties
                if (note_data.get('contentType') == 'text' and 
                    note_data.get('content') == test_data['content'] and
                    note_data.get('title') == test_data['title'] and
                    note_id):
                    
                    self.created_items.append(('note', note_id))
                    self.log_result("POST /api/links (note)", True, 
                                  f"Note created successfully with ID: {note_id}")
                    return note_id
                else:
                    self.log_result("POST /api/links (note)", False, 
                                  f"Note created but missing expected properties: {note_data}")
            else:
                self.log_result("POST /api/links (note)", False, 
                              f"Unexpected response format: {data}")
        else:
            self.log_result("POST /api/links (note)", False, 
                          f"Request failed (status {status_code}): {data}")
        
        return None
    
    def test_links_patch(self, item_id: str):
        """Test PATCH /api/links - update item"""
        print("\n=== Testing Links API - PATCH Update ===")
        
        if not item_id:
            self.log_result("PATCH /api/links", False, "No item ID provided for update test")
            return
        
        update_data = {
            "id": item_id,
            "title": "Updated Test Title"
        }
        
        success, data, status_code = self.make_request('PATCH', '/api/links', update_data)
        
        if success:
            if isinstance(data, dict) and data.get('success') and data.get('data'):
                updated_data = data['data']
                if updated_data.get('title') == "Updated Test Title":
                    self.log_result("PATCH /api/links", True, 
                                  f"Item updated successfully: {updated_data.get('title')}")
                else:
                    self.log_result("PATCH /api/links", False, 
                                  f"Update didn't apply correctly: {updated_data}")
            else:
                self.log_result("PATCH /api/links", False, 
                              f"Unexpected response format: {data}")
        else:
            self.log_result("PATCH /api/links", False, 
                          f"Request failed (status {status_code}): {data}")
    
    def test_links_delete(self, item_id: str):
        """Test DELETE /api/links - delete item"""
        print("\n=== Testing Links API - DELETE ===")
        
        if not item_id:
            self.log_result("DELETE /api/links", False, "No item ID provided for delete test")
            return
        
        success, data, status_code = self.make_request('DELETE', '/api/links', params={'id': item_id})
        
        if success:
            if isinstance(data, dict) and data.get('success'):
                self.log_result("DELETE /api/links", True, f"Item deleted successfully: {item_id}")
                # Remove from created_items since it's deleted
                self.created_items = [(t, i) for t, i in self.created_items if i != item_id]
            else:
                self.log_result("DELETE /api/links", False, f"Unexpected response: {data}")
        else:
            self.log_result("DELETE /api/links", False, 
                          f"Request failed (status {status_code}): {data}")
    
    def test_folders_get_all(self):
        """Test GET /api/folders - get all folders"""
        print("\n=== Testing Folders API - GET All ===")
        
        success, data, status_code = self.make_request('GET', '/api/folders')
        
        if success:
            if isinstance(data, list):
                self.log_result("GET /api/folders", True, f"Retrieved {len(data)} folders successfully")
                return data
            else:
                self.log_result("GET /api/folders", False, f"Expected array, got: {type(data)}")
        else:
            self.log_result("GET /api/folders", False, f"Request failed (status {status_code}): {data}")
        
        return []
    
    def test_folders_get_by_type(self):
        """Test GET /api/folders with folderType filter"""
        print("\n=== Testing Folders API - GET by Type ===")
        
        # Test link folders
        success, data, status_code = self.make_request('GET', '/api/folders', params={'folderType': 'link'})
        
        if success:
            if isinstance(data, list):
                # Verify all returned folders are link type
                link_folders = [f for f in data if f.get('folderType', 'link') == 'link']
                if len(link_folders) == len(data):
                    self.log_result("GET /api/folders?folderType=link", True, 
                                  f"Retrieved {len(data)} link folders successfully")
                else:
                    self.log_result("GET /api/folders?folderType=link", False, 
                                  f"Filter not working correctly: {len(link_folders)}/{len(data)} are link type")
            else:
                self.log_result("GET /api/folders?folderType=link", False, f"Expected array, got: {type(data)}")
        else:
            self.log_result("GET /api/folders?folderType=link", False, 
                          f"Request failed (status {status_code}): {data}")
        
        # Test text folders
        success, data, status_code = self.make_request('GET', '/api/folders', params={'folderType': 'text'})
        
        if success:
            if isinstance(data, list):
                # Verify all returned folders are text type
                text_folders = [f for f in data if f.get('folderType') == 'text']
                if len(text_folders) == len(data):
                    self.log_result("GET /api/folders?folderType=text", True, 
                                  f"Retrieved {len(data)} text folders successfully")
                else:
                    self.log_result("GET /api/folders?folderType=text", False, 
                                  f"Filter not working correctly: {len(text_folders)}/{len(data)} are text type")
            else:
                self.log_result("GET /api/folders?folderType=text", False, f"Expected array, got: {type(data)}")
        else:
            self.log_result("GET /api/folders?folderType=text", False, 
                          f"Request failed (status {status_code}): {data}")
    
    def test_folders_post_link_folder(self):
        """Test POST /api/folders - create link folder"""
        print("\n=== Testing Folders API - POST Link Folder ===")
        
        test_data = {
            "name": "Test Link Folder",
            "folderType": "link"
        }
        
        success, data, status_code = self.make_request('POST', '/api/folders', test_data)
        
        if success:
            if isinstance(data, dict) and data.get('success') and data.get('data'):
                folder_data = data['data']
                folder_id = folder_data.get('id')
                
                # Verify the created folder has correct properties
                if (folder_data.get('folderType', 'link') == 'link' and 
                    folder_data.get('name') == test_data['name'] and
                    folder_id):
                    
                    self.created_items.append(('folder', folder_id))
                    self.log_result("POST /api/folders (link)", True, 
                                  f"Link folder created successfully with ID: {folder_id}")
                    return folder_id
                else:
                    self.log_result("POST /api/folders (link)", False, 
                                  f"Folder created but missing expected properties: {folder_data}")
            else:
                self.log_result("POST /api/folders (link)", False, 
                              f"Unexpected response format: {data}")
        else:
            self.log_result("POST /api/folders (link)", False, 
                          f"Request failed (status {status_code}): {data}")
        
        return None
    
    def test_folders_post_text_folder(self):
        """Test POST /api/folders - create text folder"""
        print("\n=== Testing Folders API - POST Text Folder ===")
        
        test_data = {
            "name": "Test Text Folder",
            "folderType": "text"
        }
        
        success, data, status_code = self.make_request('POST', '/api/folders', test_data)
        
        if success:
            if isinstance(data, dict) and data.get('success') and data.get('data'):
                folder_data = data['data']
                folder_id = folder_data.get('id')
                
                # Verify the created folder has correct properties
                if (folder_data.get('folderType') == 'text' and 
                    folder_data.get('name') == test_data['name'] and
                    folder_id):
                    
                    self.created_items.append(('folder', folder_id))
                    self.log_result("POST /api/folders (text)", True, 
                                  f"Text folder created successfully with ID: {folder_id}")
                    return folder_id
                else:
                    self.log_result("POST /api/folders (text)", False, 
                                  f"Folder created but missing expected properties: {folder_data}")
            else:
                self.log_result("POST /api/folders (text)", False, 
                              f"Unexpected response format: {data}")
        else:
            self.log_result("POST /api/folders (text)", False, 
                          f"Request failed (status {status_code}): {data}")
        
        return None
    
    def test_folders_delete(self, folder_id: str):
        """Test DELETE /api/folders - delete folder"""
        print("\n=== Testing Folders API - DELETE ===")
        
        if not folder_id:
            self.log_result("DELETE /api/folders", False, "No folder ID provided for delete test")
            return
        
        success, data, status_code = self.make_request('DELETE', '/api/folders', params={'id': folder_id})
        
        if success:
            if isinstance(data, dict) and data.get('success'):
                self.log_result("DELETE /api/folders", True, f"Folder deleted successfully: {folder_id}")
                # Remove from created_items since it's deleted
                self.created_items = [(t, i) for t, i in self.created_items if i != folder_id]
            else:
                self.log_result("DELETE /api/folders", False, f"Unexpected response: {data}")
        else:
            self.log_result("DELETE /api/folders", False, 
                          f"Request failed (status {status_code}): {data}")
    
    def test_folders_delete_default_protection(self):
        """Test that default folders cannot be deleted"""
        print("\n=== Testing Folders API - Default Folder Protection ===")
        
        # First get all folders to find a default one
        success, data, status_code = self.make_request('GET', '/api/folders')
        
        if not success or not isinstance(data, list):
            self.log_result("DELETE default folder protection", False, 
                          "Could not retrieve folders to test default protection")
            return
        
        # Find a default folder
        default_folder = None
        for folder in data:
            if folder.get('isDefault'):
                default_folder = folder
                break
        
        if not default_folder:
            self.log_result("DELETE default folder protection", False, 
                          "No default folder found to test protection")
            return
        
        # Try to delete the default folder
        folder_id = default_folder['id']
        success, response_data, status_code = self.make_request('DELETE', '/api/folders', params={'id': folder_id})
        
        # This should fail
        if not success or (isinstance(response_data, dict) and 'error' in response_data):
            self.log_result("DELETE default folder protection", True, 
                          f"Default folder protection working: {response_data}")
        else:
            self.log_result("DELETE default folder protection", False, 
                          f"Default folder was deleted when it shouldn't be: {response_data}")
    
    def cleanup_created_items(self):
        """Clean up any items created during testing"""
        print("\n=== Cleaning up test data ===")
        
        for item_type, item_id in self.created_items:
            try:
                if item_type == 'link' or item_type == 'note':
                    self.make_request('DELETE', '/api/links', params={'id': item_id})
                elif item_type == 'folder':
                    self.make_request('DELETE', '/api/folders', params={'id': item_id})
                print(f"Cleaned up {item_type}: {item_id}")
            except Exception as e:
                print(f"Failed to cleanup {item_type} {item_id}: {e}")
        
        self.created_items = []
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Memor.ia Backend API Tests")
        print(f"Base URL: {self.base_url}")
        print("=" * 60)
        
        try:
            # Test Links API
            self.test_links_get_all()
            
            # Create items for testing updates and deletes
            link_id = self.test_links_post_link()
            note_id = self.test_links_post_note()
            
            # Test updates
            if link_id:
                self.test_links_patch(link_id)
            
            # Test Folders API
            self.test_folders_get_all()
            self.test_folders_get_by_type()
            
            # Create folders for testing
            link_folder_id = self.test_folders_post_link_folder()
            text_folder_id = self.test_folders_post_text_folder()
            
            # Test default folder protection
            self.test_folders_delete_default_protection()
            
            # Test deletes (do these last)
            if link_id:
                self.test_links_delete(link_id)
            if note_id:
                self.test_links_delete(note_id)
            if link_folder_id:
                self.test_folders_delete(link_folder_id)
            if text_folder_id:
                self.test_folders_delete(text_folder_id)
            
        except Exception as e:
            print(f"❌ Test execution failed: {e}")
        finally:
            # Cleanup any remaining items
            self.cleanup_created_items()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "No tests run")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)

def main():
    """Main test execution"""
    tester = MemoriaAPITester(BASE_URL)
    tester.run_all_tests()

if __name__ == "__main__":
    main()