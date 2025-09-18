# BuffrSign Backend Tests

This directory contains test scripts for the BuffrSign backend services.

## Database Connection Tests

### Running Database Connection Tests

```bash
# From the project root directory
cd backend/tests
python3 test_database_connections.py
```

### What the Test Checks

The database connection test verifies connectivity to:

1. **Neo4j Database** - Graph database for knowledge graphs
2. **Neon PostgreSQL** - Primary PostgreSQL database
3. **Supabase PostgreSQL** - Secondary PostgreSQL database
4. **Supabase Client** - Frontend client configuration

### Expected Results

**Working Connections:**
- ✅ Neon PostgreSQL (Primary database)
- ✅ Default Database (Same as Neon)
- ✅ Supabase Client (Frontend operations)

**Known Issues:**
- ❌ Neo4j (Instance likely paused - see NEO4J_FIX_INSTRUCTIONS.md)
- ❌ Supabase PostgreSQL (DNS resolution error - project likely paused)

### Troubleshooting

#### Neo4j Connection Issues
- Check if the Neo4j Aura instance is running
- Go to https://console.neo4j.io
- Find instance `d9bc8b4b` and start it if paused
- Wait 60 seconds after starting

#### Supabase Connection Issues
- Check if the Supabase project is active
- Go to https://supabase.com/dashboard
- Verify project `xndxotoouiabmodzklcf` is not paused
- Update connection strings if needed

### Dependencies

Make sure you have the required packages installed:

```bash
pip install neo4j asyncpg
```

### Environment Variables

The test reads from `.env.local` in the project root. Ensure these variables are set:

```bash
# Neo4j
NEO4J_URI=neo4j+s://d9bc8b4b.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# Database URLs
DATABASE_URL=postgresql://...
SUPABASE_DATABASE_URL=postgresql://...
NEON_DATABASE_URL=postgresql://...

# Supabase Client
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Development Status

**Status:** ✅ **Ready for Development**

The application can start development immediately using:
- Neon PostgreSQL as the primary database
- Supabase Client for frontend operations

The failing connections (Neo4j and Supabase PostgreSQL) can be addressed as needed but don't block development progress.
