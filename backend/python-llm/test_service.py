"""
Test script for Python LLM Career Service
Run this after starting the service to verify all endpoints work correctly
"""

import requests
import json
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"{Fore.CYAN}{title}{Style.RESET_ALL}")
    print(f"{'='*60}\n")

def test_health_check():
    """Test health check endpoint"""
    print_section("1. Testing Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Health check passed")
            print(f"  Status: {data['status']}")
            print(f"  Service: {data['service']}")
            print(f"  Version: {data['version']}")
            return True
        else:
            print(f"{Fore.RED}✗{Style.RESET_ALL} Health check failed")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗{Style.RESET_ALL} Health check error: {e}")
        return False

def test_generate_paths_10th():
    """Test generating paths for 10th standard"""
    print_section("2. Testing Career Paths Generation (10th)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-paths",
            json={"educationLevel": "10th"}
        )
        
        if response.status_code == 200:
            data = response.json()
            nodes = data['data']['nodes']
            analysis = data['data']['analysis']
            
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Generated {len(nodes)} career paths")
            print(f"\n{Fore.YELLOW}Analysis Summary:{Style.RESET_ALL}")
            print(f"  Total paths: {analysis['total_paths']}")
            print(f"  Categories: {list(analysis['categories'].keys())}")
            print(f"  High demand paths: {len(analysis['demand_analysis']['high_demand_paths'])}")
            
            print(f"\n{Fore.YELLOW}Sample Paths:{Style.RESET_ALL}")
            for i, node in enumerate(nodes[:3], 1):
                print(f"  {i}. {node['label']} ({node['category']})")
                print(f"     Demand: {node['demand']}, Growth: {node['metadata']['growthRate']}%")
            
            return True
        else:
            print(f"{Fore.RED}✗{Style.RESET_ALL} Failed with status {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗{Style.RESET_ALL} Error: {e}")
        return False

def test_generate_paths_12th_with_preferences():
    """Test generating paths for 12th with preferences"""
    print_section("3. Testing Career Paths with Preferences (12th)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/generate-paths",
            json={
                "educationLevel": "12th",
                "preferences": {
                    "high_demand": True,
                    "high_salary": True,
                    "interests": ["Programming", "Mathematics"]
                }
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            nodes = data['data']['nodes']
            analysis = data['data']['analysis']
            
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Generated {len(nodes)} career paths with preferences")
            
            if analysis['recommendations']:
                print(f"\n{Fore.YELLOW}Top Recommendations:{Style.RESET_ALL}")
                for i, rec in enumerate(analysis['recommendations'][:3], 1):
                    score = rec.get('match_score', 'N/A')
                    print(f"  {i}. {rec['label']} (Match: {score}%)")
            
            return True
        else:
            print(f"{Fore.RED}✗{Style.RESET_ALL} Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗{Style.RESET_ALL} Error: {e}")
        return False

def test_career_details():
    """Test getting career details"""
    print_section("4. Testing Career Details")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/career-details/12th-engineering-jee"
        )
        
        if response.status_code == 200:
            data = response.json()
            details = data['data']['details']
            
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Retrieved career details")
            print(f"\n{Fore.YELLOW}Career: {data['data']['node']['label']}{Style.RESET_ALL}")
            print(f"\n{Fore.YELLOW}Details:{Style.RESET_ALL}")
            print(f"  Description: {details['detailedDescription'][:100]}...")
            print(f"  Skills: {len(details['technicalSkills'])} technical, {len(details['softSkills'])} soft")
            print(f"  Salary: {details['salaryRange']}")
            print(f"  Growth Opportunities: {len(details['growthOpportunities'])}")
            print(f"  Top Recruiters: {len(details['topRecruiters'])}")
            
            return True
        else:
            print(f"{Fore.RED}✗{Style.RESET_ALL} Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗{Style.RESET_ALL} Error: {e}")
        return False

def test_expand_node():
    """Test expanding a node"""
    print_section("5. Testing Node Expansion")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/expand-node/10th-puc-science",
            json={}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"{Fore.GREEN}✓{Style.RESET_ALL} Node expanded successfully")
            print(f"  Parent: {data['data']['parentNode']['label']}")
            print(f"  Children: {len(data['data']['children'])}")
            return True
        else:
            print(f"{Fore.RED}✗{Style.RESET_ALL} Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"{Fore.RED}✗{Style.RESET_ALL} Error: {e}")
        return False

def test_all_education_levels():
    """Test all education levels"""
    print_section("6. Testing All Education Levels")
    
    levels = ["10th", "12th", "Diploma", "Degree", "ITI", "Certificate"]
    results = {}
    
    for level in levels:
        try:
            response = requests.post(
                f"{BASE_URL}/api/generate-paths",
                json={"educationLevel": level}
            )
            
            if response.status_code == 200:
                data = response.json()
                count = len(data['data']['nodes'])
                results[level] = count
                print(f"{Fore.GREEN}✓{Style.RESET_ALL} {level}: {count} paths")
            else:
                print(f"{Fore.RED}✗{Style.RESET_ALL} {level}: Failed")
                results[level] = 0
        except Exception as e:
            print(f"{Fore.RED}✗{Style.RESET_ALL} {level}: {e}")
            results[level] = 0
    
    print(f"\n{Fore.YELLOW}Summary:{Style.RESET_ALL}")
    total = sum(results.values())
    print(f"  Total career paths available: {total}")
    
    return all(v > 0 for v in results.values())

def main():
    """Run all tests"""
    print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}Python LLM Career Service - Test Suite{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
    print(f"\nTesting service at: {BASE_URL}\n")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check()))
    results.append(("Generate Paths (10th)", test_generate_paths_10th()))
    results.append(("Generate Paths with Preferences", test_generate_paths_12th_with_preferences()))
    results.append(("Career Details", test_career_details()))
    results.append(("Node Expansion", test_expand_node()))
    results.append(("All Education Levels", test_all_education_levels()))
    
    # Print summary
    print_section("Test Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Fore.GREEN}✓ PASSED{Style.RESET_ALL}" if result else f"{Fore.RED}✗ FAILED{Style.RESET_ALL}"
        print(f"{status} - {name}")
    
    print(f"\n{'='*60}")
    print(f"{Fore.CYAN}Results: {passed}/{total} tests passed{Style.RESET_ALL}")
    print(f"{'='*60}\n")
    
    if passed == total:
        print(f"{Fore.GREEN}All tests passed! Service is working correctly.{Style.RESET_ALL}\n")
        return 0
    else:
        print(f"{Fore.RED}Some tests failed. Please check the service.{Style.RESET_ALL}\n")
        return 1

if __name__ == "__main__":
    exit(main())
