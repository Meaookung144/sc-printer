from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import platform
import json
from typing import List, Dict
import os
from pydantic import BaseModel

app = FastAPI(title="MWIT Printer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PrintSettings(BaseModel):
    copies: int = 1
    isDraft: bool = False
    isColor: bool = False
    orientation: str = "portrait"
    pages: str = "all"
    printerId: str

class PrintJob(BaseModel):
    fileName: str
    filePath: str
    settings: PrintSettings
    userId: str

class Printer(BaseModel):
    id: str
    name: str
    isOnline: bool
    driverName: str = None

def get_printers_windows() -> List[Dict]:
    """Get available printers on Windows"""
    try:
        result = subprocess.run([
            'powershell', '-Command',
            'Get-Printer | ConvertTo-Json'
        ], capture_output=True, text=True, check=True)
        
        printers_data = json.loads(result.stdout)
        if not isinstance(printers_data, list):
            printers_data = [printers_data]
        
        printers = []
        for printer in printers_data:
            printers.append({
                'id': printer['Name'],
                'name': printer['Name'],
                'isOnline': printer['PrinterStatus'] == 'Normal',
                'driverName': printer.get('DriverName', '')
            })
        return printers
    except Exception as e:
        print(f"Error getting Windows printers: {e}")
        return []

def get_printers_unix() -> List[Dict]:
    """Get available printers on Unix-like systems"""
    try:
        result = subprocess.run(['lpstat', '-p'], capture_output=True, text=True, check=True)
        printers = []
        
        for line in result.stdout.split('\n'):
            if line.startswith('printer'):
                parts = line.split()
                if len(parts) >= 2:
                    name = parts[1]
                    is_online = 'disabled' not in line and 'offline' not in line
                    printers.append({
                        'id': name,
                        'name': name,
                        'isOnline': is_online,
                        'driverName': None
                    })
        return printers
    except Exception as e:
        print(f"Error getting Unix printers: {e}")
        return []

def get_printers_macos() -> List[Dict]:
    """Get available printers on macOS"""
    try:
        result = subprocess.run(['lpstat', '-p'], capture_output=True, text=True, check=True)
        printers = []
        
        for line in result.stdout.split('\n'):
            if line.startswith('printer'):
                parts = line.split()
                if len(parts) >= 2:
                    name = parts[1]
                    is_online = 'disabled' not in line and 'offline' not in line
                    printers.append({
                        'id': name,
                        'name': name,
                        'isOnline': is_online,
                        'driverName': None
                    })
        return printers
    except Exception as e:
        print(f"Error getting macOS printers: {e}")
        return []

@app.get("/printers")
async def get_printers():
    """Get all available printers"""
    system = platform.system().lower()
    
    if system == "windows":
        printers = get_printers_windows()
    elif system == "darwin":
        printers = get_printers_macos()
    else:
        printers = get_printers_unix()
    
    return {"printers": printers}

@app.post("/print")
async def print_document(job: PrintJob):
    """Send document to printer"""
    try:
        if not os.path.exists(job.filePath):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Build print command based on OS
        system = platform.system().lower()
        
        if system == "windows":
            await print_windows(job)
        elif system == "darwin":
            await print_macos(job)
        else:
            await print_unix(job)
        
        return {"success": True, "message": "Print job sent successfully"}
    
    except Exception as e:
        print(f"Print error: {e}")
        raise HTTPException(status_code=500, detail=f"Print failed: {str(e)}")

async def print_windows(job: PrintJob):
    """Print on Windows using PowerShell"""
    cmd = [
        'powershell', '-Command',
        f'Start-Process -FilePath "{job.filePath}" -Verb Print -WindowStyle Hidden'
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Windows print failed: {result.stderr}")

async def print_macos(job: PrintJob):
    """Print on macOS using lpr"""
    cmd = ['lpr']
    
    # Add printer selection
    if job.settings.printerId:
        cmd.extend(['-P', job.settings.printerId])
    
    # Add number of copies
    if job.settings.copies > 1:
        cmd.extend(['-#', str(job.settings.copies)])
    
    # Add orientation
    if job.settings.orientation == 'landscape':
        cmd.extend(['-o', 'landscape'])
    
    # Add color/grayscale
    if not job.settings.isColor:
        cmd.extend(['-o', 'ColorModel=Gray'])
    
    # Add draft mode
    if job.settings.isDraft:
        cmd.extend(['-o', 'print-quality=3'])  # Draft quality
    
    # Add page range
    if job.settings.pages and job.settings.pages != 'all':
        cmd.extend(['-o', f'page-ranges={job.settings.pages}'])
    
    cmd.append(job.filePath)
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"macOS print failed: {result.stderr}")

async def print_unix(job: PrintJob):
    """Print on Unix-like systems using lpr"""
    cmd = ['lpr']
    
    # Add printer selection
    if job.settings.printerId:
        cmd.extend(['-P', job.settings.printerId])
    
    # Add number of copies
    if job.settings.copies > 1:
        cmd.extend(['-#', str(job.settings.copies)])
    
    # Add orientation
    if job.settings.orientation == 'landscape':
        cmd.extend(['-o', 'landscape'])
    
    # Add color/grayscale
    if not job.settings.isColor:
        cmd.extend(['-o', 'ColorModel=Gray'])
    
    # Add draft mode
    if job.settings.isDraft:
        cmd.extend(['-o', 'print-quality=3'])
    
    # Add page range
    if job.settings.pages and job.settings.pages != 'all':
        cmd.extend(['-o', f'page-ranges={job.settings.pages}'])
    
    cmd.append(job.filePath)
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Unix print failed: {result.stderr}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)