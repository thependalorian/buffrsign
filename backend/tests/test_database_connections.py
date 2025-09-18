#!/usr/bin/env python3
"""
Database Connection Test Script for BuffrSign
Tests Neo4j, Neon PostgreSQL, and Supabase connections
Located in backend/tests/ directory
"""

import os
import sys
import asyncio
from datetime import datetime
from pathlib import Path

# Add the project root to the path to access .env.local
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Neo4j imports
try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    print("⚠️  Neo4j driver not installed. Install with: pip install neo4j")

# PostgreSQL imports
try:
    import asyncpg
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    print("⚠️  asyncpg not installed. Install with: pip install asyncpg")

def load_env_vars():
    """Load environment variables from .env.local"""
    env_file = project_root / ".env.local"
    if not env_file.exists():
        print(f"❌ Environment file {env_file} not found!")
        return False
    
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value
    
    return True

def get_database_urls():
    """Extract all database URLs from .env.local"""
    env_file = project_root / ".env.local"
    database_urls = {}
    
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('DATABASE_URL='):
                database_urls['DATABASE_URL'] = line.split('=', 1)[1]
            elif line.startswith('SUPABASE_DATABASE_URL='):
                database_urls['SUPABASE_DATABASE_URL'] = line.split('=', 1)[1]
            elif line.startswith('NEON_DATABASE_URL='):
                database_urls['NEON_DATABASE_URL'] = line.split('=', 1)[1]
    
    return database_urls

def test_neo4j_connection():
    """Test Neo4j connection with better error handling"""
    if not NEO4J_AVAILABLE:
        return False, "Neo4j driver not available"
    
    try:
        # Get Neo4j credentials from environment
        neo4j_uri = os.getenv('NEO4J_URI')
        neo4j_user = os.getenv('NEO4J_USERNAME')
        neo4j_password = os.getenv('NEO4J_PASSWORD')
        
        if not all([neo4j_uri, neo4j_user, neo4j_password]):
            return False, "Missing Neo4j credentials in environment"
        
        print(f"🔗 Testing Neo4j connection to: {neo4j_uri}")
        
        # Create driver and test connection
        driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        
        # Test connection with a simple query
        with driver.session() as session:
            result = session.run("RETURN 1 as test")
            record = result.single()
            if record and record["test"] == 1:
                print("✅ Neo4j connection successful!")
                
                # Get database info
                try:
                    version_result = session.run("CALL dbms.components() YIELD name, versions, edition")
                    version_record = version_result.single()
                    if version_record:
                        print(f"   📊 Neo4j Version: {version_record['versions'][0]}")
                        print(f"   🏢 Edition: {version_record['edition']}")
                except Exception as e:
                    print(f"   ⚠️  Could not get version info: {str(e)}")
                
                driver.close()
                return True, "Neo4j connection successful"
            else:
                driver.close()
                return False, "Neo4j test query failed"
                
    except Exception as e:
        error_msg = str(e)
        if "Unable to retrieve routing information" in error_msg:
            return False, "Neo4j routing error - check if the database is accessible and credentials are correct"
        elif "authentication" in error_msg.lower():
            return False, "Neo4j authentication failed - check username and password"
        elif "connection" in error_msg.lower():
            return False, "Neo4j connection failed - check URI and network connectivity"
        else:
            return False, f"Neo4j connection failed: {error_msg}"

async def test_database_connection(database_url, name):
    """Test a specific database connection"""
    if not POSTGRES_AVAILABLE:
        return False, "asyncpg not available"
    
    try:
        print(f"🔗 Testing {name} connection...")
        
        # Test connection
        conn = await asyncpg.connect(database_url)
        
        # Test with a simple query
        result = await conn.fetchval('SELECT 1 as test')
        if result == 1:
            print(f"✅ {name} connection successful!")
            
            # Get database info
            version = await conn.fetchval('SELECT version()')
            print(f"   📊 PostgreSQL Version: {version.split()[1]}")
            
            # Get database name
            db_name = await conn.fetchval('SELECT current_database()')
            print(f"   🗄️  Database: {db_name}")
            
            # Get connection info
            host = await conn.fetchval('SELECT inet_server_addr()')
            port = await conn.fetchval('SELECT inet_server_port()')
            if host:
                print(f"   🌐 Host: {host}:{port}")
            
            await conn.close()
            return True, f"{name} connection successful"
        else:
            await conn.close()
            return False, f"{name} test query failed"
            
    except Exception as e:
        error_msg = str(e)
        if "authentication" in error_msg.lower():
            return False, f"{name} authentication failed - check credentials"
        elif "connection" in error_msg.lower():
            return False, f"{name} connection failed - check URL and network"
        else:
            return False, f"{name} connection failed: {error_msg}"

