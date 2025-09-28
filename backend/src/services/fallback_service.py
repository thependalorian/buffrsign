# backend/services/fallback_service.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import asyncio
import os

app = FastAPI(title="Buffr Fallback API", version="1.0.0")

class FallbackService:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    async def execute_query(self, query: str, params: list):
        # Placeholder for actual database execution logic
        # In a real scenario, this would connect to PostgreSQL (Neon/Supabase)
        # using an async driver like asyncpg or psycopg2-binary with asyncio
        print(f"Executing query: {query} with params: {params}")
        # Simulate database response
        await asyncio.sleep(0.1) # Simulate async operation
        return {"message": "Query executed successfully (fallback simulation)"}

    async def create_loan(self, loan_data: Dict[str, Any]):
        """Fallback loan creation via Python backend"""
        try:
            query = """
            INSERT INTO loans (customer_id, amount, interest_rate, term_months, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """
            result = await self.execute_query(query, [
                loan_data['customer_id'],
                loan_data['amount'],
                loan_data['interest_rate'],
                loan_data['term_months'],
                'pending'
            ])
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def create_document(self, document_data: Dict[str, Any]):
        """Fallback document creation via Python backend"""
        try:
            query = """
            INSERT INTO documents (title, content, status, created_by)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """
            result = await self.execute_query(query, [
                document_data['title'],
                document_data['content'],
                document_data['status'],
                document_data['created_by']
            ])
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def create_room_reservation(self, reservation_data: Dict[str, Any]):
        """Fallback room reservation via Python backend"""
        try:
            query = """
            INSERT INTO room_reservations (customer_id, room_id, check_in_date, check_out_date, total_amount)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """
            result = await self.execute_query(query, [
                reservation_data['customer_id'],
                reservation_data['room_id'],
                reservation_data['check_in_date'],
                reservation_data['check_out_date'],
                reservation_data['total_amount']
            ])
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# API endpoints for fallback operations
@app.post("/api/create_loan")
async def create_loan_endpoint(loan_data: Dict[str, Any]):
    service = FallbackService()
    return await service.create_loan(loan_data)

@app.post("/api/create_document")
async def create_document_endpoint(document_data: Dict[str, Any]):
    service = FallbackService()
    return await service.create_document(document_data)

@app.post("/api/create_room_reservation")
async def create_room_reservation_endpoint(reservation_data: Dict[str, Any]):
    service = FallbackService()
    return await service.create_room_reservation(reservation_data)