def test_supabase_client():
    """Test Supabase client configuration"""
    try:
        # Get Supabase credentials from environment
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not all([supabase_url, supabase_anon_key]):
            return False, "Missing Supabase credentials in environment"
        
        print(f"🔗 Testing Supabase client configuration...")
        print(f"   🌐 URL: {supabase_url}")
        print(f"   🔑 Anon Key: {supabase_anon_key[:20]}...")
        
        # Check if the URL is valid
        if 'supabase.co' in supabase_url:
            print("✅ Supabase URL format is valid")
            return True, "Supabase client configuration is valid"
        else:
            return False, "Supabase URL format is invalid"
            
    except Exception as e:
        return False, f"Supabase client test failed: {str(e)}"

async def main():
    """Main test function"""
    print("🚀 BuffrSign Database Connection Test (Backend Tests)")
    print("=" * 70)
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Test location: {__file__}")
    print()
    
    # Load environment variables
    if not load_env_vars():
        print("❌ Failed to load environment variables")
        return
    
    # Get all database URLs
    database_urls = get_database_urls()
    print(f"📋 Found {len(database_urls)} database URL(s) in .env.local")
    for key, url in database_urls.items():
        print(f"   • {key}: {url[:50]}...")
    print()
    
    # Test Neo4j
    print("1️⃣ Testing Neo4j Connection...")
    neo4j_success, neo4j_message = test_neo4j_connection()
    if neo4j_success:
        print(f"   ✅ {neo4j_message}")
    else:
        print(f"   ❌ {neo4j_message}")
    
    # Test each database URL
    db_results = []
    test_number = 2
    
    # Test default DATABASE_URL
    if 'DATABASE_URL' in database_urls:
        print(f"\n{test_number}️⃣ Testing Default Database URL...")
        success, message = await test_database_connection(database_urls['DATABASE_URL'], "Default Database")
        db_results.append((success, message, "Default Database"))
        if success:
            print(f"   ✅ {message}")
        else:
            print(f"   ❌ {message}")
        test_number += 1
    
    # Test Supabase database URL
    if 'SUPABASE_DATABASE_URL' in database_urls:
        print(f"\n{test_number}️⃣ Testing Supabase Database URL...")
        success, message = await test_database_connection(database_urls['SUPABASE_DATABASE_URL'], "Supabase PostgreSQL")
        db_results.append((success, message, "Supabase PostgreSQL"))
        if success:
            print(f"   ✅ {message}")
        else:
            print(f"   ❌ {message}")
        test_number += 1
    
    # Test Neon database URL
    if 'NEON_DATABASE_URL' in database_urls:
        print(f"\n{test_number}️⃣ Testing Neon Database URL...")
        success, message = await test_database_connection(database_urls['NEON_DATABASE_URL'], "Neon PostgreSQL")
        db_results.append((success, message, "Neon PostgreSQL"))
        if success:
            print(f"   ✅ {message}")
        else:
            print(f"   ❌ {message}")
        test_number += 1
    
    # Test Supabase client
    print(f"\n{test_number}️⃣ Testing Supabase Client Configuration...")
    supabase_success, supabase_message = test_supabase_client()
    if supabase_success:
        print(f"   ✅ {supabase_message}")
    else:
        print(f"   ❌ {supabase_message}")
    
    # Summary
    print("\n📊 Connection Test Summary")
    print("=" * 70)
    print(f"Neo4j: {'✅ PASS' if neo4j_success else '❌ FAIL'}")
    
    for success, message, name in db_results:
        print(f"{name}: {'✅ PASS' if success else '❌ FAIL'}")
    
    print(f"Supabase Client: {'✅ PASS' if supabase_success else '❌ FAIL'}")
    
    # Overall status
    all_success = neo4j_success and supabase_success and all(success for success, _, _ in db_results)
    
    if all_success:
        print("\n🎉 All database connections successful!")
    else:
        print("\n⚠️  Some connections failed. Check the error messages above.")
        
        # Provide troubleshooting tips
        print("\n🔧 Troubleshooting Tips:")
        if not neo4j_success:
            print("   • Neo4j: Check if the database is running and accessible")
            print("   • Neo4j: Verify credentials and network connectivity")
        if not supabase_success:
            print("   • Supabase: Verify URL and API key format")
        if not all(success for success, _, _ in db_results):
            print("   • PostgreSQL: Check database URLs and credentials")
            print("   • PostgreSQL: Verify network connectivity and SSL settings")

if __name__ == "__main__":
    asyncio.run(main())
